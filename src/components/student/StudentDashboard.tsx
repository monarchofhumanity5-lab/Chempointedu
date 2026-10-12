import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Course, Announcement, Lesson } from '../../types';
import { api } from '../../services/api';
import { Card } from '../common/Card';
import { ScrollReveal } from '../common/ScrollReveal';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  GraduationCap,
  PlayCircle,
  FileText,
  Download,
  Atom,
  FlaskConical,
  ChevronRight,
  Award,
  Layers,
  Compass,
  Phone,
  Mail,
  Instagram,
} from 'lucide-react';

interface StudentDashboardProps {
  onSelectCourse: (courseId: string) => void;
  onNavigate: (view: string) => void;
  onOpenLesson?: (lessonId: string, courseId: string) => void;
}

// Organic 3D-styled SVG decorative components
const FloatingAtom3D: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    <ellipse cx="50" cy="50" rx="42" ry="16" stroke="url(#atomGrad1)" strokeWidth="1.8" transform="rotate(30 50 50)" opacity="0.8" />
    <ellipse cx="50" cy="50" rx="42" ry="16" stroke="url(#atomGrad2)" strokeWidth="1.8" transform="rotate(90 50 50)" opacity="0.8" />
    <ellipse cx="50" cy="50" rx="42" ry="16" stroke="url(#atomGrad1)" strokeWidth="1.8" transform="rotate(150 50 50)" opacity="0.8" />
    {/* 3D Nucleus */}
    <circle cx="50" cy="50" r="9" fill="url(#nucleusGrad)" filter="drop-shadow(0 2px 4px rgba(168,85,247,0.5))" />
    <circle cx="48" cy="48" r="3" fill="#ffffff" opacity="0.6" />
    {/* Orbiting electrons */}
    <circle cx="85" cy="50" r="4.5" fill="#a855f7" filter="drop-shadow(0 1px 3px rgba(168,85,247,0.6))" />
    <circle cx="28" cy="24" r="4" fill="#818cf8" filter="drop-shadow(0 1px 3px rgba(129,140,248,0.6))" />
    <circle cx="32" cy="74" r="3.5" fill="#c084fc" filter="drop-shadow(0 1px 3px rgba(192,132,252,0.6))" />
    <defs>
      <linearGradient id="atomGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
      <linearGradient id="atomGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <radialGradient id="nucleusGrad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#d8b4fe" />
        <stop offset="70%" stopColor="#7e22ce" />
        <stop offset="100%" stopColor="#3b0764" />
      </radialGradient>
    </defs>
  </svg>
);

