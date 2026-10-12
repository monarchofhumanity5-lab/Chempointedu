import React, { useEffect, useState } from 'react';
import { Course, Subject, Chapter, Lesson } from '../../types';
import { api } from '../../services/api';
import { Card } from '../common/Card';
import { ScrollReveal } from '../common/ScrollReveal';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  Sparkles,
  Layers,
  GraduationCap,
  Phone,
} from 'lucide-react';

interface CourseDetailViewProps {
  courseId: string;
  onBack: () => void;
  onOpenLesson: (lessonId: string, courseId: string) => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  courseId,
  onBack,
  onOpenLesson,
}) => {
  const [course, setCourse] = useState<(Course & { subjects: Subject[] }) | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingLessonId, setUpdatingLessonId] = useState<string | null>(null);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.courses.getById(courseId);
      setCourse(data);

      // Default to first subject
      if (data.subjects && data.subjects.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(data.subjects[0].id);
      }

      // Default expand all chapters
      const expands: Record<string, boolean> = {};
      data.subjects?.forEach((sub) => {
        sub.chapters?.forEach((ch) => {
          expands[ch.id] = true;
        });
      });
      setExpandedChapters(expands);
    } catch (err: any) {
      setError(err.message || 'Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleToggleCompletion = async (e: React.MouseEvent, lesson: Lesson) => {
    e.stopPropagation();
    setActionError(null);
    try {
      setUpdatingLessonId(lesson.id);
      const newStatus = !lesson.is_completed;
      await api.lessons.updateProgress(lesson.id, { completed: newStatus });
      // Refresh course state
      await fetchCourse();
    } catch (err: any) {
      setActionError(err.message || 'Could not update completion status.');
    } finally {
      setUpdatingLessonId(null);
    }
  };

  const handleDownloadNotes = (e: React.MouseEvent, lesson: Lesson) => {
    e.stopPropagation();
    const content =
      lesson.pdf_notes_content ||
      `# ${lesson.title}\n\nCHEMPOINT - Where Concepts Click.\nStudy Material & Classroom Lecture Notes\nDuration: ${lesson.duration_minutes} minutes\n\nNo detailed notes content available.`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', lesson.pdf_name || `${lesson.title.replace(/\s+/g, '_')}_Notes.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading syllabus progression...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    const isRestricted =
      error?.toLowerCase().includes('enrolled') ||
      error?.toLowerCase().includes('access restricted') ||
      error?.toLowerCase().includes('forbidden') ||
      error?.toLowerCase().includes('403');

    return (
      <div className="max-w-xl mx-auto my-8 p-8 text-center bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
          <GraduationCap className="w-8 h-8 text-amber-700" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 mb-2">
            {isRestricted ? 'Active Enrollment Required' : 'Access Notice'}
          </span>
          <h3 className="text-lg font-black text-slate-900">
            {isRestricted ? 'Batch Access Restricted' : 'Course Unavailable'}
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {error || 'You do not currently have active student enrollment access for this ChemPoint batch.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-left text-xs space-y-2">
          <p className="font-bold text-purple-950">Need batch enrollment?</p>
          <p className="text-slate-600">
            Contact Faculty Tapas Majumder directly or visit your classroom center (Ker Chowmuhani, Badharghat, Bordowali) to activate student access.
          </p>
          <div className="pt-1 font-bold text-purple-700">
            Helpline: <a href="tel:9366389429" className="hover:underline">9366389429</a>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="btn-tactile w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-sm cursor-pointer"
        >
          Return to My Enrolled Courses
        </button>
      </div>
    );
  }

  const activeSubject =
    course.subjects?.find((s) => s.id === selectedSubjectId) || course.subjects?.[0];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Return */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="btn-tactile inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-purple-600" />
          Back to Courses
        </button>
        <span className="text-xs font-semibold text-slate-500">
          Batch Code: <strong className="text-purple-800 font-bold">{course.code}</strong>
        </span>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs font-bold underline ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Course Hero Banner */}
      <ScrollReveal>
        <Card variant="glass" padded="lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-700 text-white">
                  {course.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200/60">
                  {course.target_class}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Lead: <strong className="text-slate-800">{course.instructor_name}</strong>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {course.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
                {course.description}
              </p>
            </div>

            {/* Progress Card */}
            <div className="lg:w-72 bg-gradient-to-br from-purple-50/60 to-indigo-50/40 rounded-2xl p-4 sm:p-5 border border-purple-100/80 shrink-0 shadow-xs">
              <div className="flex items-center justify-between text-xs font-medium mb-2">
                <span className="text-slate-600">Curriculum Progress</span>
                <span className="text-purple-700 font-black text-sm">
                  {course.progress_percentage || 0}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${course.progress_percentage || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>
                  Completed: <strong className="text-slate-800">{(course as any).completed_lessons || 0}</strong>
                </span>
                <span>
                  Total: <strong className="text-slate-800">{(course as any).total_lessons || 0} Lessons</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Subject Filter Tabs */}
          {course.subjects && course.subjects.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-900/60 mb-3 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                Subjects in this Batch:
              </div>
              <div className="flex flex-wrap gap-2">
                {course.subjects.map((sub) => {
                  const isSelected = sub.id === (activeSubject?.id || selectedSubjectId);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubjectId(sub.id)}
                      className={`btn-tactile flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                        isSelected
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-white/80 text-slate-700 hover:bg-purple-50/70 border border-slate-200/80'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sub.color || '#7e22ce' }}
                      ></span>
                      <span>{sub.title}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isSelected ? 'bg-purple-800 text-purple-100' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sub.chapters?.length || 0} Chapters
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </ScrollReveal>

      {/* Chapters & Lessons Syllabus Section */}
      <ScrollReveal delay={0.08}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {activeSubject?.title || 'Curriculum Chapters'}
              </h2>
              <p className="text-xs text-slate-500">
                Structured learning progression: watch lecture, study notes, mark complete
              </p>
            </div>
            <span className="text-xs font-semibold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              {activeSubject?.chapters?.length || 0} Chapters
            </span>
          </div>

          {(!activeSubject || !activeSubject.chapters || activeSubject.chapters.length === 0) ? (
            <Card variant="glass" padded="lg" className="text-center">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No chapters added yet for this subject.</p>
            </Card>
          ) : (
            activeSubject.chapters.map((chapter) => {
              const isExpanded = expandedChapters[chapter.id] !== false;
              const lessons = chapter.lessons || [];
              const completedCount = lessons.filter((l) => l.is_completed).length;

              return (
                <Card
                  key={chapter.id}
                  variant="glass"
                  padded="none"
                  className="overflow-hidden"
                >
                  {/* Chapter Header Card */}
                  <div
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-purple-50/30 transition-colors select-none"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 border border-purple-200">
                        {chapter.chapter_number}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">
                          {chapter.title}
                        </h3>
                        {chapter.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {chapter.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Est. {chapter.estimated_hours} Hours
                          </span>
                          <span>•</span>
                          <span>{lessons.length} Lessons</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold">
                            {completedCount}/{lessons.length} Completed
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Lessons List Inside Chapter */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/40 p-3 sm:p-4 space-y-2.5">
                      {lessons.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-3">
                          No lessons published in this chapter yet.
                        </p>
                      ) : (
                        lessons.map((lesson) => {
                          const isUpdating = updatingLessonId === lesson.id;
                          return (
                            <div
                              key={lesson.id}
                              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                                lesson.is_completed
                                  ? 'bg-white/90 border-emerald-200/80 shadow-xs'
                                  : 'bg-white/90 border-slate-200/80 hover:border-purple-200 shadow-xs'
                              }`}
                            >
                              {/* Left: Completion Toggle & Title */}
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={(e) => handleToggleCompletion(e, lesson)}
                                  className={`mt-0.5 shrink-0 transition-transform active:scale-90 cursor-pointer ${
                                    lesson.is_completed ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-500'
                                  }`}
                                  title={lesson.is_completed ? 'Mark incomplete' : 'Mark complete'}
                                >
                                  {lesson.is_completed ? (
                                    <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                                  ) : (
                                    <Circle className="w-5 h-5" />
                                  )}
                                </button>

                                <div className="min-w-0">
                                  <h4
                                    className={`text-xs sm:text-sm font-semibold truncate leading-tight cursor-pointer hover:text-purple-700 transition-colors ${
                                      lesson.is_completed ? 'text-slate-700' : 'text-slate-900'
                                    }`}
                                    onClick={() => onOpenLesson(lesson.id, course.id)}
                                  >
                                    {lesson.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                    {lesson.description || 'Comprehensive video lecture and PDF reference.'}
                                  </p>

                                  {/* Badges */}
                                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px]">
                                    <span className="inline-flex items-center gap-1 font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      {lesson.duration_minutes} Mins
                                    </span>

                                    {lesson.pdf_name && (
                                      <span className="inline-flex items-center gap-1 font-medium text-purple-700 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-md">
                                        <FileText className="w-3 h-3 text-purple-500" />
                                        {lesson.pdf_name} ({lesson.pdf_pages} pgs)
                                      </span>
                                    )}

                                    {lesson.is_completed && (
                                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                                        ✓ Completed
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Actions */}
                              <div className="flex items-center gap-2 sm:self-center shrink-0">
                                {lesson.pdf_name && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleDownloadNotes(e, lesson)}
                                    className="p-2 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors border border-transparent hover:border-purple-100 cursor-pointer"
                                    title="Download PDF Study Notes"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => onOpenLesson(lesson.id, course.id)}
                                  className={`btn-tactile px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                                    lesson.is_completed
                                      ? 'bg-slate-100 text-slate-700 hover:bg-purple-50/80 hover:text-purple-700'
                                      : 'bg-purple-700 text-white hover:bg-purple-800 shadow-xs'
                                  }`}
                                >
                                  <PlayCircle className="w-3.5 h-3.5" />
                                  <span>{lesson.is_completed ? 'Review' : 'Start Lesson'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </ScrollReveal>
    </div>
  );
};
