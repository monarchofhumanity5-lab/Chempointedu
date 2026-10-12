import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const rawUrl = process.env.SUPABASE_URL || '';
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase: SupabaseClient = createClient(cleanUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export function toUUID(str: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str;
  }
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16),
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0') + hash.substring(18, 20),
    hash.substring(20, 32),
  ].join('-');
}

export async function seedSupabase() {
  console.log('[Seed] Starting Supabase database seeding...');

  // 1. Ensure Faculty Admin Account
  const facultyEmail = 'faculty@chempoint.edu';
  const { data: listUsers } = await supabase.auth.admin.listUsers();
  const usersList: any[] = listUsers?.users || [];
  let facultyUser = usersList.find((u: any) => u.email === facultyEmail);
  if (!facultyUser) {
    const { data: newUser, error: fErr } = await supabase.auth.admin.createUser({
      email: facultyEmail,
      password: 'Admin@1234',
      email_confirm: true,
      user_metadata: { full_name: 'ChemPoint Faculty', role: 'admin' },
    });
    if (fErr) console.warn('[Seed] Create faculty warning:', fErr.message);
    facultyUser = newUser?.user;
  }
  if (facultyUser) {
    await supabase.from('profiles').update({
      role: 'admin',
      full_name: 'ChemPoint Faculty',
      batch_name: 'Academic Faculty & Administration',
      target_exam: 'Academic Council',
      roll_number: 'CP-FAC-01',
    }).eq('id', facultyUser.id);
  }

  // 2. Ensure Demo Student 1 (Class 11)
  const s1Email = 'student01@chempoint.edu';
  let s1User = usersList.find((u: any) => u.email === s1Email);
  if (!s1User) {
    const { data: newUser, error: sErr } = await supabase.auth.admin.createUser({
      email: s1Email,
      password: 'Student@1234',
      email_confirm: true,
      user_metadata: {
        full_name: 'Aarav Sharma',
        role: 'student',
        batch_name: 'Class 11 Chemistry Batch',
        target_exam: 'Class 11 Chemistry & Entrance',
      },
    });
    if (sErr) console.warn('[Seed] Create student 1 warning:', sErr.message);
    s1User = newUser?.user;
  }

  // 3. Ensure Demo Student 2 (Class 10)
  const s2Email = 'student02@chempoint.edu';
  let s2User = usersList.find((u: any) => u.email === s2Email);
  if (!s2User) {
    const { data: newUser, error: sErr } = await supabase.auth.admin.createUser({
      email: s2Email,
      password: 'Student@1234',
      email_confirm: true,
      user_metadata: {
        full_name: 'Ananya Verma',
        role: 'student',
        batch_name: 'Class 10 Foundation Batch',
        target_exam: 'Class 10 Board & NTSE',
      },
    });
    if (sErr) console.warn('[Seed] Create student 2 warning:', sErr.message);
    s2User = newUser?.user;
  }

  // 4. Seed Courses
  const courses = [
    {
      id: toUUID('crs-class-11-chem'),
      title: 'Class 11 Chemistry',
      code: 'CP-CHEM-11',
      description: 'Foundational concepts in Physical, Inorganic, and Organic Chemistry with rigorous problem solving and classroom lecture notes.',
      target_class: 'Class 11',
      thumbnail_url: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&auto=format&fit=crop&q=80',
      is_published: true,
      instructor_name: 'ChemPoint Faculty',
    },
    {
      id: toUUID('crs-class-12-chem'),
      title: 'Class 12 Chemistry',
      code: 'CP-CHEM-12',
      description: 'Senior secondary Chemistry syllabus mastering Solutions, Electrochemistry, Kinetics, Coordination Compounds, and Reaction Mechanisms.',
      target_class: 'Class 12',
      thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
      is_published: true,
      instructor_name: 'ChemPoint Faculty',
    },
    {
      id: toUUID('crs-class-10-fnd'),
      title: 'Class 10 Foundation',
      code: 'CP-FND-10',
      description: 'Comprehensive academic program for Class 10 covering Physics, Chemistry, Mathematics, and Biology with structured conceptual clarity.',
      target_class: 'Class 10',
      thumbnail_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
      is_published: true,
      instructor_name: 'ChemPoint Faculty',
    },
    {
      id: toUUID('crs-class-09-fnd'),
      title: 'Class 9 Foundation',
      code: 'CP-FND-09',
      description: 'Strengthening foundational tenets in Physics, Chemistry, Mathematics, and Biology to prepare students for senior academic excellence.',
      target_class: 'Class 9',
      thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
      is_published: true,
      instructor_name: 'ChemPoint Faculty',
    },
  ];

  for (const c of courses) {
    const { error } = await supabase.from('courses').upsert(c, { onConflict: 'id' });
    if (error) console.error('[Seed] Course error:', c.title, error.message);
  }

  // 5. Seed Subjects
  const subjects = [
    {
      id: toUUID('sub-chem-11'),
      course_id: toUUID('crs-class-11-chem'),
      title: 'Chemistry',
      code: 'CHEM-11',
      color: '#0ea5e9',
      icon_name: 'FlaskConical',
      sort_order: 1,
    },
    {
      id: toUUID('sub-chem-12'),
      course_id: toUUID('crs-class-12-chem'),
      title: 'Chemistry',
      code: 'CHEM-12',
      color: '#10b981',
      icon_name: 'FlaskConical',
      sort_order: 1,
    },
    {
      id: toUUID('sub-phy-10'),
      course_id: toUUID('crs-class-10-fnd'),
      title: 'Physics',
      code: 'PHY-10',
      color: '#3b82f6',
      icon_name: 'Atom',
      sort_order: 1,
    },
    {
      id: toUUID('sub-chem-10'),
      course_id: toUUID('crs-class-10-fnd'),
      title: 'Chemistry',
      code: 'CHEM-10',
      color: '#10b981',
      icon_name: 'FlaskConical',
      sort_order: 2,
    },
    {
      id: toUUID('sub-math-10'),
      course_id: toUUID('crs-class-10-fnd'),
      title: 'Mathematics',
      code: 'MATH-10',
      color: '#8b5cf6',
      icon_name: 'Sigma',
      sort_order: 3,
    },
    {
      id: toUUID('sub-bio-10'),
      course_id: toUUID('crs-class-10-fnd'),
      title: 'Biology',
      code: 'BIO-10',
      color: '#ef4444',
      icon_name: 'HeartPulse',
      sort_order: 4,
    },
    {
      id: toUUID('sub-phy-09'),
      course_id: toUUID('crs-class-09-fnd'),
      title: 'Physics',
      code: 'PHY-09',
      color: '#3b82f6',
      icon_name: 'Atom',
      sort_order: 1,
    },
    {
      id: toUUID('sub-chem-09'),
      course_id: toUUID('crs-class-09-fnd'),
      title: 'Chemistry',
      code: 'CHEM-09',
      color: '#10b981',
      icon_name: 'FlaskConical',
      sort_order: 2,
    },
    {
      id: toUUID('sub-math-09'),
      course_id: toUUID('crs-class-09-fnd'),
      title: 'Mathematics',
      code: 'MATH-09',
      color: '#8b5cf6',
      icon_name: 'Sigma',
      sort_order: 3,
    },
    {
      id: toUUID('sub-bio-09'),
      course_id: toUUID('crs-class-09-fnd'),
      title: 'Biology',
      code: 'BIO-09',
      color: '#ef4444',
      icon_name: 'HeartPulse',
      sort_order: 4,
    },
  ];

  for (const s of subjects) {
    const { error } = await supabase.from('subjects').upsert(s, { onConflict: 'id' });
    if (error) console.error('[Seed] Subject error:', s.title, error.message);
  }

  // 6. Seed Chapters
  const chapters = [
    // Class 11 Chemistry
    {
      id: toUUID('ch-11-c1'),
      subject_id: toUUID('sub-chem-11'),
      title: 'Chapter 1: Some Basic Concepts of Chemistry',
      description: 'Nature of matter, laws of chemical combination, mole concept, molar mass, and concentration terms.',
      chapter_number: 1,
      estimated_hours: 4,
    },
    {
      id: toUUID('ch-11-c2'),
      subject_id: toUUID('sub-chem-11'),
      title: 'Chapter 2: Structure of Atom',
      description: 'Atomic models, Bohr theory, quantum numbers, electronic configuration, and de Broglie relation.',
      chapter_number: 2,
      estimated_hours: 5,
    },
    {
      id: toUUID('ch-11-c3'),
      subject_id: toUUID('sub-chem-11'),
      title: 'Chapter 3: Classification of Elements & Periodicity',
      description: 'Modern periodic law, periodic trends in properties: atomic radii, ionization enthalpy, and electronegativity.',
      chapter_number: 3,
      estimated_hours: 3.5,
    },
    {
      id: toUUID('ch-11-c4'),
      subject_id: toUUID('sub-chem-11'),
      title: 'Chapter 4: Chemical Bonding and Molecular Structure',
      description: 'Ionic bond, covalent bond, VSEPR theory, hybridization, and molecular orbital theory.',
      chapter_number: 4,
      estimated_hours: 6,
    },
    // Class 12 Chemistry
    {
      id: toUUID('ch-12-c1'),
      subject_id: toUUID('sub-chem-12'),
      title: 'Chapter 1: Solutions',
      description: 'Types of solutions, Raoults law, ideal and non-ideal solutions, and colligative properties.',
      chapter_number: 1,
      estimated_hours: 4.5,
    },
    {
      id: toUUID('ch-12-c2'),
      subject_id: toUUID('sub-chem-12'),
      title: 'Chapter 2: Electrochemistry',
      description: 'Redox reactions, galvanic cells, Nernst equation, electrolytic conductance, and Kohlrausch law.',
      chapter_number: 2,
      estimated_hours: 5,
    },
    // Class 10 Foundation
    {
      id: toUUID('ch-10-phy-1'),
      subject_id: toUUID('sub-phy-10'),
      title: 'Chapter 1: Light – Reflection and Refraction',
      description: 'Spherical mirrors, mirror formula, refraction, lens formula, and magnification.',
      chapter_number: 1,
      estimated_hours: 4,
    },
    {
      id: toUUID('ch-10-chem-1'),
      subject_id: toUUID('sub-chem-10'),
      title: 'Chapter 1: Chemical Reactions and Equations',
      description: 'Balancing chemical equations, combination, decomposition, displacement, and redox reactions.',
      chapter_number: 1,
      estimated_hours: 3.5,
    },
  ];

  for (const ch of chapters) {
    const { error } = await supabase.from('chapters').upsert(ch, { onConflict: 'id' });
    if (error) console.error('[Seed] Chapter error:', ch.title, error.message);
  }

  // 7. Seed Lessons
  const lessons = [
    {
      id: toUUID('les-11-c1-l1'),
      chapter_id: toUUID('ch-11-c1'),
      title: 'Matter and Its Nature & Mole Concept Fundamentals',
      description: 'Classroom lecture covering elements, compounds, mixtures, and the mole concept.',
      duration_minutes: 38,
      lesson_order: 1,
      is_published: true,
      video_url: 'https://www.youtube.com/watch?v=XHGKIzCcVa0',
      video_title: 'CHEMPOINT Lecture 01: Mole Concept',
      video_source_type: 'youtube',
      pdf_url: 'https://lrhsiwxcvdwhfzcecjek.supabase.co/storage/v1/object/public/study-materials/handouts/chempoint_lecture_01_notes.pdf',
      pdf_name: 'CHEMPOINT_Mole_Concept_Lecture_Notes.pdf',
      pdf_pages: 14,
      pdf_size_mb: 2.8,
      pdf_notes_content: '# CHEMPOINT Class 11 Chemistry - Lecture 1 Notes\n## Mole Concept & Stochiometry\n- 1 mole = 6.022 x 10^23 entities (Avogadro Number)\n- Molar mass = Mass in grams of 1 mole of substance.',
    },
    {
      id: toUUID('les-11-c1-l2'),
      chapter_id: toUUID('ch-11-c1'),
      title: 'Concentration of Solutions: Molarity, Molality & Normality',
      description: 'Mathematical formulations and high-yield numerical problem solving for concentration terms.',
      duration_minutes: 42,
      lesson_order: 2,
      is_published: true,
      video_url: 'https://www.youtube.com/watch?v=XHGKIzCcVa0',
      video_title: 'CHEMPOINT Lecture 02: Solution Concentrations',
      video_source_type: 'youtube',
      pdf_url: 'https://lrhsiwxcvdwhfzcecjek.supabase.co/storage/v1/object/public/study-materials/handouts/chempoint_lecture_02_concentration.pdf',
      pdf_name: 'CHEMPOINT_Concentration_Terms_Problem_Set.pdf',
      pdf_pages: 12,
      pdf_size_mb: 2.2,
      pdf_notes_content: '# Solution Concentration Formulas\nMolarity (M) = Moles of solute / Volume of solution (L)\nMolality (m) = Moles of solute / Mass of solvent (kg)',
    },
    {
      id: toUUID('les-11-c2-l1'),
      chapter_id: toUUID('ch-11-c2'),
      title: 'Bohr Model of the Hydrogen Atom & Hydrogen Line Spectrum',
      description: 'Postulates of Bohr theory, energy level transitions, Rydberg equation, and Balmer series.',
      duration_minutes: 45,
      lesson_order: 1,
      is_published: true,
      video_url: 'https://www.youtube.com/watch?v=XHGKIzCcVa0',
      video_title: 'CHEMPOINT Lecture 03: Bohr Model of Atom',
      video_source_type: 'youtube',
      pdf_url: 'https://lrhsiwxcvdwhfzcecjek.supabase.co/storage/v1/object/public/study-materials/handouts/bohr_model_handout.pdf',
      pdf_name: 'Bohr_Model_Atomic_Structure_Notes.pdf',
      pdf_pages: 16,
      pdf_size_mb: 3.1,
      pdf_notes_content: '# Bohr Atomic Theory\nEnergy of nth orbit En = -13.6 * (Z^2 / n^2) eV',
    },
    {
      id: toUUID('les-12-c1-l1'),
      chapter_id: toUUID('ch-12-c1'),
      title: 'Raoults Law for Volatile and Non-Volatile Solutes',
      description: 'Detailed analysis of vapor pressure curves, positive and negative deviations from ideality.',
      duration_minutes: 40,
      lesson_order: 1,
      is_published: true,
      video_url: 'https://www.youtube.com/watch?v=XHGKIzCcVa0',
      video_title: 'Class 12: Raoults Law & Vapor Pressure',
      video_source_type: 'youtube',
      pdf_url: 'https://lrhsiwxcvdwhfzcecjek.supabase.co/storage/v1/object/public/study-materials/handouts/solutions_raoults_law.pdf',
      pdf_name: 'Solutions_Raoults_Law_Study_Guide.pdf',
      pdf_pages: 15,
      pdf_size_mb: 2.5,
      pdf_notes_content: '# Raoult Law\nP_total = P_A^0 * X_A + P_B^0 * X_B',
    },
  ];

  for (const l of lessons) {
    const { error } = await supabase.from('lessons').upsert(l, { onConflict: 'id' });
    if (error) console.error('[Seed] Lesson error:', l.title, error.message);
  }

  // 8. Seed Study Materials
  const materials = [
    {
      id: toUUID('mat-11-c1-l1-01'),
      lesson_id: toUUID('les-11-c1-l1'),
      title: 'Daily Practice Problem (DPP 01) – Mole Concept & Avogadro Law',
      type: 'file',
      file_name: 'CHEMPOINT_DPP_01_Mole_Concept.pdf',
      file_type: 'pdf',
      file_size: '1.8 MB',
      file_size_mb: 1.8,
      url: 'https://lrhsiwxcvdwhfzcecjek.supabase.co/storage/v1/object/public/study-materials/handouts/dpp_01_mole_concept.pdf',
    },
    {
      id: toUUID('mat-11-c1-l1-02'),
      lesson_id: toUUID('les-11-c1-l1'),
      title: 'Chemistry Formula & Conversion Factors Cheatsheet',
      type: 'file',
      file_name: 'CHEMPOINT_Conversion_Factors_Cheatsheet.pdf',
      file_type: 'pdf',
      file_size: '1.2 MB',
      file_size_mb: 1.2,
      url: 'https://lrhsiwxcvdwhfzcecjek.supabase.co/storage/v1/object/public/study-materials/handouts/conversion_factors_cheatsheet.pdf',
    },
  ];

  for (const m of materials) {
    const { error } = await supabase.from('study_materials').upsert(m, { onConflict: 'id' });
    if (error) console.error('[Seed] Material error:', m.title, error.message);
  }

  // 9. Seed Announcements
  const announcements = [
    {
      id: toUUID('ann-01'),
      title: 'Welcome to CHEMPOINT — Where Concepts Click.',
      content: 'Welcome students and parents to the official CHEMPOINT Academic Learning Portal. Structured course materials for Classes 9, 10, 11, and 12 are available in your student dashboard. For any syllabus queries, submit your doubts directly under each lecture.',
      course_id: null,
      author_name: 'ChemPoint Faculty',
      priority: 'urgent',
    },
    {
      id: toUUID('ann-02'),
      title: 'Class 11 Chemistry: Chapter 1 Study Materials & DPP Uploaded',
      content: 'High-yield classroom lecture notes, DPP 01, and concentration terms formula summary sheets have been added to Lesson 1. Download the study materials and complete the practice problem set before the next doubt clearing session.',
      course_id: toUUID('crs-class-11-chem'),
      author_name: 'ChemPoint Faculty',
      priority: 'highlight',
    },
    {
      id: toUUID('ann-03'),
      title: 'ChemPoint Doubt Clarification Schedule',
      content: 'Weekly concept reinforcement and doubt clarification for senior chemistry takes place on Tuesdays and Thursdays at 4:30 PM. Ensure you have watched the recorded lectures and reviewed the study sheets prior to attending.',
      course_id: null,
      author_name: 'ChemPoint Faculty',
      priority: 'normal',
    },
  ];

  for (const a of announcements) {
    const { error } = await supabase.from('announcements').upsert(a, { onConflict: 'id' });
    if (error) console.error('[Seed] Announcement error:', a.title, error.message);
  }

  // 10. Seed Student 1 Enrollment in Class 11 Chemistry
  if (s1User) {
    await supabase.from('enrollments').upsert({
      id: toUUID(`enr-${s1User.id}-${toUUID('crs-class-11-chem')}`),
      user_id: s1User.id,
      course_id: toUUID('crs-class-11-chem'),
      status: 'active',
    }, { onConflict: 'user_id,course_id' });
  }

  // 11. Seed Student 2 Enrollment in Class 10 Foundation
  if (s2User) {
    await supabase.from('enrollments').upsert({
      id: toUUID(`enr-${s2User.id}-${toUUID('crs-class-10-fnd')}`),
      user_id: s2User.id,
      course_id: toUUID('crs-class-10-fnd'),
      status: 'active',
    }, { onConflict: 'user_id,course_id' });
  }

  console.log('[Seed] Supabase database seeding complete!');
}