const FloatingMolecule3D: React.FC<{ className?: string }> = ({ className = "w-14 h-14" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    {/* Bonds */}
    <line x1="35" y1="65" x2="65" y2="35" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
    <line x1="65" y1="35" x2="85" y2="65" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
    <line x1="35" y1="65" x2="20" y2="40" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" />
    {/* Atoms */}
    <circle cx="65" cy="35" r="14" fill="url(#molSphere1)" filter="drop-shadow(0 4px 6px rgba(126,34,206,0.3))" />
    <circle cx="61" cy="31" r="4.5" fill="#ffffff" opacity="0.6" />
    
    <circle cx="35" cy="65" r="11" fill="url(#molSphere2)" filter="drop-shadow(0 3px 5px rgba(99,102,241,0.3))" />
    <circle cx="32" cy="62" r="3.5" fill="#ffffff" opacity="0.6" />

    <circle cx="85" cy="65" r="9" fill="url(#molSphere3)" filter="drop-shadow(0 2px 4px rgba(236,72,153,0.3))" />
    <circle cx="83" cy="63" r="2.5" fill="#ffffff" opacity="0.6" />

    <circle cx="20" cy="40" r="7" fill="url(#molSphere1)" filter="drop-shadow(0 2px 4px rgba(126,34,206,0.3))" />
    <defs>
      <radialGradient id="molSphere1" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="60%" stopColor="#7e22ce" />
        <stop offset="100%" stopColor="#3b0764" />
      </radialGradient>
      <radialGradient id="molSphere2" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#a5b4fc" />
        <stop offset="60%" stopColor="#4f46e5" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </radialGradient>
      <radialGradient id="molSphere3" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="60%" stopColor="#db2777" />
        <stop offset="100%" stopColor="#831843" />
      </radialGradient>
    </defs>
  </svg>
);

const FloatingBeaker3D: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    {/* Beaker Glass Body */}
    <path d="M30 20 L70 20 L70 25 L65 30 L65 72 C65 78 60 82 54 82 L46 82 C40 82 35 78 35 72 L35 30 L30 25 Z" stroke="#c084fc" strokeWidth="2.5" fill="url(#glassGrad)" />
    {/* Liquid inside */}
    <path d="M37 55 C42 53 48 57 53 55 C58 53 62 55 63 56 L63 72 C63 76 60 79 55 79 L45 79 C40 79 37 76 37 72 Z" fill="url(#liquidGrad)" opacity="0.85" />
    {/* Bubbles */}
    <circle cx="45" cy="62" r="2.5" fill="#ffffff" opacity="0.8" />
    <circle cx="55" cy="67" r="1.8" fill="#ffffff" opacity="0.7" />
    <circle cx="50" cy="52" r="1.5" fill="#e9d5ff" opacity="0.9" />
    <defs>
      <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f3e8ff" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#6b21a8" />
      </linearGradient>
    </defs>
  </svg>
);

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onSelectCourse,
  onNavigate,
  onOpenLesson,
}) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [recentLessons, setRecentLessons] = useState<{ lesson: Lesson; courseId: string; courseTitle: string }[]>([]);
  const [enrolledMaterials, setEnrolledMaterials] = useState<{
    id: string;
    title: string;
    file_name?: string;
    file_type?: string;
    file_size?: string;
    url: string;
    lessonTitle: string;
    courseTitle: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentModalCourse, setEnrollmentModalCourse] = useState<Course | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [coursesData, announcementsData] = await Promise.all([
          api.courses.list(false),
          api.announcements.list(),
        ]);
        setCourses(coursesData);
        setAnnouncements(announcementsData.slice(0, 4));

        // Load detailed lessons & study materials ONLY from actively enrolled courses
        const enrolled = coursesData.filter((c) => (c as any).is_enrolled);
        const lessonsCollector: { lesson: Lesson; courseId: string; courseTitle: string }[] = [];
        const materialsCollector: {
          id: string;
          title: string;
          file_name?: string;
          file_type?: string;
          file_size?: string;
          url: string;
          lessonTitle: string;
          courseTitle: string;
        }[] = [];

        for (const c of enrolled) {
          try {
            const detailed = await api.courses.getById(c.id);
            if (detailed && detailed.subjects) {
              for (const subj of detailed.subjects) {
                if (subj.chapters) {
                  for (const chap of subj.chapters) {
                    if (chap.lessons) {
                      for (const les of chap.lessons) {
                        if (lessonsCollector.length < 4) {
                          lessonsCollector.push({
                            lesson: les,
                            courseId: c.id,
                            courseTitle: c.title,
                          });
                        }
                        if (les.study_materials && Array.isArray(les.study_materials)) {
                          for (const mat of les.study_materials) {
                            materialsCollector.push({
                              id: mat.id || `${les.id}-mat-${materialsCollector.length}`,
                              title: mat.title,
                              file_name: mat.file_name,
                              file_type: mat.file_type || 'PDF',
                              file_size: mat.file_size || '1.2 MB',
                              url: mat.url,
                              lessonTitle: les.title,
                              courseTitle: c.title,
                            });
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.warn('[ChemPoint] Notice loading course details for', c.id, e?.message || e);
          }
        }
        setRecentLessons(lessonsCollector);
        setEnrolledMaterials(materialsCollector);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const enrolledCourses = courses.filter((c) => (c as any).is_enrolled);

  const totalLessons = enrolledCourses.reduce((acc, c) => acc + (c.lessons_count || 0), 0);
  const avgProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce((acc, c) => acc + (c.progress_percentage || 0), 0) /
            enrolledCourses.length
        )
      : 0;

  const handleDownloadMaterial = (mat: { title: string; url?: string; file_name?: string }) => {
    if (mat.url && mat.url.startsWith('http')) {
      window.open(mat.url, '_blank');
      return;
    }
    const filename = mat.file_name || `${mat.title.replace(/\s+/g, '_')}.pdf`;
    const downloadUrl = mat.url || `/api/uploads/materials/${filename}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="w-12 h-12 border-3 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 tracking-wide">Loading ChemPoint student portal...</p>
        </div>
      </div>
    );
  }

  // PENDING ALLOCATION STATE (When student has NO assigned courses yet)
  if (enrolledCourses.length === 0) {
    return (
      <div className="space-y-8 pb-16">
        {/* HERO BANNER - REGISTRATION COMPLETE & AWAITING BATCH ALLOCATION */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white p-6 sm:p-9 shadow-xl shadow-purple-950/20 border border-purple-900/60">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 right-32 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-white border border-white/15 shadow-2xs">
                <span className="text-purple-300">CHEMPOINT</span>
                <span className="w-1 h-1 rounded-full bg-purple-300"></span>
                <span className="text-slate-200 font-medium">A Chemistry Institution</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md text-xs font-semibold text-amber-200 border border-amber-400/25">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>Admission Status: Awaiting Faculty Allocation</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2 flex-wrap">
              <span>Welcome to ChemPoint, {user?.full_name || 'Student'}!</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed font-normal">
              Your ChemPoint student profile is registered. ChemPoint is a private coaching institution in Agartala mentored by Tapas Majumder (M.Sc, B.Ed). Classroom batches, lectures, and study notes are assigned directly by faculty according to your center and batch.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <a
                href="tel:9366389429"
                aria-label="Call Faculty Tapas Majumder: 9366389429"
                className="btn-tactile px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/25 flex items-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>Contact Faculty (9366389429)</span>
              </a>
              <a
                href="mailto:tapash489@gmail.com"
                aria-label="Email Faculty Tapas Majumder: tapash489@gmail.com"
                className="btn-tactile px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 backdrop-blur-xs flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-purple-300" />
                <span>tapash489@gmail.com</span>
              </a>
              <a
                href="https://www.instagram.com/tapasmajumder.14/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Faculty Instagram profile @tapasmajumder.14"
                className="btn-tactile px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-pink-300 text-xs font-semibold border border-white/15 backdrop-blur-xs flex items-center gap-1.5 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@tapasmajumder.14</span>
              </a>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 text-slate-200 text-xs font-medium border border-white/15 backdrop-blur-xs">
                Roll ID: {user?.roll_number || 'CP-STU-PENDING'}
              </span>
            </div>
          </div>
        </div>

        {/* CLEAN EMPTY STATE - NO CLASSES ASSIGNED YET */}
        <Card variant="glass" padded="lg" className="text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 flex items-center justify-center mx-auto border border-purple-200/80 shadow-xs">
            <GraduationCap className="w-8 h-8 text-purple-700" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-900">No classes assigned yet</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your account has been created successfully. Your faculty will assign your classroom shortly.
            </p>
          </div>

          {/* Registration Details Summary */}
          <div className="max-w-lg mx-auto bg-purple-50/40 rounded-2xl p-5 border border-purple-100 text-left space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-purple-800">
              Registration Summary
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Student Name:</span>
                <span className="font-bold text-slate-900">{user?.full_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Roll Number:</span>
                <span className="font-bold text-slate-900">{user?.roll_number || 'Pending Assignment'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Target Program:</span>
                <span className="font-bold text-slate-900">{user?.target_exam || 'Class 11 Chemistry'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Preferred Center:</span>
                <span className="font-bold text-slate-900">{user?.batch_name || 'Agartala Center'}</span>
              </div>
            </div>
          </div>

          {/* Contact Action */}
          <div className="max-w-md mx-auto space-y-3 pt-2">
            <a
              href="tel:9366389429"
              className="btn-tactile inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-700/20 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Faculty Tapas Majumder</span>
            </a>
            <p className="text-[11px] text-slate-400">
              Classroom centers in Agartala: Ker Chowmuhani, Badharghat, and Bordowali.
            </p>
          </div>
        </Card>

        {/* ANNOUNCEMENTS & CIRCULARS (IF ANY) */}
        {announcements.length > 0 && (
          <Card variant="purple" padded="md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-700 text-white shadow-2xs">
                  Announcements
                </span>
                <span className="text-xs text-purple-950 font-semibold">
                  ChemPoint Academic Notices & Circulars
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 bg-white/90 backdrop-blur-xs rounded-2xl border border-purple-200/70 shadow-xs flex flex-col justify-between card-hover-effect"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          ann.priority === 'urgent'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : ann.priority === 'highlight'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ann.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{ann.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">{ann.content}</p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-3 pt-2 border-t border-purple-100 flex items-center justify-between">
                    <span>ChemPoint Faculty</span>
                    <span className="text-purple-700 font-semibold">Official Notice</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ========================================================= */}
      {/* SECTION 1: HERO ACADEMIC HEADER WITH CHEMPOINT IDENTITY */}
      {/* ========================================================= */}
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white p-6 sm:p-9 shadow-xl shadow-purple-950/20 border border-purple-900/60">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 right-32 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-white border border-white/15 shadow-2xs">
                <span className="text-purple-300">CHEMPOINT</span>
                <span className="w-1 h-1 rounded-full bg-purple-300"></span>
                <span className="text-slate-200 font-medium">A Chemistry Institution</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 backdrop-blur-md text-xs font-semibold text-purple-200 border border-purple-400/25">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Mentor: Tapas Majumder (M.Sc, B.Ed)</span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-xs font-medium text-indigo-200 border border-indigo-400/20">
                <span>Roll: {user?.roll_number || 'CP-STU-01'}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2 flex-wrap">
              <span>Welcome back, {user?.full_name || 'Student'}!</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed font-normal">
              {user?.batch_name ? (
                <>Enrolled in <span className="font-semibold text-white">{user.batch_name}</span>.</>
              ) : (
                'Classes 9–12 Chemistry, Complete Science & Mathematics (9–10), and B.Sc Chemistry.'
              )}{' '}
              Deepen your conceptual mastery with structured chapters, video lectures, and revision notes.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              {enrolledCourses.length > 0 && (
                <button
                  type="button"
                  onClick={() => onSelectCourse(enrolledCourses[0].id)}
                  className="btn-tactile px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/25 flex items-center gap-2 cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 text-white" />
                  <span>Resume {enrolledCourses[0].code}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigate('student-courses')}
                className="btn-tactile px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 flex items-center gap-2 backdrop-blur-xs transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-300" />
                <span>Browse All Batches</span>
              </button>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-400/25">
                Active Session 2026
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ========================================================= */}
      {/* SECTION 2: PROGRESS & ACADEMIC STATS */}
      {/* ========================================================= */}
      <ScrollReveal delay={0.05}>
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200/80 shadow-2xs">
                Academic Progress
              </span>
              <span className="text-xs text-slate-500 font-medium">Your current completion status across enrolled batches</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="glass" padded="sm" hoverable className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100 shadow-2xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                  {enrolledCourses.length > 0 ? enrolledCourses.length : courses.length}
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-1">Enrolled Batches</div>
              </div>
            </Card>

            <Card variant="glass" padded="sm" hoverable className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                  {avgProgress}%
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-1">Avg Completion</div>
              </div>
            </Card>

            <Card variant="glass" padded="sm" hoverable className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                  {enrolledCourses.reduce(
                    (acc, c) => acc + Math.round(((c.progress_percentage || 0) / 100) * (c.lessons_count || 0)),
                    3
                  )}
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-1">Completed Lessons</div>
              </div>
            </Card>

            <Card variant="glass" padded="sm" hoverable className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-2xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                  {totalLessons}
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-1">Available Lessons</div>
              </div>
            </Card>
          </div>
        </div>
      </ScrollReveal>

      {/* ========================================================= */}
      {/* SECTION 3: CONTINUE LEARNING (FEATURED ACTIVE COURSE) */}
      {/* ========================================================= */}
      {enrolledCourses.length > 0 && (
        <ScrollReveal delay={0.1}>
          <div className="rounded-3xl bg-gradient-to-r from-purple-50/90 via-indigo-50/60 to-purple-50/90 border border-purple-200/80 p-5 sm:p-6 shadow-xs relative overflow-hidden backdrop-blur-md">
            <div className="absolute right-4 top-4 opacity-10 pointer-events-none hidden sm:block">
              <FloatingAtom3D className="w-36 h-36" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-700 text-white shadow-xs">
                    Continue Learning
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white text-purple-900 border border-purple-200">
                    {enrolledCourses[0].code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {enrolledCourses[0].target_class}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {enrolledCourses[0].title}
                </h3>
                <p className="text-xs text-slate-600 max-w-xl line-clamp-2">
                  {enrolledCourses[0].description}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-48 h-2 rounded-full bg-slate-200/80 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                      style={{ width: `${enrolledCourses[0].progress_percentage || 45}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-purple-800">
                    {enrolledCourses[0].progress_percentage || 45}% Completed
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectCourse(enrolledCourses[0].id)}
                  className="btn-primary-cp px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Resume Lecture</span>
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* ========================================================= */}
      {/* SECTION 4: MY SUBJECTS */}
      {/* ========================================================= */}
      <ScrollReveal delay={0.12}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                My Subjects
              </span>
              <span className="text-xs text-slate-500 font-medium">Classes 9–12 Academic Focus Areas</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Chemistry */}
            <Card variant="glass" padded="sm" hoverable className="group flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition-transform mb-3">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">Chemistry</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Core</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Physical, Inorganic & Organic</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Classes 9–12</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Card>

            {/* Physics */}
            <Card variant="glass" padded="sm" hoverable className="group flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform mb-3">
                  <Atom className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">Physics</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Classes 9-10</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Mechanics, Light & Energy</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Foundation</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Card>

            {/* Mathematics */}
            <Card variant="glass" padded="sm" hoverable className="group flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center border border-violet-100 group-hover:scale-105 transition-transform mb-3">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors">Mathematics</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">Classes 9-10</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Algebra, Geometry & Trig</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Foundation</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Card>

            {/* Biology */}
            <Card variant="glass" padded="sm" hoverable className="group flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Biology</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Classes 9-10</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Life Processes & Genetics</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Foundation</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Card>
          </div>
        </div>
      </ScrollReveal>

      {/* ========================================================= */}
      {/* SECTION 5: MY CLASSES (ACTIVELY ENROLLED BATCHES ONLY) */}
      {/* ========================================================= */}
      <ScrollReveal delay={0.14}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200/80 shadow-2xs">
                My Classes
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Your actively assigned ChemPoint batches and curriculum
              </span>
            </div>
            <span className="text-xs font-semibold text-purple-900 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              {enrolledCourses.length} Enrolled {enrolledCourses.length === 1 ? 'Batch' : 'Batches'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => {
              const progress = course.progress_percentage || 40;
              const isFoundation = course.target_class.includes('Class 9') || course.target_class.includes('Class 10');

              return (
                <div
                  key={course.id}
                  className="group bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-purple-300 card-hover-effect overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-purple-950">
                      <img
                        src={
                          course.thumbnail_url && course.thumbnail_url.trim()
                            ? course.thumbnail_url
                            : 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&auto=format&fit=crop&q=80'
                        }
                        alt={course.title}
                        className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-85 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

                      <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-purple-700 text-white backdrop-blur-md shadow-sm border border-white/20">
                          {course.code}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-md">
                          Enrolled
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                        {isFoundation ? (
                          <FloatingAtom3D className="w-7 h-7" />
                        ) : (
                          <FloatingBeaker3D className="w-7 h-7" />
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md font-semibold flex items-center gap-1.5 border border-white/15">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-300" />
                          {course.target_class}
                        </span>
                        <span className="text-[11px] text-slate-300 font-medium">
                          ChemPoint Faculty
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-purple-700 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>

                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {isFoundation ? (
                          <>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              Physics
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                              Chemistry
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                              Mathematics
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Biology
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                              Physical Chemistry
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              Inorganic
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                              Organic Chemistry
                            </span>
                          </>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.subjects_count || (isFoundation ? 4 : 3)} Subjects</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <PlayCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.lessons_count || 12} Lessons</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1.5 font-medium">
                          <span className="text-slate-600 font-medium">Curriculum Progress</span>
                          <span className="text-purple-700 font-bold">{progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-700 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => onSelectCourse(course.id)}
                      className="btn-tactile w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Open Classroom Curriculum</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* ========================================================= */}
      {/* SECTION 6: RECENT LESSONS */}
      {/* ========================================================= */}
      {recentLessons.length > 0 && (
        <ScrollReveal delay={0.16}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs">
                  Recent Lessons
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Pick up where you left off in video lectures
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentLessons.map((item) => (
                <Card
                  key={item.lesson.id}
                  variant="glass"
                  padded="sm"
                  hoverable
                  onClick={() => {
                    if (onOpenLesson) {
                      onOpenLesson(item.lesson.id, item.courseId);
                    } else {
                      onSelectCourse(item.courseId);
                    }
                  }}
                  className="flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                        Lesson {item.lesson.order_index}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.lesson.duration_minutes}m
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-2">
                      {item.lesson.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {item.courseTitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-semibold">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <PlayCircle className="w-3.5 h-3.5 text-purple-600" /> Watch Lesson
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* ========================================================= */}
      {/* SECTION 7: STUDY MATERIALS */}
      {/* ========================================================= */}
      <ScrollReveal delay={0.18}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                Study Materials
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Classroom lecture notes, formula sheets, and chapter PDFs for your enrolled batch
              </span>
            </div>
          </div>

          {enrolledMaterials.length === 0 ? (
            <Card variant="glass" padded="md" className="text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No Study Materials Uploaded Yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Faculty Tapas Majumder will upload PDFs, formula handbooks, and chapter notes directly to your enrolled lessons.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledMaterials.map((mat) => (
                <Card
                  key={mat.id}
                  variant="glass"
                  padded="sm"
                  hoverable
                  className="flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {mat.file_type || 'PDF Notes'}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">{mat.courseTitle}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1 truncate" title={mat.title}>
                      {mat.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{mat.lessonTitle}</p>
                    <button
                      type="button"
                      onClick={() => handleDownloadMaterial(mat)}
                      className="btn-tactile mt-2.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download ({mat.file_size || 'PDF'})
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* ========================================================= */}
      {/* SECTION 8: ANNOUNCEMENTS & CIRCULARS */}
      {/* ========================================================= */}
      {announcements.length > 0 && (
        <ScrollReveal delay={0.2}>
          <Card variant="purple" padded="md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-700 text-white shadow-2xs">
                  Announcements
                </span>
                <span className="text-xs text-purple-950 font-semibold">
                  ChemPoint Academic Notices & Circulars
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('student-announcements')}
                className="btn-tactile text-xs font-bold text-purple-900 hover:text-purple-950 flex items-center gap-1 transition-colors cursor-pointer"
              >
                View All Notices <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 bg-white/90 backdrop-blur-xs rounded-2xl border border-purple-200/70 shadow-xs flex flex-col justify-between card-hover-effect"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          ann.priority === 'urgent'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : ann.priority === 'highlight'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ann.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{ann.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">{ann.content}</p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-3 pt-2 border-t border-purple-100 flex items-center justify-between">
                    <span>ChemPoint Faculty</span>
                    <span className="text-purple-700 font-semibold">Official Notice</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </ScrollReveal>
      )}

      {/* Admission Inquiry Modal */}
      {enrollmentModalCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card variant="glass" padded="lg" className="max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                Batch Enrollment
              </span>
              <button
                type="button"
                onClick={() => setEnrollmentModalCourse(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">{enrollmentModalCourse.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{enrollmentModalCourse.target_class} • Batch Code: {enrollmentModalCourse.code}</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs space-y-2 text-slate-700">
              <p className="font-semibold text-purple-950">How to get enrolled:</p>
              <p className="leading-relaxed">
                Admissions for this batch are confirmed directly by Faculty Tapas Majumder. Enrolled students are assigned to their respective center batch (Ker Chowmuhani, Badharghat, or Bordowali).
              </p>
              <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between">
                <span className="font-bold text-purple-900">Faculty Helpline:</span>
                <a href="tel:9366389429" className="font-black text-purple-700 hover:underline">
                  9366389429
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEnrollmentModalCourse(null)}
              className="btn-tactile w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Close
            </button>
          </Card>
        </div>
      )}
    </div>
  );
};
