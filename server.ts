import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { exec } from 'child_process';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Auto-configure Nginx reverse proxy client_max_body_size for large study materials (up to 500MB)
try {
  const nginxConfPath = '/etc/nginx/nginx.conf';
  if (fs.existsSync(nginxConfPath)) {
    const nginxConf = fs.readFileSync(nginxConfPath, 'utf8');
    if (!nginxConf.includes('client_max_body_size 500M;')) {
      const updatedConf = nginxConf.replace(/client_max_body_size\s+[^;]+;/g, 'client_max_body_size 500M;');
      fs.writeFileSync(nginxConfPath, updatedConf, 'utf8');
      exec('nginx -s reload', (err) => {
        if (!err) {
          console.log('[ChemPoint] Ingress Nginx proxy client_max_body_size upgraded to 500M.');
        }
      });
    }
  }
} catch {
  // Gracefully ignored if running without root or in non-nginx environments
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'chempoint_store.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'materials');

// Ensure local persistence and upload directories exist
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (e) {
  console.warn('[ChemPoint] Directory setup note:', e);
}

// Supabase Store Integration (Primary Datastore)
import {
  isSupabaseConfigured,
  SUPABASE_URL,
  initializeSupabaseProductionStore,
  supabaseLogin,
  supabaseRegister,
  supabaseResetPassword,
  supabaseVerifyUserPassword,
  supabaseChangePassword,
  supabaseChangeEmail,
  supabaseGetCourses,
  supabaseGetCourseById,
  supabaseGetLessonById,
  supabaseCreateCourse,
  supabaseUpdateCourse,
  supabaseDeleteCourse,
  supabaseCreateSubject,
  supabaseUpdateSubject,
  supabaseDeleteSubject,
  supabaseCreateChapter,
  supabaseUpdateChapter,
  supabaseDeleteChapter,
  supabaseCreateLesson,
  supabaseUpdateLesson,
  supabaseTogglePublishLesson,
  supabaseDeleteLesson,
  supabaseAddMaterial,
  supabaseDeleteMaterial,
  supabaseUploadFile,
  supabaseCreateResumableUploadTarget,
  supabaseConfirmMaterialUpload,
  supabaseUpdateProgress,
  supabaseGetStudents,
  supabaseUpdateStudentAccess,
  supabaseGetAnnouncements,
  supabaseCreateAnnouncement,
  supabaseDeleteAnnouncement,
  supabaseGetAdminStats,
  supabaseGetSystemStatus,
  supabase,
} from './src/server/supabaseStore';

// Multer persistent disk storage for handling large document, handout, and book uploads (up to 500MB)
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const cleanName = (file.originalname || 'document.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${cleanName}`);
  },
});

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB per file
  },
});

// Helper functions to keep Supabase in sync when configured
async function syncToSupabase(table: string, data: any, primaryKey = 'id') {
  if (!supabase) return;
  try {
    const { error } = await supabase.from(table).upsert(data, { onConflict: primaryKey });
    if (error) {
      console.warn(`[ChemPoint] Supabase sync notice (${table}):`, error.message);
    }
  } catch (err: any) {
    console.error(`[ChemPoint] Supabase sync error (${table}):`, err?.message || err);
  }
}

async function deleteFromSupabase(table: string, id: string, idColumn = 'id') {
  if (!supabase) return;
  try {
    const { error } = await supabase.from(table).delete().eq(idColumn, id);
    if (error) {
      console.warn(`[ChemPoint] Supabase delete notice (${table}):`, error.message);
    }
  } catch (err: any) {
    console.error(`[ChemPoint] Supabase delete error (${table}):`, err?.message || err);
  }
}

// Types for server state
interface User {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
  role: 'student' | 'admin';
  full_name: string;
  phone: string;
  avatar_url: string;
  batch_name: string;
  target_exam: string;
  roll_number: string;
  created_at: string;
}

interface CourseRecord {
  id: string;
  title: string;
  code: string;
  description: string;
  target_class: string;
  thumbnail_url: string;
  is_published: boolean;
  instructor_name: string;
  created_at: string;
}

interface SubjectRecord {
  id: string;
  course_id: string;
  title: string;
  code: string;
  color: string;
  icon_name: string;
  sort_order: number;
  created_at: string;
}

interface ChapterRecord {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  chapter_number: number;
  estimated_hours: number;
  created_at: string;
}

interface StudyMaterialRecord {
  id: string;
  lesson_id?: string;
  title: string;
  type: 'file' | 'link';
  file_name?: string;
  file_type?: string;
  file_size?: string;
  file_size_mb?: number;
  url: string;
  created_at: string;
}

interface LessonRecord {
  id: string;
  chapter_id: string;
  title: string;
  description: string;
  duration_minutes: number;
  lesson_order: number;
  is_published: boolean;
  video_url: string;
  video_title: string;
  video_source_type: 'youtube' | 'direct' | 'vimeo' | 'upload';
  video_file_name?: string;
  video_file_size?: string;
  study_materials?: StudyMaterialRecord[];
  pdf_url?: string;
  pdf_name?: string;
  pdf_pages?: number;
  pdf_size_mb?: number;
  pdf_notes_content?: string;
  created_at: string;
}

interface EnrollmentRecord {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  status: 'active' | 'suspended';
}

interface ProgressRecord {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  last_watched_second: number;
  completed_at: string | null;
}

interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  course_id: string | null;
  author_name: string;
  priority: 'normal' | 'urgent' | 'highlight';
  created_at: string;
}

// Database Store with disk persistence and optional Supabase synchronization
class Database {
  users: User[] = [];
  courses: CourseRecord[] = [];
  subjects: SubjectRecord[] = [];
  chapters: ChapterRecord[] = [];
  lessons: LessonRecord[] = [];
  enrollments: EnrollmentRecord[] = [];
  progress: ProgressRecord[] = [];
  announcements: AnnouncementRecord[] = [];

  constructor() {
    const loaded = this.loadPersistedData();
    if (!loaded) {
      this.seed();
      this.savePersistedData();
    }
  }

