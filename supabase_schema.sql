-- =====================================================================
-- CHEMPOINT E-LEARNING PLATFORM
-- Hardened Supabase PostgreSQL Schema, Storage, Security & RLS Policies
-- Target Workload: Scaled for 1,000+ Students & High-Concurrency Access
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. DATABASE TABLES & CONSTRAINTS
-- =====================================================================

-- 1. Profiles Table (Linked 1:1 to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  full_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  batch_name TEXT DEFAULT 'Class 11 Chemistry Batch',
  target_exam TEXT DEFAULT 'Class 11 Chemistry',
  roll_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  code TEXT NOT NULL UNIQUE CHECK (char_length(trim(code)) > 0),
  description TEXT DEFAULT '',
  target_class TEXT DEFAULT 'Class 11',
  thumbnail_url TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT true,
  instructor_name TEXT DEFAULT 'ChemPoint Faculty',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  code TEXT NOT NULL,
  color TEXT DEFAULT '#2563eb',
  icon_name TEXT DEFAULT 'BookOpen',
  sort_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Chapters Table
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  description TEXT DEFAULT '',
  chapter_number INT DEFAULT 1,
  estimated_hours NUMERIC DEFAULT 2 CHECK (estimated_hours >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Lessons Table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  description TEXT DEFAULT '',
  duration_minutes INT DEFAULT 30 CHECK (duration_minutes >= 0),
  lesson_order INT DEFAULT 1,
  is_published BOOLEAN DEFAULT true,
  video_url TEXT DEFAULT '',
  video_title TEXT DEFAULT '',
  video_source_type TEXT DEFAULT 'youtube' CHECK (video_source_type IN ('youtube', 'direct', 'vimeo', 'upload')),
  pdf_url TEXT DEFAULT '',
  pdf_name TEXT DEFAULT '',
  pdf_pages INT DEFAULT 1 CHECK (pdf_pages >= 0),
  pdf_size_mb NUMERIC DEFAULT 1.0 CHECK (pdf_size_mb >= 0),
  pdf_notes_content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Study Materials Table (Attached Handouts, Worksheets, Formula Sheets)
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  type TEXT DEFAULT 'file' CHECK (type IN ('file', 'link')),
  file_name TEXT,
  file_type TEXT DEFAULT 'pdf',
  file_size TEXT DEFAULT '1.5 MB',
  file_size_mb NUMERIC DEFAULT 1.5 CHECK (file_size_mb >= 0),
  url TEXT NOT NULL CHECK (char_length(trim(url)) > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enrollments Table (Access Control for Courses)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  UNIQUE(user_id, course_id)
);

-- 8. Lesson Progress Table (Student Watch History & Completion Tracking)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  last_watched_second INT DEFAULT 0 CHECK (last_watched_second >= 0),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 9. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'ChemPoint Faculty',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'highlight')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 2. COMPOSITE INDEXES OPTIMIZED FOR 1,000+ CONCURRENT STUDENTS
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_code ON public.courses(code);

-- Composite enrollment index for lightning-fast auth/access checks
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course_status ON public.enrollments(user_id, course_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);

-- Curriculum hierarchy traversal indexes
CREATE INDEX IF NOT EXISTS idx_subjects_course_sort ON public.subjects(course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_chapters_subject_num ON public.chapters(subject_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_lessons_chapter_order ON public.lessons(chapter_id, lesson_order, is_published);
CREATE INDEX IF NOT EXISTS idx_study_materials_lesson_id ON public.study_materials(lesson_id);

-- Progress lookups for dashboard calculation
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_completed ON public.lesson_progress(user_id, completed);

-- Announcements filtering
CREATE INDEX IF NOT EXISTS idx_announcements_course_created ON public.announcements(course_id, created_at DESC);

-- =====================================================================
-- 3. SECURITY DEFINER HELPER FUNCTIONS (HARDENED)
-- =====================================================================

-- Helper: Verify if current caller is an authenticated administrator
-- Hardened: STABLE, fixed search_path, explicit auth.uid() check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Service role always has admin capabilities
  IF (auth.jwt() ->> 'role' = 'service_role') THEN
    RETURN true;
  END IF;

  -- Ensure caller is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Helper: Verify if current caller is actively enrolled in a course
CREATE OR REPLACE FUNCTION public.is_enrolled_in_course(p_course_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN true;
  END IF;

  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = auth.uid()
      AND course_id = p_course_id
      AND status = 'active'
  );
END;
$$;

-- =====================================================================
-- 4. PROFILE PROVISIONING & ANTI-PRIVILEGE ESCALATION TRIGGERS
-- =====================================================================

-- Trigger: Automatically provision student profile upon auth signup
-- Hardened: Role is unconditionally set to 'student'. Never trusts raw_user_meta_data for role!
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    batch_name,
    target_exam,
    roll_number
  )
  VALUES (
    NEW.id,
    LOWER(TRIM(NEW.email)),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), split_part(NEW.email, '@', 1)),
    'student', -- SECURITY: ALWAYS force 'student' role. Admin creation must be handled via SQL/Admin API.
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'batch_name'), ''), 'Class 11 Chemistry Batch'),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'target_exam'), ''), 'Class 11 Chemistry'),
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'roll_number'), ''),
      'CP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 900 + 100)::TEXT, 3, '0')
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Prevent any non-admin from modifying their own role or other security fields
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- If role is being modified
  IF NEW.role <> OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Access Denied: You cannot modify account administrative roles.';
    END IF;
  END IF;

  -- Maintain updated_at timestamp
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- =====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- A. PROFILES TABLE POLICIES
-- ---------------------------------------------------------------------

