import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Course } from '../../types';
import { api } from '../../services/api';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Award,
  Calendar,
  LogOut,
  Save,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface StudentProfileViewProps {
  onSelectCourse: (courseId: string) => void;
  onLogout: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  onSelectCourse,
  onLogout,
}) => {
  const { user, updateProfile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [targetExam, setTargetExam] = useState(user?.target_exam || 'JEE Advanced');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.courses.list(true);
        setCourses(data);
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    try {
      setSaving(true);
      await updateProfile({
        full_name: fullName,
        phone,
        target_exam: targetExam,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Student Academic Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={
            user?.avatar_url && user.avatar_url.trim()
              ? user.avatar_url
              : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.full_name || 'Student')}`
          }
          alt={user?.full_name || 'Student Profile'}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-100 border border-slate-200/80 shrink-0"
        />

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80">
              Student ID: {user?.roll_number || 'APX-2026'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
              {user?.target_exam || 'Competitive Engineering / Medical'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{user?.full_name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Batch</div>
              <div className="font-semibold text-slate-800 mt-0.5">{user?.batch_name || 'General Admission'}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Admission Date</div>
              <div className="font-semibold text-slate-800 mt-0.5">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Enrolled Batches</div>
              <div className="font-semibold text-blue-700 mt-0.5">{courses.length} Active Courses</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200/80 transition-colors flex items-center gap-1.5 self-center sm:self-start shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Edit Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-1">Academic & Personal Details</h2>
        <p className="text-xs text-slate-500 mb-6">
          Keep your student record up to date for official test rankings and communications.
        </p>

        {saveSuccess && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile information successfully updated!</span>
          </div>
        )}

        {saveError && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <span>{saveError}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200/80 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-2xs transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200/80 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-2xs transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Competitive Exam</label>
            <select
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/80 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-2xs transition-all"
            >
              <option value="JEE Advanced & Mains">JEE Advanced & Mains (IIT/NIT)</option>
              <option value="NEET UG Medical">NEET UG Medical (AIIMS/JIPMER)</option>
              <option value="Foundation & Olympiads">Foundation & Junior Olympiads (PRMO/NSEJS)</option>
              <option value="Class 12 Boards">Class 12 Central/State Boards</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>

      {/* Enrolled Courses Track Record */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-1">Enrolled Courses & Progress</h2>
        <p className="text-xs text-slate-500 mb-4">
          All batches assigned to your student roll number
        </p>

        <div className="space-y-3">
          {courses.length === 0 ? (
            <div className="p-5 rounded-xl border border-dashed border-slate-200 text-center space-y-2 bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-700">No classes assigned yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Your ChemPoint account has been created successfully. Your faculty will assign your classroom shortly.
              </p>
              <div className="pt-1">
                <a
                  href="tel:9366389429"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Contact Faculty: 9366389429</span>
                </a>
              </div>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="p-4 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors bg-white shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {course.code}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{course.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{course.subjects_count || 0} Subjects</span>
                    <span>•</span>
                    <span>{course.lessons_count || 0} Lessons</span>
                    <span>•</span>
                    <span className="text-blue-700 font-semibold">
                      {course.progress_percentage || 0}% Completed
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCourse(course.id)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100/80 transition-colors self-start sm:self-auto border border-blue-100"
                >
                  Go to Course
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