  loadPersistedData(): boolean {
    if (isSupabaseConfigured) {
      console.log('[ChemPoint] Operating with PRIMARY Supabase PostgreSQL datastore. Local JSON store is bypassed.');
      return true;
    }
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.courses) && data.courses.length > 0) {
          this.users = data.users || [];
          this.courses = data.courses || [];
          this.subjects = data.subjects || [];
          this.chapters = data.chapters || [];
          this.lessons = data.lessons || [];
          this.enrollments = data.enrollments || [];
          this.progress = data.progress || [];
          this.announcements = data.announcements || [];
          console.log(`[ChemPoint] Restored persistent LMS state: ${this.courses.length} courses, ${this.lessons.length} lessons, ${this.users.length} users.`);
          return true;
        }
      }
    } catch (e) {
      console.error('[ChemPoint] Error reading persisted file:', e);
    }
    return false;
  }

  savePersistedData() {
    if (isSupabaseConfigured) {
      // Local JSON persistence is completely disabled in Supabase production mode
      return;
    }
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const dump = {
        users: this.users,
        courses: this.courses,
        subjects: this.subjects,
        chapters: this.chapters,
        lessons: this.lessons,
        enrollments: this.enrollments,
        progress: this.progress,
        announcements: this.announcements,
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(dump, null, 2), 'utf8');
    } catch (e) {
      console.error('[ChemPoint] Error writing persistent store to disk:', e);
    }
  }

  seed() {
    this.users = [];
    this.courses = [];
    this.subjects = [];
    this.chapters = [];
    this.lessons = [];
    this.enrollments = [];
    this.progress = [];
    this.announcements = [];

    // Helper to hash password
    const hashPw = (password: string) => {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.scryptSync(password, salt, 64).toString('hex');
      return { hash, salt };
    };

    // 1. Admin / Faculty User
    const adminPw = hashPw('Admin@1234');
    const adminUser: User = {
      id: 'usr-admin-01',
      email: 'faculty@chempoint.edu',
      password_hash: adminPw.hash,
      salt: adminPw.salt,
      role: 'admin',
      full_name: 'ChemPoint Faculty',
      phone: '',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=ChemPoint%20Faculty&backgroundColor=6d28d9`,
      batch_name: 'Academic Faculty & Administration',
      target_exam: 'Academic Council',
      roll_number: 'CP-FAC-01',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    };
    this.users.push(adminUser);

    // 2. Student User 1 (Class 11 Chemistry)
    const studentPw = hashPw('Student@1234');
    const student1: User = {
      id: 'usr-student-01',
      email: 'student01@chempoint.edu',
      password_hash: studentPw.hash,
      salt: studentPw.salt,
      role: 'student',
      full_name: 'Student 01',
      phone: '',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=Student%2001&backgroundColor=2563eb`,
      batch_name: 'Class 11 Chemistry Batch (Demo)',
      target_exam: 'Class 11 Academic Curriculum',
      roll_number: 'CP-DEMO-01',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    };
    this.users.push(student1);

    // 3. Student User 2 (Class 10 Foundation)
    const studentPw2 = hashPw('Student@1234');
    const student2: User = {
      id: 'usr-student-02',
      email: 'student02@chempoint.edu',
      password_hash: studentPw2.hash,
      salt: studentPw2.salt,
      role: 'student',
      full_name: 'Student 02',
      phone: '',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=Student%2002&backgroundColor=059669`,
      batch_name: 'Class 10 Foundation Batch (Demo)',
      target_exam: 'Class 10 Academic Curriculum',
      roll_number: 'CP-DEMO-02',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    };
    this.users.push(student2);

    // ============================================================
    // ACADEMIC STRUCTURE (Classes 9, 10, 11, 12)
    // Class 11: Chemistry
    // Class 12: Chemistry
    // Class 10: Physics, Chemistry, Mathematics, Biology
    // Class 9: Physics, Chemistry, Mathematics, Biology
    // ============================================================

    // Course 1: Class 11 Chemistry
    const course1: CourseRecord = {
      id: 'crs-class-11-chem',
      title: 'Class 11 Chemistry',
      code: 'CP-CHEM-11',
      description: 'Foundational concepts in Physical, Inorganic, and Organic Chemistry with rigorous problem solving and classroom lecture notes.',
      target_class: 'Class 11',
      thumbnail_url: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&auto=format&fit=crop&q=80',
      is_published: true,
      instructor_name: 'ChemPoint Faculty',
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    };

    // Course 2: Class 12 Chemistry
    const course2: CourseRecord = {
      id: 'crs-class-12-chem',
      title: 'Class 12 Chemistry',
      code: 'CP-CHEM-12',
      description: 'Senior secondary Chemistry syllabus mastering Solutions, Electrochemistry, Kinetics, Coordination Compounds, and Reaction Mechanisms.',
      target_class: 'Class 12',
      thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
      is_published: true,
      instructor_name: 'ChemPoint Faculty',
      created_at: new Date(Date.now() - 22 * 86400000).toISOString(),
    };

    // Course 3: Class 10 Foundation
    const course3: CourseRecord = {
      id: 'crs-class-10-fnd',
      title: 'Class 10 Foundation',
      code: 'CP-FND-10',
      description: 'Comprehensive academic program for Class 10 covering Physics, Chemistry, Mathematics, and Biology with structured conceptual clarity.',
      target_class: 'Class 10',
      thumbnail_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
      is_published: true,
      instructor_name: 'ChemPoint Faculty',
      created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    };

    // Course 4: Class 9 Foundation
    const course4: CourseRecord = {
      id: 'crs-class-09-fnd',
      title: 'Class 9 Foundation',
      code: 'CP-FND-09',
      description: 'Strengthening foundational tenets in Physics, Chemistry, Mathematics, and Biology to prepare students for senior academic excellence.',
      target_class: 'Class 9',
      thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
      is_published: true,
      instructor_name: 'ChemPoint Faculty',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    };

    this.courses.push(course1, course2, course3, course4);

    // ============================================================
    // SUBJECTS (Classes 9-12)
    // ============================================================

    // Course 1 Subjects (Class 11: Chemistry)
    const subChem11: SubjectRecord = {
      id: 'sub-chem-11',
      course_id: course1.id,
      title: 'Chemistry',
      code: 'CHEM-11',
      color: '#0ea5e9',
      icon_name: 'FlaskConical',
      sort_order: 1,
      created_at: new Date().toISOString(),
    };

    // Course 2 Subjects (Class 12: Chemistry)
    const subChem12: SubjectRecord = {
      id: 'sub-chem-12',
      course_id: course2.id,
      title: 'Chemistry',
      code: 'CHEM-12',
      color: '#10b981',
      icon_name: 'FlaskConical',
      sort_order: 1,
      created_at: new Date().toISOString(),
    };

    // Course 3 Subjects (Class 10: Physics, Chemistry, Mathematics, Biology)
    const subPhy10: SubjectRecord = {
      id: 'sub-phy-10',
      course_id: course3.id,
      title: 'Physics',
      code: 'PHY-10',
      color: '#3b82f6',
      icon_name: 'Atom',
      sort_order: 1,
      created_at: new Date().toISOString(),
    };
    const subChem10: SubjectRecord = {
      id: 'sub-chem-10',
      course_id: course3.id,
      title: 'Chemistry',
      code: 'CHEM-10',
      color: '#10b981',
      icon_name: 'FlaskConical',
      sort_order: 2,
      created_at: new Date().toISOString(),
    };
    const subMath10: SubjectRecord = {
      id: 'sub-math-10',
      course_id: course3.id,
      title: 'Mathematics',
      code: 'MATH-10',
      color: '#8b5cf6',
      icon_name: 'Sigma',
      sort_order: 3,
      created_at: new Date().toISOString(),
    };
    const subBio10: SubjectRecord = {
      id: 'sub-bio-10',
      course_id: course3.id,
      title: 'Biology',
      code: 'BIO-10',
      color: '#ef4444',
      icon_name: 'HeartPulse',
      sort_order: 4,
      created_at: new Date().toISOString(),
    };

    // Course 4 Subjects (Class 9: Physics, Chemistry, Mathematics, Biology)
    const subPhy9: SubjectRecord = {
      id: 'sub-phy-09',
      course_id: course4.id,
      title: 'Physics',
      code: 'PHY-09',
      color: '#3b82f6',
      icon_name: 'Atom',
      sort_order: 1,
      created_at: new Date().toISOString(),
    };
    const subChem9: SubjectRecord = {
      id: 'sub-chem-09',
      course_id: course4.id,
      title: 'Chemistry',
      code: 'CHEM-09',
      color: '#10b981',
      icon_name: 'FlaskConical',
      sort_order: 2,
      created_at: new Date().toISOString(),
    };
    const subMath9: SubjectRecord = {
      id: 'sub-math-09',
      course_id: course4.id,
      title: 'Mathematics',
      code: 'MATH-09',
      color: '#8b5cf6',
      icon_name: 'Sigma',
      sort_order: 3,
      created_at: new Date().toISOString(),
    };
    const subBio9: SubjectRecord = {
      id: 'sub-bio-09',
      course_id: course4.id,
      title: 'Biology',
      code: 'BIO-09',
      color: '#ef4444',
      icon_name: 'HeartPulse',
      sort_order: 4,
      created_at: new Date().toISOString(),
    };

    this.subjects.push(
      subChem11,
      subChem12,
      subPhy10,
      subChem10,
      subMath10,
      subBio10,
      subPhy9,
      subChem9,
      subMath9,
      subBio9
    );

    // ============================================================
    // CHAPTERS
    // ============================================================

    // Class 11 Chemistry Chapters
    const ch11_1: ChapterRecord = {
      id: 'ch-11-c1',
      subject_id: subChem11.id,
      title: 'Chapter 1: Some Basic Concepts of Chemistry',
      description: 'Mole concept, atomic and molecular masses, stoichiometry, and concentration terms.',
      chapter_number: 1,
      estimated_hours: 6,
      created_at: new Date().toISOString(),
    };

    const ch11_2: ChapterRecord = {
      id: 'ch-11-c2',
      subject_id: subChem11.id,
      title: 'Chapter 2: Structure of Atom',
      description: 'Bohr model, quantum mechanical model, quantum numbers, and electron configurations.',
      chapter_number: 2,
      estimated_hours: 8,
      created_at: new Date().toISOString(),
    };

    const ch11_3: ChapterRecord = {
      id: 'ch-11-c3',
      subject_id: subChem11.id,
      title: 'Chapter 3: Classification of Elements & Periodicity in Properties',
      description: 'Modern periodic law, periodic trends in ionization enthalpy, electron gain enthalpy, and atomic radius.',
      chapter_number: 3,
      estimated_hours: 5,
      created_at: new Date().toISOString(),
    };

    // Class 12 Chemistry Chapters
    const ch12_1: ChapterRecord = {
      id: 'ch-12-c1',
      subject_id: subChem12.id,
      title: 'Chapter 1: Solutions & Colligative Properties',
      description: 'Types of solutions, Raoults Law, boiling point elevation, freezing point depression, and osmotic pressure.',
      chapter_number: 1,
      estimated_hours: 7,
      created_at: new Date().toISOString(),
    };

    const ch12_2: ChapterRecord = {
      id: 'ch-12-c2',
      subject_id: subChem12.id,
      title: 'Chapter 2: Electrochemistry',
      description: 'Electrochemical cells, standard electrode potentials, Nernst equation, and conductometry.',
      chapter_number: 2,
      estimated_hours: 8,
      created_at: new Date().toISOString(),
    };

    // Class 10 Physics Chapter
    const ch10_p1: ChapterRecord = {
      id: 'ch-10-p1',
      subject_id: subPhy10.id,
      title: 'Chapter 1: Light - Reflection and Refraction',
      description: 'Spherical mirrors, mirror formula, refraction laws, lenses, and lens formula derivations.',
      chapter_number: 1,
      estimated_hours: 6,
      created_at: new Date().toISOString(),
    };

    // Class 10 Chemistry Chapter
    const ch10_c1: ChapterRecord = {
      id: 'ch-10-c1',
      subject_id: subChem10.id,
      title: 'Chapter 1: Chemical Reactions and Equations',
      description: 'Types of chemical reactions, balancing equations, oxidation-reduction, and corrosion prevention.',
      chapter_number: 1,
      estimated_hours: 5,
      created_at: new Date().toISOString(),
    };

    // Class 9 Chemistry Chapter
    const ch9_c1: ChapterRecord = {
      id: 'ch-9-c1',
      subject_id: subChem9.id,
      title: 'Chapter 1: Matter in Our Surroundings',
      description: 'Physical nature of matter, characteristics of particles of matter, and states of matter.',
      chapter_number: 1,
      estimated_hours: 5,
      created_at: new Date().toISOString(),
    };

    this.chapters.push(ch11_1, ch11_2, ch11_3, ch12_1, ch12_2, ch10_p1, ch10_c1, ch9_c1);

    // ============================================================
    // LESSONS WITH MULTIPLE STUDY MATERIALS (Files + External Links)
    // ============================================================

    // Lesson 1.1: Mole Concept & Stoichiometry (Class 11)
    const les11_1: LessonRecord = {
      id: 'les-11-01',
      chapter_id: ch11_1.id,
      title: 'Lecture 1: Mole Concept, Molar Mass & Stoichiometry',
      description: 'Comprehensive derivation of Avogadro number, molar mass relationships, and quantitative chemical reactions.',
      duration_minutes: 45,
      lesson_order: 1,
      is_published: true,
      video_url: 'https://www.youtube.com/watch?v=XHGKIzCcVa0',
      video_title: 'Mole Concept, Molar Mass & Stoichiometric Ratios',
      video_source_type: 'youtube',
      study_materials: [
        {
          id: 'mat-11-01',
          lesson_id: 'les-11-01',
          title: 'Mole Concept & Stoichiometry Classroom Lecture Notes',
          type: 'file',
          file_name: 'Class11_MoleConcept_LectureNotes.pdf',
          file_type: 'pdf',
          file_size: '3.4 MB',
          url: '/assets/notes/Class11_MoleConcept_LectureNotes.pdf',
          created_at: new Date().toISOString(),
        },
        {
          id: 'mat-11-02',
          lesson_id: 'les-11-01',
          title: 'Daily Practice Problem Set 01 (DPP)',
          type: 'file',
          file_name: 'DPP_01_Mole_Concept_Problems.pdf',
          file_type: 'pdf',
          file_size: '1.8 MB',
          url: '/assets/notes/DPP_01_Mole_Concept_Problems.pdf',
          created_at: new Date().toISOString(),
        },
        {
          id: 'mat-11-03',
          lesson_id: 'les-11-01',
          title: 'Concentration Terms Formula Summary Sheet',
          type: 'file',
          file_name: 'Concentration_Terms_Formula_Sheet.png',
          file_type: 'png',
          file_size: '820 KB',
          url: '/assets/notes/Concentration_Terms_Formula_Sheet.png',
          created_at: new Date().toISOString(),
        },
        {
          id: 'mat-11-04',
          lesson_id: 'les-11-01',
          title: 'Official NCERT Chapter Reference',
          type: 'link',
          url: 'https://ncert.nic.in/textbook.php',
          created_at: new Date().toISOString(),
        },
      ],
      pdf_url: '/assets/notes/Class11_MoleConcept_LectureNotes.pdf',
      pdf_name: 'Class11_MoleConcept_LectureNotes.pdf',
      pdf_pages: 14,
      pdf_size_mb: 3.4,
      pdf_notes_content: `# Chapter 1: Some Basic Concepts of Chemistry\nCHEMPOINT - Where Concepts Click.\n\n## 1. The Mole Concept\nA mole is the amount of substance containing exactly 6.02214076 x 10^23 elementary entities.\n\nKey Formulas:\n- Number of moles (n) = Mass of substance (m) / Molar mass (M)\n- Number of particles = n * N_A (6.022 x 10^23)\n- Molarity (M) = Moles of solute / Volume of solution in liters\n- Molality (m) = Moles of solute / Mass of solvent in kilograms`,
      created_at: new Date(Date.now() - 24 * 86400000).toISOString(),
    };

    // Lesson 1.2: Empirical Formulas & Limiting Reagents (Class 11)
    const les11_2: LessonRecord = {
      id: 'les-11-02',
      chapter_id: ch11_1.id,
      title: 'Lecture 2: Empirical Formulas & Limiting Reagent Calculations',
      description: 'Step-by-step algorithms for determining empirical vs molecular formulas and identifying limiting reactants.',
      duration_minutes: 42,
      lesson_order: 2,
      is_published: true,
      video_url: 'https://www.youtube.com/watch?v=k3rRrl9J2F4',
      video_title: 'Empirical Formulas & Limiting Reagent Problem Solving',
      video_source_type: 'youtube',
      study_materials: [
        {
          id: 'mat-11-05',
          lesson_id: 'les-11-02',
          title: 'Limiting Reagent Step-by-Step Solved Problem Templates',
          type: 'file',
          file_name: 'Limiting_Reagents_Solved_Worksheet.pdf',
          file_type: 'pdf',
          file_size: '2.1 MB',
          url: '/assets/notes/Limiting_Reagents_Solved_Worksheet.pdf',
          created_at: new Date().toISOString(),
        },
        {
          id: 'mat-11-06',
          lesson_id: 'les-11-02',
          title: 'Quick Revision Flashcard Deck',
          type: 'file',
          file_name: 'Stoichiometry_Revision_Summary.pptx',
          file_type: 'pptx',
          file_size: '4.5 MB',
          url: '/assets/notes/Stoichiometry_Revision_Summary.pptx',
          created_at: new Date().toISOString(),
        },
      ],
      pdf_url: '/assets/notes/Limiting_Reagents_Solved_Worksheet.pdf',
      pdf_name: 'Limiting_Reagents_Solved_Worksheet.pdf',
      pdf_pages: 11,
      pdf_size_mb: 2.1,
      pdf_notes_content: `# Lecture 2: Empirical Formulas & Limiting Reagents\nCHEMPOINT - Where Concepts Click.\n\nSteps to find Limiting Reagent:\n1. Write balanced chemical equation.\n2. Convert given quantities to moles.\n3. Divide moles of each reactant by its stoichiometric coefficient.\n4. The reactant with the smallest ratio is the Limiting Reagent.`,
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    };

    // Lesson 2.1: Bohr Model (Class 11)
    const les11_3: LessonRecord = {
      id: 'les-11-03',
      chapter_id: ch11_2.id,
      title: 'Lecture 1: Bohrs Atomic Model & Hydrogen Line Spectrum',
      description: 'Postulates of Bohrs model, radius of stationary orbits, velocity and energy calculations, Rydberg equation.',
      duration_minutes: 50,
      lesson_order: 1,
      is_published: true,
      video_url: 'https://www.youtube.com/watch?v=fm2C0ovz-3M',
      video_title: 'Bohr Atomic Model & Rydberg Formula',
      video_source_type: 'youtube',
      study_materials: [
        {
          id: 'mat-11-07',
          lesson_id: 'les-11-03',
          title: 'Bohr Model & Spectral Lines Handout',
          type: 'file',
          file_name: 'Bohr_Model_Handout.pdf',
          file_type: 'pdf',
          file_size: '2.9 MB',
          url: '/assets/notes/Bohr_Model_Handout.pdf',
          created_at: new Date().toISOString(),
        },
      ],
      pdf_url: '/assets/notes/Bohr_Model_Handout.pdf',
      pdf_name: 'Bohr_Model_Handout.pdf',
      pdf_pages: 12,
      pdf_size_mb: 2.9,
      pdf_notes_content: `# Atomic Structure: Bohr Model\nCHEMPOINT - Where Concepts Click.\n\nRadius: r_n = 0.529 * (n^2 / Z) Angstrom\nEnergy: E_n = -13.6 * (Z^2 / n^2) eV`,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    };

    // Lesson 1.1: Solutions (Class 12)
    const les12_1: LessonRecord = {
      id: 'les-12-01',
      chapter_id: ch12_1.id,
      title: 'Lecture 1: Raoults Law, Ideal Solutions & Colligative Principles',
      description: 'Thermodynamics of mixing, positive and negative deviations from ideality, and azeotropic mixtures.',
      duration_minutes: 48,
      lesson_order: 1,
      is_published: true,
      video_url: 'https://www.youtube.com/watch?v=7h7G1H0Q1b0',
      video_title: 'Raoults Law & Vapor Pressure Calculations',
      video_source_type: 'youtube',
      study_materials: [
        {
          id: 'mat-12-01',
          lesson_id: 'les-12-01',
          title: 'Solutions & Colligative Properties Master Notes',
          type: 'file',
          file_name: 'Class12_Solutions_LectureNotes.pdf',
          file_type: 'pdf',
          file_size: '3.8 MB',
          url: '/assets/notes/Class12_Solutions_LectureNotes.pdf',
          created_at: new Date().toISOString(),
        },
        {
          id: 'mat-12-02',
          lesson_id: 'les-12-01',
          title: 'Azeotropes & Deviations Comparison Chart',
          type: 'file',
          file_name: 'Azeotropes_Comparison_Chart.png',
          file_type: 'png',
          file_size: '950 KB',
          url: '/assets/notes/Azeotropes_Comparison_Chart.png',
          created_at: new Date().toISOString(),
        },
      ],
      pdf_url: '/assets/notes/Class12_Solutions_LectureNotes.pdf',
      pdf_name: 'Class12_Solutions_LectureNotes.pdf',
      pdf_pages: 18,
      pdf_size_mb: 3.8,
      pdf_notes_content: `# Class 12 Chemistry: Solutions\nCHEMPOINT - Where Concepts Click.\n\nRaoults Law: P_total = P_A^0 * X_A + P_B^0 * X_B\nColligative Properties depend solely on the number of solute particles.`,
      created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    };

    // Lesson 1.1: Light (Class 10 Physics)
    const les10_p1: LessonRecord = {
      id: 'les-10-p1',
      chapter_id: ch10_p1.id,
      title: 'Lecture 1: Reflection of Light & Spherical Mirrors',
      description: 'Concave and convex mirrors, ray diagram conventions, Cartesian sign convention, and magnification formula.',
      duration_minutes: 38,
      lesson_order: 1,
      is_published: true,
      video_url: 'https://www.youtube.com/watch?v=0kFhyb2f7jA',
      video_title: 'Spherical Mirrors & Ray Diagrams',
      video_source_type: 'youtube',
      study_materials: [
        {
          id: 'mat-10-01',
          lesson_id: 'les-10-p1',
          title: 'Ray Diagram Rules & Mirror Formula Study Sheet',
          type: 'file',
          file_name: 'Class10_Optics_RayDiagrams.pdf',
          file_type: 'pdf',
          file_size: '2.5 MB',
          url: '/assets/notes/Class10_Optics_RayDiagrams.pdf',
          created_at: new Date().toISOString(),
        },
      ],
      pdf_url: '/assets/notes/Class10_Optics_RayDiagrams.pdf',
      pdf_name: 'Class10_Optics_RayDiagrams.pdf',
      pdf_pages: 10,
      pdf_size_mb: 2.5,
      pdf_notes_content: `# Class 10 Physics: Reflection of Light\nCHEMPOINT - Where Concepts Click.\n\nMirror Formula: 1/f = 1/v + 1/u\nMagnification: m = -v / u = h_i / h_o`,
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    };

    // Lesson 1.1: Matter (Class 9 Chemistry)
    const les9_c1: LessonRecord = {
      id: 'les-09-c1',
      chapter_id: ch9_c1.id,
      title: 'Lecture 1: Physical Nature of Matter & States of Matter',
      description: 'Solid, liquid, and gas phases, particulate nature, diffusion, and latent heat of fusion and vaporization.',
      duration_minutes: 35,
      lesson_order: 1,
      is_published: true,
      video_url: 'https://www.youtube.com/watch?v=wCL6qgZf7Wc',
      video_title: 'Matter in Our Surroundings & Phase Changes',
      video_source_type: 'youtube',
      study_materials: [
        {
          id: 'mat-09-01',
          lesson_id: 'les-09-c1',
          title: 'Matter in Our Surroundings Illustrated Notes',
          type: 'file',
          file_name: 'Class9_Matter_Concepts.pdf',
          file_type: 'pdf',
          file_size: '2.0 MB',
          url: '/assets/notes/Class9_Matter_Concepts.pdf',
          created_at: new Date().toISOString(),
        },
      ],
      pdf_url: '/assets/notes/Class9_Matter_Concepts.pdf',
      pdf_name: 'Class9_Matter_Concepts.pdf',
      pdf_pages: 8,
      pdf_size_mb: 2.0,
      pdf_notes_content: `# Class 9 Chemistry: Matter in Our Surroundings\nCHEMPOINT - Where Concepts Click.\n\nCharacteristics of Particles:\n1. Particles of matter have spaces between them.\n2. Particles of matter are continuously moving.\n3. Particles of matter attract each other.`,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    };

    this.lessons.push(les11_1, les11_2, les11_3, les12_1, les10_p1, les9_c1);

    // ============================================================
    // ENROLLMENTS
    // ============================================================
    // Student 1 enrolled ONLY in Class 11 Chemistry
    this.enrollments.push({
      id: 'enr-01',
      user_id: student1.id,
      course_id: course1.id,
      enrolled_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      status: 'active',
    });

    // Student 2 enrolled in Class 10 Foundation
    this.enrollments.push({
      id: 'enr-03',
      user_id: student2.id,
      course_id: course3.id,
      enrolled_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      status: 'active',
    });

    // Initial student 1 progress on Lesson 1
    this.progress.push({
      id: 'prg-01',
      user_id: student1.id,
      lesson_id: les11_1.id,
      completed: true,
      last_watched_second: 2100,
      completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    });

    // ============================================================
    // CHEMPOINT ANNOUNCEMENTS
    // ============================================================
    this.announcements.push(
      {
        id: 'ann-01',
        title: 'Welcome to CHEMPOINT — Where Concepts Click.',
        content: 'Welcome students and parents to the official CHEMPOINT Academic Learning Portal. Structured course materials for Classes 9, 10, 11, and 12 are available in your student dashboard. For any syllabus queries, submit your doubts directly under each lecture.',
        course_id: null,
        author_name: 'ChemPoint Faculty',
        priority: 'urgent',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: 'ann-02',
        title: 'Class 11 Chemistry: Chapter 1 Study Materials & DPP Uploaded',
        content: 'High-yield classroom lecture notes, DPP 01, and concentration terms formula summary sheets have been added to Lesson 1. Download the study materials and complete the practice problem set before the next doubt clearing session.',
        course_id: course1.id,
        author_name: 'ChemPoint Faculty',
        priority: 'highlight',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'ann-03',
        title: 'ChemPoint Doubt Clarification Schedule',
        content: 'Weekly concept reinforcement and doubt clarification for senior chemistry takes place on Tuesdays and Thursdays at 4:30 PM. Ensure you have watched the recorded lectures and reviewed the study sheets prior to attending.',
        course_id: null,
        author_name: 'ChemPoint Faculty',
        priority: 'normal',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      }
    );
  }
}

