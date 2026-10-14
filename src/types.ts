/**
 * Core Data Models and Types for CHEMPOINT Coaching Institute E-Learning Platform
 * "Where Concepts Click."
 * Structured for smooth cloud persistence (Firebase / Cloud Storage / Firestore) integration.
 */

export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  batch_name?: string;
  target_exam?: string;
  roll_number?: string;
  created_at: string;
}

export interface AuthSession {
  user: UserProfile;
  token: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  target_class: string;
  thumbnail_url: string;
  is_published: boolean;
  instructor_name: string;
  created_at: string;
  subjects?: Subject[];
  subjects_count?: number;
  chapters_count?: number;
  lessons_count?: number;
  enrolled_students_count?: number;
  // Progress for student view
  progress_percentage?: number;
  is_enrolled?: boolean;
}

export interface Subject {
  id: string;
  course_id: string;
  title: string;
  code: string;
  color: string; // Tailwind color or hex
  icon_name: string;
  sort_order: number;
  chapters?: Chapter[];
  chapters_count?: number;
  lessons_count?: number;
}

export interface Chapter {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  chapter_number: number;
  estimated_hours: number;
  lessons?: Lesson[];
  lessons_count?: number;
  completed_lessons_count?: number;
}

export interface StudyMaterial {
  id: string;
  lesson_id?: string;
  title: string;
  type: 'file' | 'link';
  file_name?: string;
  file_type?: string; // 'pdf' | 'png' | 'jpg' | 'doc' | 'ppt' | etc.
  file_size?: string;
  url: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  description: string;
  duration_minutes: number;
  lesson_order: number;
  is_published: boolean;
  video_url: string;
  video_title?: string;
  video_source_type: 'youtube' | 'direct' | 'vimeo' | 'upload';
  video_file_name?: string;
  video_file_size?: string;
  study_materials?: StudyMaterial[];
  // Legacy / fallback PDF support
  pdf_url?: string;
  pdf_name?: string;
  pdf_pages?: number;
  pdf_size_mb?: number;
  pdf_notes_content?: string;
  created_at: string;
  is_completed?: boolean;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  status: 'active' | 'suspended';
  user?: UserProfile;
  course?: Course;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  last_watched_second: number;
  completed_at: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  course_id: string | null; // null for institute-wide
  course_title?: string;
  author_name: string;
  priority: 'normal' | 'urgent' | 'highlight';
  created_at: string;
}

export interface AdminStats {
  total_students: number;
  total_courses: number;
  total_subjects: number;
  total_chapters: number;
  total_lessons: number;
  total_enrollments: number;
  average_completion_rate: number;
  active_students_today: number;
}
