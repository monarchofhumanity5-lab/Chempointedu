import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Course, UserProfile } from '../../types';
import { api } from '../../services/api';
import { Card } from '../common/Card';
import { ScrollReveal } from '../common/ScrollReveal';
import {
  Users,
  Search,
  Check,
  ArrowLeft,
  Plus,
  Sparkles,
  Shield,
  GraduationCap,
  Edit2,
  Save,
  X,
} from 'lucide-react';

interface StudentAccessManagementViewProps {
  onBackToDashboard: () => void;
}

export const StudentAccessManagementView: React.FC<StudentAccessManagementViewProps> = ({
  onBackToDashboard,
}) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [editingBatchStudentId, setEditingBatchStudentId] = useState<string | null>(null);
  const [batchDraft, setBatchDraft] = useState<{ batch_name: string; target_exam: string }>({
    batch_name: '',
    target_exam: '',
  });
  const [isSavingBatch, setIsSavingBatch] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = async () => {
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setActionError(null);
      const [studentsData, coursesData] = await Promise.all([
        api.students.list(),
        api.courses.list(false),
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || 'Failed to load student access data.');
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

  const handleStartEditBatch = (student: any) => {
    setEditingBatchStudentId(student.id);
    setBatchDraft({
      batch_name: student.batch_name || 'Class 11 Chemistry Batch',
      target_exam: student.target_exam || 'Class 11 Chemistry',
    });
  };

  const handleSaveBatch = async (studentId: string) => {
    try {
      setIsSavingBatch(true);
      setActionError(null);
      await api.students.updateBatch(studentId, batchDraft.batch_name, batchDraft.target_exam);
      setEditingBatchStudentId(null);
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update student batch allocation.');
    } finally {
      setIsSavingBatch(false);
    }
  };

  const handleToggleAccess = async (studentId: string, courseId: string, isEnrolled: boolean) => {
    try {
      setActionError(null);
      const action = isEnrolled ? 'revoke' : 'enroll';
      setActionLoadingId(`${studentId}-${courseId}`);
      await api.students.updateAccess(studentId, courseId, action);
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update student access.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.roll_number && s.roll_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="btn-tactile text-xs font-bold text-slate-500 hover:text-purple-700 flex items-center gap-1.5 mb-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-purple-600" />
              Back to Dashboard
            </button>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-purple-700" />
              Student Access & Enrollment Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Grant or revoke student permissions to specific coaching batches and courses
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student name or roll..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200/80 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white/90 backdrop-blur-xs shadow-2xs transition-all placeholder:text-slate-400"
            />
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

      {/* Student List & Matrix */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card variant="glass" padded="lg" className="text-center">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">No registered students found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((student, idx) => (
            <ScrollReveal key={student.id} delay={idx * 0.04}>
              <Card
                variant="glass"
                padded="md"
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left Student Info */}
                <div className="flex items-start gap-4">
                  <img
                    src={
                      student.avatar_url && student.avatar_url.trim()
                        ? student.avatar_url
                        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.full_name || student.email || 'Student')}&backgroundColor=7e22ce`
                    }
                    alt={student.full_name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-100 shrink-0 border border-purple-200/60 shadow-xs"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.full_name || student.email || 'Student')}&backgroundColor=7e22ce`;
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 tracking-tight">{student.full_name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Roll: {student.roll_number}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{student.email}</div>
                    {editingBatchStudentId === student.id ? (
                      <div className="mt-2 p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-2 max-w-sm">
                        <div className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">
                          Allocate Coaching Batch & Exam
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Batch</label>
                            <select
                              value={batchDraft.batch_name}
                              onChange={(e) => setBatchDraft({ ...batchDraft, batch_name: e.target.value })}
                              className="w-full p-1.5 text-xs bg-white rounded-lg border border-purple-200 focus:outline-hidden focus:ring-1 focus:ring-purple-600"
                            >
                              <option value="Class 11 Chemistry Batch">Class 11 Chemistry Batch</option>
                              <option value="Class 12 Chemistry Batch">Class 12 Chemistry Batch</option>
                              <option value="Class 10 Foundation Batch">Class 10 Foundation Batch</option>
                              <option value="Class 9 Foundation Batch">Class 9 Foundation Batch</option>
                              <option value="Dropper / Target Batch">Dropper / Target Batch</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Target Exam</label>
                            <input
                              type="text"
                              value={batchDraft.target_exam}
                              onChange={(e) => setBatchDraft({ ...batchDraft, target_exam: e.target.value })}
                              placeholder="e.g. CBSE / Board + Entrance"
                              className="w-full p-1.5 text-xs bg-white rounded-lg border border-purple-200 focus:outline-hidden focus:ring-1 focus:ring-purple-600"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            disabled={isSavingBatch}
                            onClick={() => handleSaveBatch(student.id)}
                            className="btn-tactile px-2.5 py-1 rounded-md bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <Save className="w-3 h-3" />
                            <span>{isSavingBatch ? 'Saving...' : 'Save Batch'}</span>
                          </button>
                          <button
                            type="button"
                            disabled={isSavingBatch}
                            onClick={() => setEditingBatchStudentId(null)}
                            className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1.5 font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <span>Batch: <strong className="text-slate-800">{student.batch_name}</strong></span>
                          <button
                            type="button"
                            onClick={() => handleStartEditBatch(student)}
                            title="Allocate / Change student batch"
                            className="p-0.5 rounded text-purple-600 hover:text-purple-800 hover:bg-purple-50 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </span>
                        <span>•</span>
                        <span>Target: <strong className="text-slate-800">{student.target_exam}</strong></span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">
                          {student.completed_lessons_count || 0} Lessons Completed
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Course Access Toggle Matrix */}
                <div className="flex-1 max-w-xl">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-purple-900/60 mb-2">
                    Course Enrollment Access:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course) => {
                      const isEnrolled = (student.enrolled_course_ids || []).includes(course.id);
                      const isLoading = actionLoadingId === `${student.id}-${course.id}`;

                      return (
                        <button
                          key={course.id}
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleToggleAccess(student.id, course.id, isEnrolled)}
                          className={`btn-tactile px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isEnrolled
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-2xs'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300'
                          }`}
                          title={isEnrolled ? 'Click to revoke access' : 'Click to grant access'}
                        >
                          {isEnrolled ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{course.code} (Enrolled)</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 text-slate-400" />
                              <span>{course.code}</span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
};