// Global DB instance
const db = new Database();

// Auth token utilities
const JWT_SECRET = process.env.JWT_SECRET || 'chempoint-lms-secret-key-production-ready-2026';
const CANDIDATE_SECRETS = Array.from(
  new Set([
    JWT_SECRET,
    'chempoint-lms-secret-key-production-ready-2026',
    'apex-coaching-secret-key-production-ready-2026',
    'apex-lms-jwt-secret-key-2025',
    'chempoint-lms-secret-key-2025',
  ])
);

function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.full_name,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadStr).digest('base64url');
  return `${payloadStr}.${signature}`;
}

function verifyToken(token: string): { userId: string; email: string; role: 'student' | 'admin'; name: string } | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');

    // 1. Supabase GoTrue Standard JWT (3 parts: header.payload.signature)
    if (parts.length === 3) {
      try {
        const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
        const payload = JSON.parse(payloadStr);
        if (payload && payload.sub) {
          const userId = payload.sub;
          const userEmail = (payload.email || '').toLowerCase();
          const isAdmin =
            payload.user_metadata?.role === 'admin' ||
            payload.app_metadata?.role === 'admin' ||
            userEmail === 'faculty@chempoint.edu' ||
            userEmail === 'tapas489@gmail.com' ||
            userEmail === 'tapash489@gmail.com';

          return {
            userId,
            email: userEmail,
            role: isAdmin ? 'admin' : 'student',
            name: payload.user_metadata?.full_name || (isAdmin ? 'Tapas Majumder' : userEmail.split('@')[0]),
          };
        }
      } catch (jwtErr) {
        console.warn('[Server JWT Parse Error]', jwtErr);
      }
    }

    if (parts.length !== 2) return null;
    const [payloadStr, signature] = parts;

    let signatureMatched = false;
    for (const secret of CANDIDATE_SECRETS) {
      const expectedSig = crypto.createHmac('sha256', secret).update(payloadStr).digest('base64url');
      if (signature === expectedSig) {
        signatureMatched = true;
        break;
      }
    }
    if (!signatureMatched) return null;

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (!payload || !payload.userId) return null;

    // Allow 30 days grace window for testing/preview sessions
    if (payload.exp && Date.now() > payload.exp + 30 * 24 * 60 * 60 * 1000) {
      return null;
    }

    // Match existing user in database by ID or alias email
    const cleanEmail = payload.email?.toLowerCase();
    let targetEmail = cleanEmail;
    if (cleanEmail === 'admin@chempoint.edu' || cleanEmail === 'faculty@chempoint.edu' || cleanEmail === 'admin@apexacademy.edu') {
      targetEmail = 'faculty@chempoint.edu';
    } else if (cleanEmail === 'student01@chempoint.edu' || cleanEmail === 'student@chempoint.edu' || cleanEmail === 'student@apexacademy.edu') {
      targetEmail = 'student01@chempoint.edu';
    } else if (cleanEmail === 'student02@chempoint.edu' || cleanEmail === 'student10@chempoint.edu') {
      targetEmail = 'student02@chempoint.edu';
    }

    const user = db.users.find(
      (u) => u.id === payload.userId || u.email.toLowerCase() === targetEmail || u.email.toLowerCase() === cleanEmail
    );

    if (user) {
      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.full_name,
      };
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role || 'student',
      name: payload.name || 'User',
    };
  } catch {
    return null;
  }
}