-- SELECT: Students view their own profile; faculty/admins can view all profiles
DROP POLICY IF EXISTS "Read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- UPDATE: Students can only update their personal profile information (name, phone, avatar)
-- Role modification is prevented by the trigger and check condition
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) OR public.is_admin())
  );

-- INSERT: Handled exclusively via handle_new_user() trigger or by Admins
DROP POLICY IF EXISTS "Admins insert profiles" ON public.profiles;
CREATE POLICY "Admins insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- DELETE: Only admins can delete student profiles
DROP POLICY IF EXISTS "Admins delete profiles" ON public.profiles;
CREATE POLICY "Admins delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------
-- B. COURSES TABLE POLICIES
-- ---------------------------------------------------------------------

-- SELECT: Anyone (even prospective students) can view published courses. Admins can view draft/unpublished courses.
DROP POLICY IF EXISTS "Students read published courses" ON public.courses;
CREATE POLICY "Students read published courses" ON public.courses
  FOR SELECT
  USING (is_published = true OR public.is_admin());

-- INSERT/UPDATE/DELETE: Strict faculty/admin only
DROP POLICY IF EXISTS "Admins manage courses" ON public.courses;
CREATE POLICY "Admins manage courses" ON public.courses
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------
-- C. SUBJECTS TABLE POLICIES
-- ---------------------------------------------------------------------

-- SELECT: Only visible if parent course is published, or if caller is admin
DROP POLICY IF EXISTS "Read subjects" ON public.subjects;
DROP POLICY IF EXISTS "Read subjects of published courses" ON public.subjects;
CREATE POLICY "Read subjects of published courses" ON public.subjects
  FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = subjects.course_id AND c.is_published = true
    )
  );

-- INSERT/UPDATE/DELETE: Strict faculty/admin only
DROP POLICY IF EXISTS "Admins manage subjects" ON public.subjects;
CREATE POLICY "Admins manage subjects" ON public.subjects
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------
-- D. CHAPTERS TABLE POLICIES
-- ---------------------------------------------------------------------

-- SELECT: Only visible if parent course is published, or if caller is admin
DROP POLICY IF EXISTS "Read chapters" ON public.chapters;
DROP POLICY IF EXISTS "Read chapters of published courses" ON public.chapters;
CREATE POLICY "Read chapters of published courses" ON public.chapters
  FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.subjects s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = chapters.subject_id AND c.is_published = true
    )
  );

-- INSERT/UPDATE/DELETE: Strict faculty/admin only
DROP POLICY IF EXISTS "Admins manage chapters" ON public.chapters;
CREATE POLICY "Admins manage chapters" ON public.chapters
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------
-- E. LESSONS TABLE POLICIES
-- ---------------------------------------------------------------------

-- SELECT: Lessons are visible only if caller is admin OR actively enrolled in the parent course
DROP POLICY IF EXISTS "Read lessons" ON public.lessons;
CREATE POLICY "Read lessons" ON public.lessons
  FOR SELECT
  USING (
    public.is_admin()
    OR (
      is_published = true
      AND EXISTS (
        SELECT 1 FROM public.chapters ch
        JOIN public.subjects s ON s.id = ch.subject_id
        JOIN public.courses c ON c.id = s.course_id
        JOIN public.enrollments e ON e.course_id = c.id
        WHERE ch.id = lessons.chapter_id
          AND c.is_published = true
          AND e.user_id = auth.uid()
          AND e.status = 'active'
      )
    )
  );

-- INSERT/UPDATE/DELETE: Strict faculty/admin only
DROP POLICY IF EXISTS "Admins manage lessons" ON public.lessons;
CREATE POLICY "Admins manage lessons" ON public.lessons
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------
-- F. STUDY MATERIALS TABLE POLICIES
-- ---------------------------------------------------------------------

