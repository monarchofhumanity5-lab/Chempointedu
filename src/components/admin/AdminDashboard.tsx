import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminStats, Course } from '../../types';
import { api } from '../../services/api';
import { ConfirmModal } from '../common/ConfirmModal';
import { Card } from '../common/Card';
import { AnimatedCounter } from '../common/MotionSystem';
import { ScrollReveal } from '../common/ScrollReveal';
import {
  Users,
  BookOpen,
  PlayCircle,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  Megaphone,
  FolderTree,
  RotateCcw,
  Trash2,
  Edit,
  Sparkles,
  Layers,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
  onOpenCreateCourse: () => void;
  onEditCourse: (course: Course) => void;
  onOpenCourseHierarchy: (courseId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenCreateCourse,
  onEditCourse,
  onOpenCourseHierarchy,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = async () => {
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setActionError(null);
      const [statsData, coursesData] = await Promise.all([
        api.admin.getStats(),
        api.courses.list(false),
      ]);
      setStats(statsData);
      setCourses(coursesData);
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || 'Failed to load institute dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  const promptDeleteCourse = (courseId: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Course',
      message: `Are you sure you want to delete "${title}" and all of its subjects, chapters, and lessons? This action cannot be undone.`,
      confirmText: 'Delete Course',
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          setActionError(null);
          await api.courses.delete(courseId);
          setConfirmDialog(null);
          await loadData();
        } catch (err: any) {
          setActionError(err.message || 'Failed to delete course.');
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const promptResetData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Coaching Data',
      message: 'Are you sure you want to reset institute data back to the default coaching seed dataset? All customized courses, enrollments, and lessons will be restored to defaults.',
      confirmText: 'Reset Institute Data',
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          setResetting(true);
          setActionError(null);
          await api.admin.resetInstituteData();
          setConfirmDialog(null);
          await loadData();
        } catch (err: any) {
          setActionError(err.message || 'Reset failed.');
        } finally {
          setIsDeleting(false);
          setResetting(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading institute administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Header */}
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white p-6 sm:p-9 shadow-xl shadow-purple-950/20 border border-purple-900/60">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 right-32 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold mb-3 border border-purple-400/25 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                <span>ChemPoint Faculty & Admin Console</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">ChemPoint Academic Administration</h1>
              <p className="text-xs text-slate-300 mt-1.5 max-w-xl font-normal leading-relaxed">
                Control curriculum hierarchy (Course → Subject → Chapter → Lesson), upload video and notes, manage student enrollment permissions, and broadcast announcements.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onOpenCreateCourse}
                className="btn-primary-cp px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Course</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('admin-announcements')}
                className="btn-tactile px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 backdrop-blur-xs flex items-center gap-2 cursor-pointer"
              >
                <Megaphone className="w-4 h-4 text-purple-300" />
                <span>Post Notice</span>
              </button>

              <button
                type="button"
                disabled={resetting}
                onClick={promptResetData}
                className="btn-tactile p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 cursor-pointer"
                title="Reload seed coaching batches"
              >
                <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {actionError && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-red-500 hover:text-red-800 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Stat Cards */}
      <ScrollReveal delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="glass" padded="sm" hoverable className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                <AnimatedCounter value={stats?.total_students || 0} />
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">Total Students</div>
            </div>
          </Card>

          <Card variant="glass" padded="sm" hoverable className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                <AnimatedCounter value={stats?.total_courses || 0} />
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">Active Batches</div>
            </div>
          </Card>

          <Card variant="glass" padded="sm" hoverable className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                <AnimatedCounter value={stats?.total_lessons || 0} />
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">Total Lessons</div>
            </div>
          </Card>

          <Card variant="glass" padded="sm" hoverable className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                <AnimatedCounter value={stats?.average_completion_rate || 0} suffix="%" />
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">Avg Completion</div>
            </div>
          </Card>
        </div>
      </ScrollReveal>

      {/* Course Management Quick Table */}
      <ScrollReveal delay={0.08}>
        <Card variant="glass" padded="none" className="overflow-hidden">
          <div className="p-5 border-b border-purple-100/60 bg-purple-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Institute Courses & Batches</h2>
              <p className="text-xs text-slate-500">
                Manage syllabus structure, subjects, chapters, video links, and PDF notes
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('admin-courses')}
              className="btn-tactile text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              Open Curriculum Editor <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="py-3.5 px-4">Course / Batch</th>
                  <th className="py-3.5 px-4">Class Target</th>
                  <th className="py-3.5 px-4">Lead Faculty</th>
                  <th className="py-3.5 px-4">Structure</th>
                  <th className="py-3.5 px-4">Enrolled Students</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            course.thumbnail_url && course.thumbnail_url.trim()
                              ? course.thumbnail_url
                              : 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&auto=format&fit=crop&q=80'
                          }
                          alt={course.title}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200/80 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">{course.title}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                            {course.code}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{course.target_class}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{course.instructor_name}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-bold text-slate-900">{course.subjects_count || 0}</span> Subj •{' '}
                      <span className="font-bold text-slate-900">{course.chapters_count || 0}</span> Chap •{' '}
                      <span className="font-bold text-slate-900">{course.lessons_count || 0}</span> Less
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800">
                        {course.enrolled_students_count || 0} Students
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          course.is_published
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                        }`}
                      >
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenCourseHierarchy(course.id)}
                          className="btn-tactile p-1.5 text-purple-700 hover:bg-purple-100/70 rounded-xl transition-colors cursor-pointer"
                          title="Manage Curriculum (Subjects/Chapters/Lessons)"
                        >
                          <FolderTree className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditCourse(course)}
                          className="btn-tactile p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          title="Edit Course Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          id={`btn-delete-course-${course.id}`}
                          onClick={() => promptDeleteCourse(course.id, course.title)}
                          className="btn-tactile p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </ScrollReveal>

      {/* Admin Quick Shortcuts */}
      <ScrollReveal delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            variant="glass"
            padded="md"
            hoverable
            onClick={() => onNavigate('admin-students')}
            className="flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Student Access & Enrollment Control</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Grant or revoke course access for individual students, view completed lessons, and manage rosters.
              </p>
            </div>
          </Card>

          <Card
            variant="glass"
            padded="md"
            hoverable
            onClick={() => onNavigate('admin-announcements')}
            className="flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Institute Broadcasts & Urgent Circulars</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Notify students about exam dates, mock test schedules, and uploaded formula sheets.
              </p>
            </div>
          </Card>
        </div>
      </ScrollReveal>

      {/* In-App Confirmation Modal */}
      {confirmDialog && (
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText || 'Confirm'}
          isLoading={isDeleting}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => {
            if (!isDeleting) setConfirmDialog(null);
          }}
        />
      )}
    </div>
  );
};