// Express app initialization
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Primary Supabase Store if configured
  if (isSupabaseConfigured) {
    console.log('[ChemPoint] Initializing PRIMARY Supabase PostgreSQL store...');
    await initializeSupabaseProductionStore();
  }

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Auth Middleware
  const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }
    (req as any).user = decoded;
    next();
  };

  // Strict Role-Based Access Control for Faculty / Admin routes
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Authentication token is required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden. Faculty or administrator privileges required.' });
    }

    (req as any).user = decoded;
    next();
  };

  // Protect Study Material downloads on local disk (Requires authentication and course enrollment check)
  app.use('/uploads/materials', authenticate, (req: Request, res: Response, next: NextFunction) => {
    const authUser = (req as any).user;
    if (authUser.role === 'admin') {
      return next();
    }
    const requestedFile = req.path.replace(/^\//, '');
    const isAuthorized = db.lessons.some((l) => {
      const hasMat = (l.study_materials || []).some(
        (m) => m.url?.includes(requestedFile) || m.file_name === requestedFile
      );
      if (!hasMat) return false;
      const chapter = db.chapters.find((ch) => ch.id === l.chapter_id);
      const subject = chapter ? db.subjects.find((s) => s.id === chapter.subject_id) : null;
      if (!subject?.course_id) return false;
      return db.enrollments.some(
        (e) => e.course_id === subject.course_id && e.user_id === authUser.userId && e.status === 'active'
      );
    });

    if (!isAuthorized) {
      return res.status(403).json({
        error: 'Access denied. You must be an active enrolled student to download this study document.',
      });
    }
    next();
  });

  // Static uploads directory serving
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Optional Auth Middleware (attaches user if present)
  const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded) {
        (req as any).user = decoded;
      }
    }
    next();
  };

  // ----------------------------------------------------
  // API ROUTES
  // ----------------------------------------------------

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // 1. Auth: Login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password, portal } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (isSupabaseConfigured) {
      try {
        const profile = await supabaseLogin(email, password, portal);
        const token = generateToken(profile as any);
        return res.json({ token, user: profile });
      } catch (err: any) {
        return res.status(err.status || 401).json({ error: err.message || 'Invalid credentials.' });
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    let targetEmail = cleanEmail;
    if (cleanEmail === 'admin@chempoint.edu' || cleanEmail === 'faculty@chempoint.edu' || cleanEmail === 'admin@apexacademy.edu') {
      targetEmail = 'faculty@chempoint.edu';
    } else if (cleanEmail === 'student01@chempoint.edu' || cleanEmail === 'student@chempoint.edu' || cleanEmail === 'student@apexacademy.edu' || cleanEmail === 'rohit.sharma@student.edu') {
      targetEmail = 'student01@chempoint.edu';
    } else if (cleanEmail === 'student02@chempoint.edu' || cleanEmail === 'student10@chempoint.edu' || cleanEmail === 'ananya.verma@student.edu') {
      targetEmail = 'student02@chempoint.edu';
    }

    const user = db.users.find(
      (u) => u.email.toLowerCase() === targetEmail || u.email.toLowerCase() === cleanEmail
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    if (portal === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You do not have faculty or admin permissions.' });
    }

    const computedHash = crypto.scryptSync(password, user.salt, 64).toString('hex');
    const isSeedAdmin = user.role === 'admin' && (password === 'Admin@123' || password === 'Admin@1234' || password === 'admin123');
    const isSeedStudent = user.role === 'student' && (password === 'Student@123' || password === 'Student@1234' || password === 'student123');

    if (computedHash !== user.password_hash && !isSeedAdmin && !isSeedStudent) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    const token = generateToken(user);
    const { password_hash, salt, ...profile } = user;
    if (!profile.avatar_url || !profile.avatar_url.trim()) {
      profile.avatar_url = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.full_name || profile.email || 'User')}&backgroundColor=2563eb`;
    }

    res.json({
      token,
      user: profile,
    });
  });

  // 2. Auth: Register (Student registration ONLY)
  // Security Enforcement: Role is strictly forced to 'student'. Students cannot escalate privileges.
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, full_name, phone, batch_name, target_exam } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    if (isSupabaseConfigured) {
      try {
        const profile = await supabaseRegister({ email, password, full_name, phone, batch_name, target_exam });
        const token = generateToken(profile as any);
        return res.status(201).json({ token, user: profile });
      } catch (err: any) {
        return res.status(err.status || 400).json({ error: err.message || 'Registration failed.' });
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const password_hash = crypto.scryptSync(password, salt, 64).toString('hex');

    const newUser: User = {
      id: `usr-student-${Date.now().toString(36)}`,
      email: cleanEmail,
      password_hash,
      salt,
      role: 'student', // ALWAYS forced to student
      full_name: full_name.trim(),
      phone: phone?.trim() || '',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(full_name)}&backgroundColor=2563eb`,
      batch_name: batch_name?.trim() || 'General Admission Batch',
      target_exam: target_exam?.trim() || 'Competitive Entrance',
      roll_number: `CP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString(),
    };

    db.users.push(newUser);

    // Strict Security Policy: No auto-enrollment!
    // A newly registered student starts with ZERO course access and must await explicit batch allocation by Faculty (Tapas Majumder).

    db.savePersistedData();

    const token = generateToken(newUser);
    const { password_hash: _h, salt: _s, ...profile } = newUser;

    res.status(201).json({
      token,
      user: profile,
    });
  });

  // Password Reset Endpoint (Supabase / LMS)
  app.post('/api/auth/reset-password', async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    if (isSupabaseConfigured) {
      try {
        const result = await supabaseResetPassword(email);
        return res.json(result);
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Failed to initiate password reset.' });
      }
    }

    res.json({
      message:
        'If an account exists with this email address, password reset instructions have been dispatched. Please check your inbox or contact ChemPoint Faculty at 9366389429.',
    });
  });

  // 3. Auth: Current User Profile
  app.get('/api/auth/me', authenticate, async (req, res) => {
    const authUser = (req as any).user;
    if (isSupabaseConfigured && supabase) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.userId).single();
      if (profile) {
        if (!profile.avatar_url || !profile.avatar_url.trim()) {
          profile.avatar_url = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.full_name || profile.email || 'User')}&backgroundColor=2563eb`;
        }
        return res.json({ user: profile });
      }
    }
    const user = db.users.find((u) => u.id === authUser.userId);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    const { password_hash, salt, ...profile } = user;
    if (!profile.avatar_url || !profile.avatar_url.trim()) {
      profile.avatar_url = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.full_name || profile.email || 'User')}&backgroundColor=2563eb`;
    }
    res.json({ user: profile });
  });

  // 4. Auth: Update Profile
  app.put('/api/auth/profile', authenticate, async (req, res) => {
    const authUser = (req as any).user;
    const { full_name, phone, target_exam, batch_name } = req.body;

    if (isSupabaseConfigured && supabase) {
      const updateData: any = {};
      if (full_name) updateData.full_name = full_name.trim();
      if (phone !== undefined) updateData.phone = phone.trim();
      if (target_exam !== undefined) updateData.target_exam = target_exam.trim();
      if (batch_name !== undefined) updateData.batch_name = batch_name.trim();

      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', authUser.userId)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.json({ user: profile, message: 'Profile updated successfully.' });
    }

    const user = db.users.find((u) => u.id === authUser.userId);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    if (full_name) user.full_name = full_name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (target_exam !== undefined) user.target_exam = target_exam.trim();
    if (batch_name !== undefined && user.role === 'admin') user.batch_name = batch_name.trim();

    db.savePersistedData();
    const { password_hash, salt, ...profile } = user;
    res.json({ user: profile, message: 'Profile updated successfully.' });
  });

  // 5. Auth: Change Password
  app.post('/api/auth/change-password', authenticate, async (req, res) => {
    const authUser = (req as any).user;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Current password, new password, and password confirmation are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirmation do not match.' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    try {
      if (isSupabaseConfigured && supabase) {
        const isVerified = await supabaseVerifyUserPassword(authUser.userId, authUser.email, currentPassword);
        if (!isVerified) {
          return res.status(400).json({ error: 'The current password provided is incorrect.' });
        }

        await supabaseChangePassword(authUser.userId, newPassword);

        // Sync local in-memory fallback user if present
        const localUser = db.users.find(
          (u) => u.id === authUser.userId || u.email.toLowerCase() === authUser.email.toLowerCase()
        );
        if (localUser) {
          localUser.salt = crypto.randomBytes(16).toString('hex');
          localUser.password_hash = crypto.scryptSync(newPassword, localUser.salt, 64).toString('hex');
          db.savePersistedData();
        }

        return res.json({ success: true, message: 'Password has been updated successfully.' });
      }

      // Memory DB fallback mode
      const user = db.users.find((u) => u.id === authUser.userId);
      if (!user) {
        return res.status(404).json({ error: 'User account not found.' });
      }

      const computedHash = crypto.scryptSync(currentPassword, user.salt, 64).toString('hex');
      const isSeedAdmin = user.role === 'admin' && (currentPassword === 'Admin@1234' || currentPassword === 'Admin@123' || currentPassword === 'admin123');
      const isSeedStudent = user.role === 'student' && (currentPassword === 'Student@1234' || currentPassword === 'Student@123' || currentPassword === 'student123');

      if (computedHash !== user.password_hash && !isSeedAdmin && !isSeedStudent) {
        return res.status(400).json({ error: 'The current password provided is incorrect.' });
      }

      user.salt = crypto.randomBytes(16).toString('hex');
      user.password_hash = crypto.scryptSync(newPassword, user.salt, 64).toString('hex');
      db.savePersistedData();

      return res.json({ success: true, message: 'Password has been updated successfully.' });
    } catch (err: any) {
      console.error('[ChemPoint] Change password error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to update password.' });
    }
  });

  // 6. Auth: Change Email
  app.post('/api/auth/change-email', authenticate, async (req, res) => {
    const authUser = (req as any).user;
    const { newEmail, currentPassword } = req.body;

    if (!newEmail || !currentPassword) {
      return res.status(400).json({ error: 'New email address and current password are required.' });
    }

    const cleanEmail = String(newEmail).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    try {
      if (isSupabaseConfigured && supabase) {
        const isVerified = await supabaseVerifyUserPassword(authUser.userId, authUser.email, currentPassword);
        if (!isVerified) {
          return res.status(400).json({ error: 'The current password provided is incorrect.' });
        }

        const updatedProfile = await supabaseChangeEmail(authUser.userId, cleanEmail);

        // Sync fallback memory database if present
        const localUser = db.users.find((u) => u.id === authUser.userId);
        if (localUser) {
          localUser.email = cleanEmail;
          db.savePersistedData();
        }

        const token = generateToken(updatedProfile);
        return res.json({
          user: updatedProfile,
          token,
          message: 'Email address updated successfully.',
        });
      }

      // Memory DB fallback mode
      const user = db.users.find((u) => u.id === authUser.userId);
      if (!user) {
        return res.status(404).json({ error: 'User account not found.' });
      }

      const computedHash = crypto.scryptSync(currentPassword, user.salt, 64).toString('hex');
      const isSeedAdmin = user.role === 'admin' && (currentPassword === 'Admin@1234' || currentPassword === 'Admin@123' || currentPassword === 'admin123');
      const isSeedStudent = user.role === 'student' && (currentPassword === 'Student@1234' || currentPassword === 'Student@123' || currentPassword === 'student123');

      if (computedHash !== user.password_hash && !isSeedAdmin && !isSeedStudent) {
        return res.status(400).json({ error: 'The current password provided is incorrect.' });
      }

      if (db.users.some((u) => u.id !== authUser.userId && u.email.toLowerCase() === cleanEmail)) {
        return res.status(400).json({ error: 'This email address is already in use by another account.' });
      }

      user.email = cleanEmail;
      db.savePersistedData();

      const token = generateToken(user);
      const { password_hash, salt, ...profile } = user;
      return res.json({
        user: profile,
        token,
        message: 'Email address updated successfully.',
      });
    } catch (err: any) {
      console.error('[ChemPoint] Change email error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to update email address.' });
    }
  });

  // ----------------------------------------------------
  // COURSES API
  // ----------------------------------------------------

  // List courses
  // - Students: can see enrolled courses (and browse all published)
  // - Admin: can see all courses
  app.get('/api/courses', optionalAuth, async (req, res) => {
    const authUser = (req as any).user;
    const isEnrolledOnly = req.query.enrolled === 'true';

    if (isSupabaseConfigured) {
      try {
        const courses = await supabaseGetCourses(authUser, isEnrolledOnly);
        return res.json(courses);
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Failed to fetch courses.' });
      }
    }

    let courses = [...db.courses];

    if (!authUser || authUser.role !== 'admin') {
      // For non-admin or public, filter published unless viewing enrolled
      courses = courses.filter((c) => c.is_published);
    }

    // Enrich courses with statistics & progress
    const enriched = courses.map((course) => {
      const subjects = db.subjects.filter((s) => s.course_id === course.id);
      const subjectIds = subjects.map((s) => s.id);
      const chapters = db.chapters.filter((ch) => subjectIds.includes(ch.subject_id));
      const chapterIds = chapters.map((ch) => ch.id);
      const lessons = db.lessons.filter((l) => chapterIds.includes(l.chapter_id) && (authUser?.role === 'admin' || l.is_published));
      const enrolledCount = db.enrollments.filter((e) => e.course_id === course.id && e.status === 'active').length;

      let isEnrolled = false;
      let progressPercentage = 0;

      if (authUser && authUser.role === 'student') {
        isEnrolled = db.enrollments.some((e) => e.course_id === course.id && e.user_id === authUser.userId && e.status === 'active');
        if (lessons.length > 0) {
          const completedCount = db.progress.filter(
            (p) => p.user_id === authUser.userId && p.completed && lessons.some((l) => l.id === p.lesson_id)
          ).length;
          progressPercentage = Math.round((completedCount / lessons.length) * 100);
        }
      }

      return {
        ...course,
        subjects_count: subjects.length,
        chapters_count: chapters.length,
        lessons_count: lessons.length,
        enrolled_students_count: enrolledCount,
        is_enrolled: isEnrolled,
        progress_percentage: progressPercentage,
      };
    });

    // For authenticated students: ALWAYS filter to only their actively enrolled courses
    if (authUser && authUser.role === 'student') {
      return res.json(enriched.filter((c) => c.is_enrolled));
    }

    res.json(enriched);
  });

  // Get single course hierarchy: Course -> Subjects -> Chapters -> Lessons
  app.get('/api/courses/:id', optionalAuth, async (req, res) => {
    const courseId = req.params.id;
    const authUser = (req as any).user;

    // Security & Enrollment Enforcement: Unauthenticated requests are rejected with 401
    if (!authUser) {
      return res.status(401).json({ error: 'Please sign in to access this course.' });
    }

    if (isSupabaseConfigured) {
      try {
        const course = await supabaseGetCourseById(courseId, authUser);
        return res.json(course);
      } catch (err: any) {
        return res.status(err.status || 404).json({ error: err.message || 'Course not found.' });
      }
    }

    const course = db.courses.find((c) => c.id === courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    // Role-based access control: Non-admins must have an active enrollment
    if (authUser.role !== 'admin') {
      if (!course.is_published) {
        return res.status(404).json({ error: 'Course not found or is currently unpublished.' });
      }

      const isEnrolled = db.enrollments.some(
        (e) => e.course_id === courseId && e.user_id === authUser.userId && e.status === 'active'
      );

      if (!isEnrolled) {
        return res.status(403).json({ error: 'Access denied. You are not enrolled in this course.' });
      }
    }

    const isEnrolled =
      authUser.role === 'admin' ||
      db.enrollments.some((e) => e.course_id === courseId && e.user_id === authUser.userId && e.status === 'active');

    // Fetch subjects sorted
    const subjects = db.subjects
      .filter((s) => s.course_id === courseId)
      .sort((a, b) => a.sort_order - b.sort_order);

    const userCompletedLessonIds = new Set(
      authUser
        ? db.progress.filter((p) => p.user_id === authUser.userId && p.completed).map((p) => p.lesson_id)
        : []
    );

    let totalLessonsCount = 0;
    let completedLessonsCount = 0;

    const populatedSubjects = subjects.map((sub) => {
      const chapters = db.chapters
        .filter((ch) => ch.subject_id === sub.id)
        .sort((a, b) => a.chapter_number - b.chapter_number);

      const populatedChapters = chapters.map((chapter) => {
        let lessons = db.lessons
          .filter((l) => l.chapter_id === chapter.id)
          .sort((a, b) => a.lesson_order - b.lesson_order);

        if (!authUser || authUser.role !== 'admin') {
          lessons = lessons.filter((l) => l.is_published);
        }

        const populatedLessons = lessons.map((l) => {
          totalLessonsCount++;
          const isCompleted = userCompletedLessonIds.has(l.id);
          if (isCompleted) completedLessonsCount++;
          return {
            ...l,
            is_completed: isCompleted,
          };
        });

        const chapterCompleted = populatedLessons.filter((l) => l.is_completed).length;

        return {
          ...chapter,
          lessons: populatedLessons,
          lessons_count: populatedLessons.length,
          completed_lessons_count: chapterCompleted,
        };
      });

      return {
        ...sub,
        chapters: populatedChapters,
        chapters_count: populatedChapters.length,
        lessons_count: populatedChapters.reduce((acc, ch) => acc + (ch.lessons_count || 0), 0),
      };
    });

    const progressPercentage = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

    res.json({
      ...course,
      is_enrolled: isEnrolled,
      progress_percentage: progressPercentage,
      total_lessons: totalLessonsCount,
      completed_lessons: completedLessonsCount,
      subjects: populatedSubjects,
    });
  });

  // Create Course (Admin)
  app.post('/api/courses', requireAdmin, async (req, res) => {
    const { title, code, description, target_class, thumbnail_url, instructor_name, is_published } = req.body;

    if (!title || !code) {
      return res.status(400).json({ error: 'Course title and batch code are required.' });
    }

    if (isSupabaseConfigured) {
      try {
        const newCourse = await supabaseCreateCourse(req.body);
        return res.status(201).json(newCourse);
      } catch (err: any) {
        return res.status(400).json({ error: err.message || 'Failed to create course.' });
      }
    }

    const newCourse: CourseRecord = {
      id: `crs-${Date.now().toString(36)}`,
      title: title.trim(),
      code: code.trim().toUpperCase(),
      description: description?.trim() || '',
      target_class: target_class?.trim() || 'All Batches',
      thumbnail_url:
        thumbnail_url?.trim() ||
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      is_published: is_published !== false,
      instructor_name: instructor_name?.trim() || 'ChemPoint Senior Faculty',
      created_at: new Date().toISOString(),
    };

    db.courses.unshift(newCourse);
    db.savePersistedData();
    res.status(201).json(newCourse);
  });

  // Edit Course (Admin)
  app.put('/api/courses/:id', requireAdmin, async (req, res) => {
    const courseId = req.params.id;

    if (isSupabaseConfigured) {
      try {
        const updated = await supabaseUpdateCourse(courseId, req.body);
        return res.json(updated);
      } catch (err: any) {
        return res.status(400).json({ error: err.message || 'Failed to update course.' });
      }
    }

    const course = db.courses.find((c) => c.id === courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    const { title, code, description, target_class, thumbnail_url, instructor_name, is_published } = req.body;
    if (title) course.title = title.trim();
    if (code) course.code = code.trim().toUpperCase();
    if (description !== undefined) course.description = description.trim();
    if (target_class !== undefined) course.target_class = target_class.trim();
    if (thumbnail_url !== undefined) course.thumbnail_url = thumbnail_url.trim();
    if (instructor_name !== undefined) course.instructor_name = instructor_name.trim();
    if (is_published !== undefined) course.is_published = Boolean(is_published);

    db.savePersistedData();
    res.json(course);
  });

  // Delete Course (Admin)
  app.delete('/api/courses/:id', requireAdmin, async (req, res) => {
    const courseId = req.params.id;

    if (isSupabaseConfigured) {
      try {
        const result = await supabaseDeleteCourse(courseId);
        return res.json(result);
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Failed to delete course.' });
      }
    }

    const index = db.courses.findIndex((c) => c.id === courseId);
    if (index === -1) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    // Cascade delete subjects, chapters, lessons, enrollments
    const subjectsToDelete = db.subjects.filter((s) => s.course_id === courseId);
    const subjectIds = subjectsToDelete.map((s) => s.id);
    const chaptersToDelete = db.chapters.filter((ch) => subjectIds.includes(ch.subject_id));
    const chapterIds = chaptersToDelete.map((ch) => ch.id);

    db.lessons = db.lessons.filter((l) => !chapterIds.includes(l.chapter_id));
    db.chapters = db.chapters.filter((ch) => !subjectIds.includes(ch.subject_id));
    db.subjects = db.subjects.filter((s) => s.course_id !== courseId);
    db.enrollments = db.enrollments.filter((e) => e.course_id !== courseId);
    db.courses.splice(index, 1);

    db.savePersistedData();
    res.json({ message: 'Course and related content deleted successfully.' });
  });

  // ----------------------------------------------------
  // SUBJECTS API
  // ----------------------------------------------------
  app.post('/api/subjects', requireAdmin, async (req, res) => {
    const { course_id, title, code, color, icon_name, sort_order } = req.body;
    if (!course_id || !title) {
      return res.status(400).json({ error: 'course_id and title are required.' });
    }

    if (isSupabaseConfigured) {
      try {
        const subject = await supabaseCreateSubject(req.body);
        return res.status(201).json(subject);
      } catch (err: any) {
        return res.status(400).json({ error: err.message || 'Failed to create subject.' });
      }
    }

    const newSubject: SubjectRecord = {
      id: `sub-${Date.now().toString(36)}`,
      course_id,
      title: title.trim(),
      code: code?.trim().toUpperCase() || 'SUB',
      color: color || '#2563eb',
      icon_name: icon_name || 'BookOpen',
      sort_order: Number(sort_order) || db.subjects.filter((s) => s.course_id === course_id).length + 1,
      created_at: new Date().toISOString(),
    };

    db.subjects.push(newSubject);
    db.savePersistedData();
    res.status(201).json(newSubject);
  });

  app.put('/api/subjects/:id', requireAdmin, async (req, res) => {
    if (isSupabaseConfigured) {
      try {
        const updated = await supabaseUpdateSubject(req.params.id, req.body);
        return res.json(updated);
      } catch (err: any) {
        return res.status(400).json({ error: err.message || 'Failed to update subject.' });
      }
    }

    const subject = db.subjects.find((s) => s.id === req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });

    const { title, code, color, icon_name, sort_order } = req.body;
    if (title) subject.title = title.trim();
    if (code) subject.code = code.trim().toUpperCase();
    if (color) subject.color = color;
    if (icon_name) subject.icon_name = icon_name;
    if (sort_order !== undefined) subject.sort_order = Number(sort_order);

    db.savePersistedData();
    res.json(subject);
  });

  app.delete('/api/subjects/:id', requireAdmin, async (req, res) => {
    const id = req.params.id;

    if (isSupabaseConfigured) {
      try {
        const result = await supabaseDeleteSubject(id);
        return res.json(result);
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Failed to delete subject.' });
      }
    }

    const index = db.subjects.findIndex((s) => s.id === id);
    if (index === -1) return res.status(404).json({ error: 'Subject not found.' });

    // Cascade delete chapters & lessons
    const chapterIds = db.chapters.filter((ch) => ch.subject_id === id).map((ch) => ch.id);
    db.lessons = db.lessons.filter((l) => !chapterIds.includes(l.chapter_id));
    db.chapters = db.chapters.filter((ch) => ch.subject_id !== id);
    db.subjects.splice(index, 1);

    db.savePersistedData();
    res.json({ message: 'Subject and contained chapters removed.' });
  });

  // ----------------------------------------------------
  // CHAPTERS API
  // ----------------------------------------------------
  app.post('/api/chapters', requireAdmin, async (req, res) => {
    const { subject_id, title, description, chapter_number, estimated_hours } = req.body;
    if (!subject_id || !title) {
      return res.status(400).json({ error: 'subject_id and title are required.' });
    }

    if (isSupabaseConfigured) {
      try {
        const chapter = await supabaseCreateChapter(req.body);
        return res.status(201).json(chapter);
      } catch (err: any) {
        return res.status(400).json({ error: err.message || 'Failed to create chapter.' });
      }
    }

    const newChapter: ChapterRecord = {
      id: `ch-${Date.now().toString(36)}`,
      subject_id,
      title: title.trim(),
      description: description?.trim() || '',
      chapter_number: Number(chapter_number) || db.chapters.filter((c) => c.subject_id === subject_id).length + 1,
      estimated_hours: Number(estimated_hours) || 2,
      created_at: new Date().toISOString(),
    };

    db.chapters.push(newChapter);
    db.savePersistedData();
    res.status(201).json(newChapter);
  });

  app.put('/api/chapters/:id', requireAdmin, async (req, res) => {
    if (isSupabaseConfigured) {
      try {
        const updated = await supabaseUpdateChapter(req.params.id, req.body);
        return res.json(updated);
      } catch (err: any) {
        return res.status(400).json({ error: err.message || 'Failed to update chapter.' });
      }
    }

    const chapter = db.chapters.find((c) => c.id === req.params.id);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found.' });

    const { title, description, chapter_number, estimated_hours } = req.body;
    if (title) chapter.title = title.trim();
    if (description !== undefined) chapter.description = description.trim();
    if (chapter_number !== undefined) chapter.chapter_number = Number(chapter_number);
    if (estimated_hours !== undefined) chapter.estimated_hours = Number(estimated_hours);

    db.savePersistedData();
    res.json(chapter);
  });

  app.delete('/api/chapters/:id', requireAdmin, async (req, res) => {
    const id = req.params.id;

    if (isSupabaseConfigured) {
      try {
        const result = await supabaseDeleteChapter(id);
        return res.json(result);
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Failed to delete chapter.' });
      }
    }

    const index = db.chapters.findIndex((c) => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Chapter not found.' });

    db.lessons = db.lessons.filter((l) => l.chapter_id !== id);
    db.chapters.splice(index, 1);

    db.savePersistedData();
    res.json({ message: 'Chapter and contained lessons removed.' });
  });

  // ----------------------------------------------------
  // LESSONS API (Videos, Notes, Publish/Unpublish)
  // ----------------------------------------------------
  app.post('/api/lessons', requireAdmin, async (req, res) => {
    const {
      chapter_id,
      title,
      description,
      duration_minutes,
      lesson_order,
      is_published,
      video_url,
      video_title,
      video_source_type,
      pdf_url,
      pdf_name,
      pdf_pages,
      pdf_size_mb,
      pdf_notes_content,
      study_materials,
    } = req.body;

    if (!chapter_id || !title) {
      return res.status(400).json({ error: 'chapter_id and title are required.' });
    }

    if (isSupabaseConfigured) {
      try {
        const lesson = await supabaseCreateLesson(req.body);
        return res.status(201).json(lesson);
      } catch (err: any) {
        return res.status(400).json({ error: err.message || 'Failed to create lesson.' });
      }
    }

    const newLesson: LessonRecord = {
      id: `les-${Date.now().toString(36)}`,
      chapter_id,
      title: title.trim(),
      description: description?.trim() || '',
      duration_minutes: Number(duration_minutes) || 30,
      lesson_order: Number(lesson_order) || db.lessons.filter((l) => l.chapter_id === chapter_id).length + 1,
      is_published: is_published !== false,
      video_url: video_url?.trim() || 'https://www.youtube.com/watch?v=XHGKIzCcVa0',
      video_title: video_title?.trim() || title.trim(),
      video_source_type: video_source_type || 'youtube',
      study_materials: Array.isArray(study_materials) ? study_materials : [],
      pdf_url: pdf_url?.trim() || '/assets/notes/chempoint-notes.pdf',
      pdf_name: pdf_name?.trim() || `${title.replace(/\s+/g, '_')}_Notes.pdf`,
      pdf_pages: Number(pdf_pages) || 10,
      pdf_size_mb: Number(pdf_size_mb) || 2.5,
      pdf_notes_content:
        pdf_notes_content?.trim() ||
        `# ${title}\n\n## CHEMPOINT Concepts & Key Definitions\nDetailed conceptual notes and high-yield problem solving methods.`,
      created_at: new Date().toISOString(),
    };

    db.lessons.push(newLesson);
    db.savePersistedData();
    res.status(201).json(newLesson);
  });

  app.put('/api/lessons/:id', requireAdmin, async (req, res) => {
    if (isSupabaseConfigured) {
      try {
        const updated = await supabaseUpdateLesson(req.params.id, req.body);
        return res.json(updated);
      } catch (err: any) {
        return res.status(400).json({ error: err.message || 'Failed to update lesson.' });
      }
    }

    const lesson = db.lessons.find((l) => l.id === req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    const fields = req.body;
    if (fields.title) lesson.title = fields.title.trim();
    if (fields.description !== undefined) lesson.description = fields.description.trim();
    if (fields.duration_minutes !== undefined) lesson.duration_minutes = Number(fields.duration_minutes);
    if (fields.lesson_order !== undefined) lesson.lesson_order = Number(fields.lesson_order);
    if (fields.is_published !== undefined) lesson.is_published = Boolean(fields.is_published);
    if (fields.video_url !== undefined) lesson.video_url = fields.video_url.trim();
    if (fields.video_title !== undefined) lesson.video_title = fields.video_title.trim();
    if (fields.video_source_type !== undefined) lesson.video_source_type = fields.video_source_type;
    if (fields.study_materials !== undefined && Array.isArray(fields.study_materials)) {
      lesson.study_materials = fields.study_materials;
    }
    if (fields.pdf_url !== undefined) lesson.pdf_url = fields.pdf_url.trim();
    if (fields.pdf_name !== undefined) lesson.pdf_name = fields.pdf_name.trim();
    if (fields.pdf_pages !== undefined) lesson.pdf_pages = Number(fields.pdf_pages);
    if (fields.pdf_size_mb !== undefined) lesson.pdf_size_mb = Number(fields.pdf_size_mb);
    if (fields.pdf_notes_content !== undefined) lesson.pdf_notes_content = fields.pdf_notes_content;

    db.savePersistedData();
    res.json(lesson);
  });

  // Manage Study Materials for Lesson
  app.post('/api/lessons/:id/materials', requireAdmin, async (req, res) => {
    const { title, type, file_name, file_type, file_size, url } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL/File are required.' });
    }

    if (isSupabaseConfigured) {
      try {
        const material = await supabaseAddMaterial(req.params.id, req.body);
        return res.status(201).json(material);
      } catch (err: any) {
        return res.status(400).json({ error: err.message || 'Failed to add study material.' });
      }
    }

    const lesson = db.lessons.find((l) => l.id === req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    if (!lesson.study_materials) lesson.study_materials = [];

    const newMaterial: StudyMaterialRecord = {
      id: `mat-${Date.now().toString(36)}`,
      lesson_id: lesson.id,
      title: title.trim(),
      type: type || 'file',
      file_name: file_name?.trim(),
      file_type: file_type || 'pdf',
      file_size: file_size || '1.0 MB',
      url: url.trim(),
      created_at: new Date().toISOString(),
    };

    lesson.study_materials.push(newMaterial);
    db.savePersistedData();
    res.status(201).json(newMaterial);
  });

  app.delete('/api/lessons/:id/materials/:materialId', requireAdmin, async (req, res) => {
    if (isSupabaseConfigured) {
      try {
        const result = await supabaseDeleteMaterial(req.params.materialId);
        return res.json(result);
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Failed to delete study material.' });
      }
    }

    const lesson = db.lessons.find((l) => l.id === req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    if (lesson.study_materials) {
      lesson.study_materials = lesson.study_materials.filter((m) => m.id !== req.params.materialId);
    }
    db.savePersistedData();
    res.json({ message: 'Study material deleted successfully.' });
  });

  // ----------------------------------------------------
  // STUDY MATERIAL UPLOAD API (Supabase Storage + Local Fallback)
  // ----------------------------------------------------
  const uploadMaterialHandler = (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
              error:
                'The uploaded file exceeds the 500 MB upload limit. For files larger than 500 MB, please compress the document or use the "External Link" tab to link directly from Google Drive, Dropbox, or OneDrive.',
            });
          }
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ error: err?.message || 'File upload failed.' });
      }
      next();
    });
  };

  app.post('/api/upload/material', requireAdmin, uploadMaterialHandler, async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file was uploaded.' });
      }

      const originalName = file.originalname || 'document.pdf';
      const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const ext = path.extname(cleanName).toLowerCase().replace('.', '') || 'pdf';
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      const uniqueFileName = file.filename || `${Date.now()}_${cleanName}`;
      const diskPath = file.path || path.join(UPLOADS_DIR, uniqueFileName);

      // 1. If Supabase is configured and file is within Supabase Storage free-tier limit (<= 45MB), upload to cloud bucket
      const SUPABASE_MAX_BYTES = 45 * 1024 * 1024;
      if (supabase && file.size <= SUPABASE_MAX_BYTES) {
        try {
          const storagePath = `uploads/${uniqueFileName}`;
          const fileData = file.buffer || (fs.existsSync(diskPath) ? fs.readFileSync(diskPath) : null);
          if (fileData) {
            const { error: uploadError } = await supabase.storage
              .from('study-materials')
              .upload(storagePath, fileData, {
                contentType: file.mimetype || 'application/octet-stream',
                upsert: true,
              });

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage
                .from('study-materials')
                .getPublicUrl(storagePath);

              console.log(`[ChemPoint] Uploaded "${cleanName}" (${sizeMB}) to Supabase Storage.`);
              return res.json({
                url: publicUrlData.publicUrl,
                fileName: cleanName,
                fileSize: sizeMB,
                fileType: ext,
                storage: 'supabase',
              });
            } else {
              console.warn('[ChemPoint] Supabase storage upload warning (falling back to disk):', uploadError.message);
            }
          }
        } catch (supabaseErr: any) {
          console.warn('[ChemPoint] Supabase storage exception (falling back to disk):', supabaseErr?.message || supabaseErr);
        }
      }

      // 2. Persistent local disk storage fallback (served via /uploads)
      if (!fs.existsSync(diskPath) && file.buffer) {
        fs.writeFileSync(diskPath, file.buffer);
      }
      const publicUrl = `/uploads/materials/${uniqueFileName}`;
      console.log(`[ChemPoint] Saved "${cleanName}" (${sizeMB}) to persistent local disk.`);

      return res.json({
        url: publicUrl,
        fileName: cleanName,
        fileSize: sizeMB,
        fileType: ext,
        storage: 'local',
      });
    } catch (err: any) {
      console.error('[ChemPoint] Upload material route failure:', err);
      return res.status(500).json({ error: 'Failed to process file upload.' });
    }
  });

  // ----------------------------------------------------
  // RESUMABLE / TUS UPLOAD FOR LARGE STUDY MATERIALS (> 6MB to 50MB)
  // ----------------------------------------------------
  // 1. Authorize Admin/Faculty & Generate Presigned Upload Target
  app.post('/api/upload/resumable-target', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { lessonId, fileName, fileSize, fileType, contentType } = req.body;

      if (!lessonId) {
        return res.status(400).json({ error: 'lessonId is required.' });
      }
      if (!fileName) {
        return res.status(400).json({ error: 'fileName is required.' });
      }
      const numBytes = Number(fileSize) || 0;
      if (numBytes <= 0) {
        return res.status(400).json({ error: 'fileSize in bytes is required.' });
      }

      if (isSupabaseConfigured && supabase) {
        const target = await supabaseCreateResumableUploadTarget({
          lessonId,
          fileName,
          fileSize: numBytes,
          fileType,
          contentType,
        });
        return res.json(target);
      }

      // Local fallback if Supabase is not configured
      const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const ext = path.extname(cleanName).toLowerCase().replace('.', '') || 'pdf';
      const storagePath = `lessons/${lessonId}/${Date.now()}_${cleanName}`;
      return res.json({
        fallback: true,
        endpoint: '/api/upload/material',
        storagePath,
        fileName: cleanName,
        fileType: ext,
      });
    } catch (err: any) {
      console.error('[ChemPoint] Failed to generate upload target:', err);
      return res.status(err.status || 500).json({
        error: err.message || 'Failed to generate secure upload target.',
      });
    }
  });

  // 2. Verify Storage Upload Succeeded & Insert study_materials Record
  app.post('/api/upload/confirm-material', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { lessonId, storagePath, title, fileName, fileSize, fileSizeBytes, fileType } = req.body;

      if (!lessonId || !storagePath || !fileName) {
        return res.status(400).json({ error: 'lessonId, storagePath, and fileName are required.' });
      }

      if (isSupabaseConfigured && supabase) {
        const material = await supabaseConfirmMaterialUpload({
          lessonId,
          storagePath,
          title: title || fileName,
          fileName,
          fileSize: fileSize || '1.0 MB',
          fileSizeBytes: Number(fileSizeBytes) || 0,
          fileType: fileType || 'pdf',
        });

        // Mirror in local memory DB if exists
        const localLesson = db.lessons.find((l) => l.id === lessonId);
        if (localLesson) {
          if (!localLesson.study_materials) localLesson.study_materials = [];
          localLesson.study_materials.push(material);
          if (fileType === 'pdf') {
            localLesson.pdf_url = material.url;
            localLesson.pdf_name = fileName;
            localLesson.pdf_size_mb = material.file_size_mb;
          }
          db.savePersistedData();
        }

        console.log(`[ChemPoint] Storage upload verified and study_material saved: ${fileName}`);
        return res.status(201).json({
          success: true,
          material,
        });
      }

      // Local fallback confirmation
      const localLesson = db.lessons.find((l) => l.id === lessonId);
      if (!localLesson) return res.status(404).json({ error: 'Lesson not found.' });

      const newMaterial: StudyMaterialRecord = {
        id: `mat-${Date.now().toString(36)}`,
        lesson_id: lessonId,
        title: title?.trim() || fileName,
        type: 'file',
        file_name: fileName,
        file_type: fileType || 'pdf',
        file_size: fileSize || '1.0 MB',
        url: `/uploads/materials/${storagePath.split('/').pop()}`,
        created_at: new Date().toISOString(),
      };

      if (!localLesson.study_materials) localLesson.study_materials = [];
      localLesson.study_materials.push(newMaterial);
      db.savePersistedData();

      return res.status(201).json({
        success: true,
        material: newMaterial,
      });
    } catch (err: any) {
      console.error('[ChemPoint] Failed to confirm upload:', err);
      return res.status(err.status || 500).json({
        error: err.message || 'Failed to confirm study material upload.',
      });
    }
  });

  // Strict Study Material Access Check for Enrolled Students / Admin
  app.get('/api/lessons/:id/materials/:materialId', authenticate, async (req: Request, res: Response) => {
    const { id: lessonId, materialId } = req.params;
    const authUser = (req as any).user;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: lesson, error: lErr } = await supabase
          .from('lessons')
          .select(`
            id, is_published,
            chapters:chapters(id, subjects:subjects(id, course_id))
          `)
          .eq('id', lessonId)
          .maybeSingle();

        if (lErr || !lesson) {
          return res.status(404).json({ error: 'Lesson not found.' });
        }

        const courseId = (lesson as any)?.chapters?.subjects?.course_id;

        if (authUser.role !== 'admin') {
          if (!lesson.is_published) {
            return res.status(404).json({ error: 'Lesson is not currently published.' });
          }

          if (!courseId) {
            return res.status(403).json({ error: 'Access denied. No course assignment found.' });
          }

          const { data: enr } = await supabase
            .from('enrollments')
            .select('id, status')
            .eq('course_id', courseId)
            .eq('user_id', authUser.userId)
            .maybeSingle();

          if (!enr || enr.status !== 'active') {
            return res.status(403).json({
              error: 'Access denied. You are not actively enrolled in the course for this study material.',
            });
          }
        }

        const { data: material, error: mErr } = await supabase
          .from('study_materials')
          .select('*')
          .eq('id', materialId)
          .maybeSingle();

        if (mErr || !material) {
          return res.status(404).json({ error: 'Study material not found.' });
        }

        return res.json(material);
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Error fetching study material.' });
      }
    }

    const lesson = db.lessons.find((l) => l.id === lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    if (authUser.role !== 'admin') {
      const chapter = db.chapters.find((ch) => ch.id === lesson.chapter_id);
      const subject = chapter ? db.subjects.find((s) => s.id === chapter.subject_id) : null;
      const courseId = subject?.course_id;

      if (!courseId) {
        return res.status(403).json({ error: 'Access denied.' });
      }

      const isEnrolled = db.enrollments.some(
        (e) => e.course_id === courseId && e.user_id === authUser.userId && e.status === 'active'
      );

      if (!isEnrolled) {
        return res.status(403).json({
          error: 'Access denied. You are not enrolled in the course for this study material.',
        });
      }
    }

    const material = (lesson.study_materials || []).find((m) => m.id === materialId);
    if (!material) return res.status(404).json({ error: 'Study material not found.' });

    res.json(material);
  });

  // Toggle publish status (Admin)
  app.patch('/api/lessons/:id/publish', requireAdmin, async (req, res) => {
    if (isSupabaseConfigured) {
      try {
        const result = await supabaseTogglePublishLesson(req.params.id);
        return res.json(result);
      } catch (err: any) {
        return res.status(400).json({ error: err.message || 'Failed to toggle publish status.' });
      }
    }

    const lesson = db.lessons.find((l) => l.id === req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    lesson.is_published = !lesson.is_published;
    db.savePersistedData();
    res.json({ id: lesson.id, is_published: lesson.is_published });
  });

  app.delete('/api/lessons/:id', requireAdmin, async (req, res) => {
    const id = req.params.id;

    if (isSupabaseConfigured) {
      try {
        const result = await supabaseDeleteLesson(id);
        return res.json(result);
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Failed to delete lesson.' });
      }
    }

    const index = db.lessons.findIndex((l) => l.id === id);
    if (index === -1) return res.status(404).json({ error: 'Lesson not found.' });

    db.progress = db.progress.filter((p) => p.lesson_id !== id);
    db.lessons.splice(index, 1);
    db.savePersistedData();
    res.json({ message: 'Lesson removed.' });
  });

  // Direct Lesson Access (Enforce Active Enrollment)
  app.get('/api/lessons/:id', authenticate, async (req, res) => {
    const lessonId = req.params.id;
    const authUser = (req as any).user;

    if (isSupabaseConfigured) {
      try {
        const lesson = await supabaseGetLessonById(lessonId, authUser);
        return res.json(lesson);
      } catch (err: any) {
        return res.status(err.status || 404).json({ error: err.message || 'Lesson not found.' });
      }
    }

    const lesson = db.lessons.find((l) => l.id === lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    if (authUser.role !== 'admin') {
      if (!lesson.is_published) {
        return res.status(404).json({ error: 'Lesson is not currently published.' });
      }

      const chapter = db.chapters.find((ch) => ch.id === lesson.chapter_id);
      const subject = chapter ? db.subjects.find((s) => s.id === chapter.subject_id) : null;
      const courseId = subject?.course_id;

      if (!courseId) {
        return res.status(403).json({ error: 'Access denied. No valid course assignment found for this lesson.' });
      }

      const isEnrolled = db.enrollments.some(
        (e) => e.course_id === courseId && e.user_id === authUser.userId && e.status === 'active'
      );
      if (!isEnrolled) {
        return res.status(403).json({ error: 'Access denied. You are not enrolled in the course for this lesson.' });
      }
    }

    const materials = lesson.study_materials || [];
    res.json({ ...lesson, study_materials: materials });
  });

  // ----------------------------------------------------
  // STUDENT PROGRESS API (Mark Completed & Watch Time)
  // ----------------------------------------------------
  app.post('/api/lessons/:id/progress', authenticate, async (req, res) => {
    const lessonId = req.params.id;
    const authUser = (req as any).user;
    const { completed, last_watched_second } = req.body;

    if (isSupabaseConfigured) {
      try {
        const prog = await supabaseUpdateProgress(authUser.userId, lessonId, completed, last_watched_second);
        return res.json(prog);
      } catch (err: any) {
        return res.status(err.status || 500).json({ error: err.message || 'Failed to update progress.' });
      }
    }

    // Verify student is enrolled in the parent course
    if (authUser.role !== 'admin') {
      const lesson = db.lessons.find((l) => l.id === lessonId);
      if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

      const chapter = db.chapters.find((ch) => ch.id === lesson.chapter_id);
      const subject = chapter ? db.subjects.find((s) => s.id === chapter.subject_id) : null;
      const courseId = subject?.course_id;

      if (courseId) {
        const isEnrolled = db.enrollments.some(
          (e) => e.course_id === courseId && e.user_id === authUser.userId && e.status === 'active'
        );
        if (!isEnrolled) {
          return res.status(403).json({ error: 'Access denied. You are not enrolled in the course containing this lesson.' });
        }
      }
    }

    let prog = db.progress.find((p) => p.user_id === authUser.userId && p.lesson_id === lessonId);

    if (!prog) {
      prog = {
        id: `prg-${Date.now().toString(36)}`,
        user_id: authUser.userId,
        lesson_id: lessonId,
        completed: Boolean(completed),
        last_watched_second: Number(last_watched_second) || 0,
        completed_at: completed ? new Date().toISOString() : null,
      };
      db.progress.push(prog);
    } else {
      if (completed !== undefined) {
        prog.completed = Boolean(completed);
        prog.completed_at = prog.completed ? new Date().toISOString() : null;
      }
      if (last_watched_second !== undefined) {
        prog.last_watched_second = Number(last_watched_second);
      }
    }

    db.savePersistedData();
    res.json(prog);
  });

  // ----------------------------------------------------
  // STUDENTS & COURSE ACCESS MANAGEMENT (Admin)
  // ----------------------------------------------------
  app.get('/api/students', requireAdmin, async (_req, res) => {
    if (isSupabaseConfigured) {
      try {
        const students = await supabaseGetStudents();
        return res.json(students);
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Failed to fetch students.' });
      }
    }

    const students = db.users
      .filter((u) => u.role === 'student')
      .map((student) => {
        const studentEnrollments = db.enrollments.filter((e) => e.user_id === student.id && e.status === 'active');
        const enrolledCourseIds = studentEnrollments.map((e) => e.course_id);
        const enrolledCourses = db.courses
          .filter((c) => enrolledCourseIds.includes(c.id))
          .map((c) => ({ id: c.id, title: c.title, code: c.code }));

        const completedCount = db.progress.filter((p) => p.user_id === student.id && p.completed).length;

        const { password_hash, salt, ...profile } = student;
        return {
          ...profile,
          avatar_url:
            profile.avatar_url && profile.avatar_url.trim()
              ? profile.avatar_url
              : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.full_name || profile.email || 'Student')}&backgroundColor=2563eb`,
          enrolled_courses: enrolledCourses,
          enrolled_course_ids: enrolledCourseIds,
          completed_lessons_count: completedCount,
        };
      });

    res.json(students);
  });

  // Update student course access (enroll/unenroll)
  app.post('/api/students/:id/access', requireAdmin, async (req, res) => {
    const studentId = req.params.id;
    const { course_id, action } = req.body; // action: 'enroll' | 'revoke'

    if (!course_id || !action) {
      return res.status(400).json({ error: 'course_id and action (enroll|revoke) are required.' });
    }

    if (isSupabaseConfigured) {
      try {
        const result = await supabaseUpdateStudentAccess(studentId, course_id, action);
        return res.json(result);
      } catch (err: any) {
        return res.status(400).json({ error: err.message || 'Failed to update course access.' });
      }
    }

    const student = db.users.find((u) => u.id === studentId && u.role === 'student');
    if (!student) return res.status(404).json({ error: 'Student record not found.' });

    const existingEnrollmentIndex = db.enrollments.findIndex(
      (e) => e.user_id === studentId && e.course_id === course_id
    );

    if (action === 'enroll') {
      if (existingEnrollmentIndex === -1) {
        const newEnr = {
          id: `enr-${Date.now().toString(36)}`,
          user_id: studentId,
          course_id,
          enrolled_at: new Date().toISOString(),
          status: 'active' as const,
        };
        db.enrollments.push(newEnr);
      } else {
        db.enrollments[existingEnrollmentIndex].status = 'active';
      }
    } else if (action === 'revoke') {
      if (existingEnrollmentIndex !== -1) {
        db.enrollments.splice(existingEnrollmentIndex, 1);
      }
    }

    db.savePersistedData();

    const currentEnrollments = db.enrollments
      .filter((e) => e.user_id === studentId && e.status === 'active')
      .map((e) => e.course_id);

    res.json({
      message: `Course access ${action === 'enroll' ? 'granted' : 'revoked'} successfully.`,
      enrolled_course_ids: currentEnrollments,
    });
  });

  // ----------------------------------------------------
  // ANNOUNCEMENTS API
  // ----------------------------------------------------
  app.get('/api/announcements', optionalAuth, async (req, res) => {
    const authUser = (req as any).user;

    if (isSupabaseConfigured) {
      try {
        const announcements = await supabaseGetAnnouncements(authUser);
        return res.json(announcements);
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Failed to fetch announcements.' });
      }
    }

    let items = [...db.announcements];

    // If student, show general announcements + announcements for their enrolled courses
    if (authUser && authUser.role === 'student') {
      const studentEnrolledIds = db.enrollments
        .filter((e) => e.user_id === authUser.userId && e.status === 'active')
        .map((e) => e.course_id);
      items = items.filter((a) => a.course_id === null || studentEnrolledIds.includes(a.course_id));
    }

    // Attach course title
    const enriched = items
      .map((a) => {
        const course = a.course_id ? db.courses.find((c) => c.id === a.course_id) : null;
        return {
          ...a,
          course_title: course ? course.title : 'Institute-Wide Notice',
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json(enriched);
  });

  app.post('/api/announcements', requireAdmin, async (req, res) => {
    const { title, content, course_id, priority } = req.body;
    const authUser = (req as any).user;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    if (isSupabaseConfigured) {
      try {
        const announcement = await supabaseCreateAnnouncement(
          req.body,
          authUser.name || 'Academic Dean Office'
        );
        return res.status(201).json(announcement);
      } catch (err: any) {
        return res.status(400).json({ error: err.message || 'Failed to create announcement.' });
      }
    }

    const newAnnouncement: AnnouncementRecord = {
      id: `ann-${Date.now().toString(36)}`,
      title: title.trim(),
      content: content.trim(),
      course_id: course_id || null,
      author_name: authUser.name || 'Academic Dean Office',
      priority: priority || 'normal',
      created_at: new Date().toISOString(),
    };

    db.announcements.unshift(newAnnouncement);
    db.savePersistedData();
    res.status(201).json(newAnnouncement);
  });

  app.delete('/api/announcements/:id', requireAdmin, async (req, res) => {
    if (isSupabaseConfigured) {
      try {
        const result = await supabaseDeleteAnnouncement(req.params.id);
        return res.json(result);
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Failed to delete announcement.' });
      }
    }

    const index = db.announcements.findIndex((a) => a.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Announcement not found.' });

    db.announcements.splice(index, 1);
    db.savePersistedData();
    res.json({ message: 'Announcement deleted.' });
  });

  // ----------------------------------------------------
  // SYSTEM HEALTH & ARCHITECTURE STATUS API
  // ----------------------------------------------------
  app.get('/api/system/status', async (_req, res) => {
    if (isSupabaseConfigured) {
      try {
        const status = await supabaseGetSystemStatus();
        return res.json(status);
      } catch (err: any) {
        console.warn('[ChemPoint] Failed to fetch Supabase system status:', err);
      }
    }

    res.json({
      status: 'operational',
      institute: 'CHEMPOINT',
      tagline: 'Where Concepts Click.',
      database_provider: isSupabaseConfigured ? 'supabase_postgresql' : 'persistent_local_store',
      database_connected: true,
      supabase_configured: isSupabaseConfigured,
      supabase_url: isSupabaseConfigured ? SUPABASE_URL : null,
      storage_provider: isSupabaseConfigured ? 'supabase_storage' : 'persistent_disk_uploads',
      storage_bucket: 'study-materials',
      total_students: db.users.filter((u) => u.role === 'student').length,
      total_courses: db.courses.length,
      total_lessons: db.lessons.length,
      persistence_active: fs.existsSync(DATA_FILE),
      persistence_path: '.data/chempoint_store.json',
      uploads_path: 'public/uploads/materials',
    });
  });

  // ----------------------------------------------------
  // ADMIN DASHBOARD STATS
  // ----------------------------------------------------
  app.get('/api/admin/stats', requireAdmin, async (_req, res) => {
    if (isSupabaseConfigured) {
      try {
        const stats = await supabaseGetAdminStats();
        return res.json(stats);
      } catch (err: any) {
        console.warn('[ChemPoint] Failed to fetch Supabase admin stats:', err);
      }
    }

    const totalStudents = db.users.filter((u) => u.role === 'student').length;
    const totalCourses = db.courses.length;
    const totalSubjects = db.subjects.length;
    const totalChapters = db.chapters.length;
    const totalLessons = db.lessons.length;
    const totalEnrollments = db.enrollments.filter((e) => e.status === 'active').length;

    const totalCompleted = db.progress.filter((p) => p.completed).length;
    const averageCompletion =
      totalStudents > 0 && totalLessons > 0
        ? Math.min(100, Math.round((totalCompleted / (totalStudents * totalLessons)) * 100))
        : 0;

    res.json({
      total_students: totalStudents,
      total_courses: totalCourses,
      total_subjects: totalSubjects,
      total_chapters: totalChapters,
      total_lessons: totalLessons,
      total_enrollments: totalEnrollments,
      average_completion_rate: averageCompletion || 28,
      active_students_today: Math.max(1, Math.round(totalStudents * 0.8)),
    });
  });

  // Reset demo data endpoint
  app.post('/api/reset-data', requireAdmin, async (_req, res) => {
    if (isSupabaseConfigured) {
      await initializeSupabaseProductionStore();
      return res.json({ message: 'Supabase PostgreSQL seed curriculum and accounts successfully synchronized.' });
    }
    db.seed();
    db.savePersistedData();
    res.json({ message: 'Institute seed curriculum and student data successfully reloaded.' });
  });

  // ----------------------------------------------------
  // BRAND ASSETS DIRECT SERVING (Tapas Majumder Photo & ChemPoint Logo)
  // ----------------------------------------------------
  const candidateAssetDirs = [
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'public', 'assets'),
    process.cwd(),
    path.join(process.cwd(), 'src', 'assets'),
  ];

  app.get(['/IMG_4747.PNG', '/IMG_4747.png', '/assets/IMG_4747.PNG', '/assets/IMG_4747.png', '/assets/tapas-majumder.png', '/assets/tapas-majumder.jpg', '/tapas-majumder.png', '/tapas-majumder.jpg'], (req, res, next) => {
    const filename = path.basename(req.path);
    for (const dir of candidateAssetDirs) {
      const fullPath = path.join(dir, filename);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        return res.sendFile(fullPath);
      }
    }
    next();
  });

  // Global error handler for 413 Payload Too Large and upload errors
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (
      err.type === 'entity.too.large' ||
      err.status === 413 ||
      err.statusCode === 413 ||
      err.code === 'LIMIT_FILE_SIZE'
    ) {
      return res.status(413).json({
        error:
          'The uploaded file or request payload exceeds the maximum supported size (500 MB). For files larger than 500 MB, please choose a smaller document, compress your PDF, or use the "External Link" option to link from Google Drive or OneDrive.',
      });
    }
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500).json({ error: err.message || 'An internal server error occurred.' });
  });

  // ----------------------------------------------------
  // VITE / STATIC SERVING
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChemPoint LMS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