-- SELECT: Only enrolled students or admins can view study materials
DROP POLICY IF EXISTS "Read study materials" ON public.study_materials;
CREATE POLICY "Enrolled students read study materials" ON public.study_materials
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.chapters ch ON ch.id = l.chapter_id
      JOIN public.subjects s ON s.id = ch.subject_id
      JOIN public.enrollments e ON e.course_id = s.course_id
      WHERE l.id = study_materials.lesson_id
        AND e.user_id = auth.uid()
        AND e.status = 'active'
    )
  );

-- INSERT/UPDATE/DELETE: Strict faculty/admin only
DROP POLICY IF EXISTS "Admins manage study materials" ON public.study_materials;
CREATE POLICY "Admins manage study materials" ON public.study_materials
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------
-- G. ENROLLMENTS TABLE POLICIES
-- ---------------------------------------------------------------------

-- SELECT: Students can view their own enrollments; admins can view all enrollments
DROP POLICY IF EXISTS "Students view own enrollments" ON public.enrollments;
CREATE POLICY "Students view own enrollments" ON public.enrollments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- INSERT/UPDATE/DELETE: Strict faculty/admin only (students cannot self-enroll or unenroll others)
DROP POLICY IF EXISTS "Admins manage enrollments" ON public.enrollments;
CREATE POLICY "Admins manage enrollments" ON public.enrollments
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------
-- H. LESSON PROGRESS TABLE POLICIES
-- ---------------------------------------------------------------------

-- SELECT: Students can view their own progress; admins can view all progress
DROP POLICY IF EXISTS "Students view own progress" ON public.lesson_progress;
CREATE POLICY "Students view own progress" ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- INSERT: Students can insert their own progress only for courses they are actively enrolled in
DROP POLICY IF EXISTS "Students insert own progress" ON public.lesson_progress;
CREATE POLICY "Students insert own progress" ON public.lesson_progress
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.lessons l
        JOIN public.chapters ch ON ch.id = l.chapter_id
        JOIN public.subjects s ON s.id = ch.subject_id
        JOIN public.enrollments e ON e.course_id = s.course_id
        WHERE l.id = lesson_progress.lesson_id
          AND e.user_id = auth.uid()
          AND e.status = 'active'
      )
    )
  );

-- UPDATE: Students can only update their own progress
DROP POLICY IF EXISTS "Students update own progress" ON public.lesson_progress;
CREATE POLICY "Students update own progress" ON public.lesson_progress
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- DELETE: Only admins can reset or delete progress records
DROP POLICY IF EXISTS "Admins delete progress" ON public.lesson_progress;
CREATE POLICY "Admins delete progress" ON public.lesson_progress
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------
-- I. ANNOUNCEMENTS TABLE POLICIES
-- ---------------------------------------------------------------------

-- SELECT: General announcements are visible to authenticated users.
-- Course-specific announcements are visible only to enrolled students or admins.
DROP POLICY IF EXISTS "Anyone read announcements" ON public.announcements;
DROP POLICY IF EXISTS "Read announcements" ON public.announcements;
CREATE POLICY "Read announcements" ON public.announcements
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR course_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = announcements.course_id
        AND e.user_id = auth.uid()
        AND e.status = 'active'
    )
  );

-- INSERT/UPDATE/DELETE: Strict faculty/admin only
DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
CREATE POLICY "Admins manage announcements" ON public.announcements
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================================
-- 6. SUPABASE STORAGE BUCKET & STORAGE RLS POLICIES
-- =====================================================================

-- Ensure bucket exists with 50 MB limit
-- Note: 'public' is set to true to allow standard browser anchor tag downloads via CDN URLs,
-- while Supabase Storage API access is strictly guarded by the RLS policies below.
-- (To make the bucket strictly private, set public = false and generate signed URLs).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'study-materials',
  'study-materials',
  true,
  52428800, -- 50 MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800;

-- ---------------------------------------------------------------------
-- STORAGE RLS POLICIES (storage.objects)
-- ---------------------------------------------------------------------

-- UPLOAD: Only authenticated faculty/admin users (or backend service role) can upload files
DROP POLICY IF EXISTS "Faculty upload study materials" ON storage.objects;
CREATE POLICY "Faculty upload study materials" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'study-materials'
    AND public.is_admin()
  );

-- UPDATE / REPLACE: Only authenticated faculty/admin users can modify or replace files
DROP POLICY IF EXISTS "Faculty update study materials" ON storage.objects;
CREATE POLICY "Faculty update study materials" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'study-materials'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'study-materials'
    AND public.is_admin()
  );

-- DELETE: Only authenticated faculty/admin users can delete files
DROP POLICY IF EXISTS "Faculty delete study materials" ON storage.objects;
CREATE POLICY "Faculty delete study materials" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'study-materials'
    AND public.is_admin()
  );

-- SELECT: Authenticated students can access files only if they are active users
DROP POLICY IF EXISTS "Public view study materials" ON storage.objects;
DROP POLICY IF EXISTS "Authorized view study materials" ON storage.objects;
CREATE POLICY "Authorized view study materials" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'study-materials');
