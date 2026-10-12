import React, { useEffect, useState } from 'react';
import { Course, Lesson, Subject } from '../../types';
import { api } from '../../services/api';
import { Card } from '../common/Card';
import { ScrollReveal } from '../common/ScrollReveal';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileText,
  Download,
  PlayCircle,
  Play,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  MessageSquare,
  Clock,
  Sparkles,
  ExternalLink,
  Send,
  Phone,
} from 'lucide-react';

interface LessonPlayerViewProps {
  courseId: string;
  lessonId: string;
  onBackToCourse: () => void;
  onSelectLesson: (newLessonId: string) => void;
}

export const LessonPlayerView: React.FC<LessonPlayerViewProps> = ({
  courseId,
  lessonId,
  onBackToCourse,
  onSelectLesson,
}) => {
  const [course, setCourse] = useState<(Course & { subjects: Subject[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'overview' | 'doubts'>('notes');
  const [isUpdatingCompletion, setIsUpdatingCompletion] = useState(false);

  // Doubts state
  const [doubts, setDoubts] = useState<
    { id: string; author: string; question: string; time: string; answer?: string }[]
  >([
    {
      id: 'd-1',
      author: 'Aman K. (Batch JEE-01)',
      question:
        'In the derivation of moment of inertia of a solid cylinder, why do we neglect the shear strain when calculating torsional equilibrium?',
      time: '2 hours ago',
      answer:
        'Faculty Response (Tapas Majumder): Because the cylinder is assumed strictly rigid (infinite shear modulus G -> inf), elastic displacement is zero under pure rotational kinetics.',
    },
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.courses.getById(courseId);
      setCourse(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load lesson details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  // Find active lesson, chapter, subject
  let currentLesson: Lesson | null = null;
  let currentChapter: any = null;
  let currentSubject: Subject | null = null;
  const allCourseLessons: { lesson: Lesson; chapterTitle: string }[] = [];

  if (course?.subjects) {
    for (const sub of course.subjects) {
      if (sub.chapters) {
        for (const ch of sub.chapters) {
          if (ch.lessons) {
            for (const l of ch.lessons) {
              allCourseLessons.push({ lesson: l, chapterTitle: ch.title });
              if (l.id === lessonId) {
                currentLesson = l;
                currentChapter = ch;
                currentSubject = sub;
              }
            }
          }
        }
      }
    }
  }

  // Find next and previous lessons
  const currentIndex = allCourseLessons.findIndex((item) => item.lesson.id === lessonId);
  const prevLessonItem = currentIndex > 0 ? allCourseLessons[currentIndex - 1] : null;
  const nextLessonItem =
    currentIndex !== -1 && currentIndex < allCourseLessons.length - 1
      ? allCourseLessons[currentIndex + 1]
      : null;

  const handleToggleCompletion = async () => {
    if (!currentLesson) return;
    setActionError(null);
    try {
      setIsUpdatingCompletion(true);
      const newStatus = !currentLesson.is_completed;
      await api.lessons.updateProgress(currentLesson.id, { completed: newStatus });
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Could not update completion status.');
    } finally {
      setIsUpdatingCompletion(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!currentLesson) return;
    if (currentLesson.pdf_url) {
      const a = document.createElement('a');
      a.href = currentLesson.pdf_url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    const content =
      currentLesson.pdf_notes_content ||
      `# ${currentLesson.title}\nCHEMPOINT - Where Concepts Click.\n\nStudy Material & Notes generated successfully.`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentLesson.pdf_name || `${currentLesson.title.replace(/\s+/g, '_')}_Notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePostDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setDoubts((prev) => [
      {
        id: `d-${Date.now()}`,
        author: 'You (Current Student)',
        question: newQuestion.trim(),
        time: 'Just now',
      },
      ...prev,
    ]);
    setNewQuestion('');
  };

  // Convert youtube watch URL to embed URL
  const getEmbedUrl = (url?: string): string | null => {
    if (!url || !url.trim()) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const vid = url.split('v=')[1]?.split('&')[0];
      return vid ? `https://www.youtube-nocookie.com/embed/${vid}?rel=0&modestbranding=1` : null;
    }
    if (url.includes('youtu.be/')) {
      const vid = url.split('youtu.be/')[1]?.split('?')[0];
      return vid ? `https://www.youtube-nocookie.com/embed/${vid}?rel=0&modestbranding=1` : null;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading lecture video and notes...</p>
        </div>
      </div>
    );
  }

  if (error || !currentLesson) {
    const isRestricted =
      error?.toLowerCase().includes('enrolled') ||
      error?.toLowerCase().includes('access restricted') ||
      error?.toLowerCase().includes('forbidden') ||
      error?.toLowerCase().includes('403');

    return (
      <div className="max-w-xl mx-auto my-8 p-8 text-center bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
          <BookOpen className="w-8 h-8 text-amber-700" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 mb-2">
            {isRestricted ? 'Active Enrollment Required' : 'Access Restricted'}
          </span>
          <h3 className="text-lg font-black text-slate-900">
            {isRestricted ? 'Lesson Access Restricted' : 'Lesson Unavailable'}
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {error || 'This lecture video and notes are restricted to actively enrolled students of this ChemPoint batch.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-left text-xs space-y-2">
          <p className="font-bold text-purple-950">Batch Admission & Enrollment Assistance</p>
          <p className="text-slate-600">
            Contact Faculty Tapas Majumder to confirm your enrollment in this batch or transfer between centers.
          </p>
          <div className="pt-1 font-bold text-purple-700">
            Helpline: <a href="tel:9366389429" className="hover:underline">9366389429</a>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToCourse}
          className="btn-tactile w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-sm cursor-pointer"
        >
          Return to Course / Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Breadcrumb & Next/Prev Controls */}
      <Card variant="glass" padded="sm" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
          <button
            type="button"
            onClick={onBackToCourse}
            className="font-semibold text-slate-700 hover:text-purple-700 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-purple-600" />
            <span>Course Syllabus</span>
          </button>
          <span>/</span>
          <span className="truncate text-slate-400">{currentSubject?.title}</span>
          <span>/</span>
          <span className="font-bold text-slate-900 truncate">{currentLesson.title}</span>
        </div>

        {/* Previous & Next Navigation */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            disabled={!prevLessonItem}
            onClick={() => prevLessonItem && onSelectLesson(prevLessonItem.lesson.id)}
            className="btn-tactile px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <button
            type="button"
            disabled={!nextLessonItem}
            onClick={() => nextLessonItem && onSelectLesson(nextLessonItem.lesson.id)}
            className="btn-tactile px-4 py-1.5 rounded-xl text-xs font-semibold bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Card>

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

      {/* Main Grid: Video Player + Right Playlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Video Player & Tabs */}
        <div className="lg:col-span-8 space-y-4">
          {/* Responsive 16:9 Video Player Box */}
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 shadow-xl border border-purple-950/40">
            {!currentLesson.video_url || !currentLesson.video_url.trim() ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <Play className="w-12 h-12 text-purple-400/40 mb-2" />
                <p className="text-sm font-semibold text-slate-300 mb-1">No Video Stream Attached</p>
                <p className="text-xs text-slate-500 max-w-sm">
                  This lecture currently contains syllabus materials and study notes. Please access the notes tab below.
                </p>
              </div>
            ) : currentLesson.video_url.includes('youtube.com') ||
              currentLesson.video_url.includes('youtu.be') ? (
              (() => {
                const embedUrl = getEmbedUrl(currentLesson.video_url);
                return embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={currentLesson.video_title || currentLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                    Unable to load video embed.
                  </div>
                );
              })()
            ) : (
              <video
                src={currentLesson.video_url}
                controls
                className="w-full h-full object-cover"
                poster={course?.thumbnail_url && course.thumbnail_url.trim() ? course.thumbnail_url : undefined}
              >
                Your browser does not support HTML5 video playback.
              </video>
            )}
          </div>

          {/* Lesson Header Actions Bar */}
          <Card variant="glass" padded="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  {currentSubject?.title}
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> {currentLesson.duration_minutes} Minutes
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight">
                {currentLesson.title}
              </h2>
            </div>

            {/* Mark as Completed Button */}
            <button
              type="button"
              id="btn-toggle-complete-lesson"
              disabled={isUpdatingCompletion}
              onClick={handleToggleCompletion}
              className={`btn-tactile px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer ${
                currentLesson.is_completed
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-purple-700 text-white hover:bg-purple-800 shadow-xs'
              }`}
            >
              {currentLesson.is_completed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Lesson Completed ✓</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-purple-200" />
                  <span>Mark as Completed</span>
                </>
              )}
            </button>
          </Card>

          {/* Tab Navigation (PDF Notes, Overview, Doubts) */}
          <Card variant="glass" padded="none" className="overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50/70 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-2 px-5 py-3.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'notes'
                    ? 'border-purple-700 text-purple-800 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-purple-600" />
                <span>PDF Study Notes & Formulas</span>
                {currentLesson.pdf_name && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                    {currentLesson.pdf_pages} pgs
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-5 py-3.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-purple-700 text-purple-800 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Lesson Syllabus & Concepts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('doubts')}
                className={`flex items-center gap-2 px-5 py-3.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'doubts'
                    ? 'border-purple-700 text-purple-800 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Faculty Q&A ({doubts.length})</span>
              </button>
            </div>

            {/* Tab 1: PDF Notes Viewer */}
            {activeTab === 'notes' && (
              <div className="p-6 space-y-4">
                {/* Attached Study Materials (if any) */}
                {currentLesson.study_materials && currentLesson.study_materials.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-600" />
                      <span>Attached Study Documents ({currentLesson.study_materials.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentLesson.study_materials.map((mat, idx) => (
                        <div
                          key={mat.id || idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-purple-300 transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {mat.title || mat.file_name}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {mat.file_name} {mat.file_size ? `• ${mat.file_size}` : ''}
                            </p>
                          </div>
                          {mat.url && (
                            <a
                              href={mat.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-tactile px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-xs flex items-center gap-1 shrink-0"
                            >
                              <Download className="w-3 h-3" />
                              <span>Open</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Primary Action Bar for PDF */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                      PDF
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        {currentLesson.pdf_name || `${currentLesson.title}_HandwrittenNotes.pdf`}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{currentLesson.pdf_pages || 14} Printed Pages</span>
                        <span>•</span>
                        <span>{currentLesson.pdf_size_mb || 2.8} MB High-Res</span>
                        <span>•</span>
                        <span className="text-purple-700 font-medium">Faculty Verified</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="btn-tactile px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Notes</span>
                  </button>
                </div>

                {/* Rendered Notes Viewer Canvas */}
                <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-800 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                  {currentLesson.pdf_notes_content ||
                    'Comprehensive classroom lecture derivations and problem sets.'}
                </div>
              </div>
            )}

            {/* Tab 2: Overview */}
            {activeTab === 'overview' && (
              <div className="p-6 space-y-4">
                <h3 className="font-bold text-sm text-slate-900">Lecture Description</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentLesson.description ||
                    'This session thoroughly analyzes the foundational tenets, calculus derivations, and exam-oriented problem templates required for advanced rankers.'}
                </p>

                <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2">
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Target Learning Outcomes:
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>Master algebraic and conceptual formulations of core chemical principles.</li>
                    <li>Solve previous 10 years competitive questions with short-cut heuristics.</li>
                    <li>
                      Consolidate formula sheets and error log entries in your institute workbook.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 3: Doubts & Discussion */}
            {activeTab === 'doubts' && (
              <div className="p-6 space-y-6">
                <form onSubmit={handlePostDoubt} className="space-y-3">
                  <label className="block text-xs font-bold text-slate-800">
                    Ask a Doubt to Faculty regarding this Lesson
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Type your question or conceptual doubt..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                    <button
                      type="submit"
                      className="btn-tactile px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Post
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  {doubts.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-semibold text-slate-800">{d.author}</span>
                        <span className="text-[11px]">{d.time}</span>
                      </div>
                      <p className="text-slate-700 font-medium">{d.question}</p>
                      {d.answer && (
                        <div className="mt-2 p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-950 text-[11px] leading-relaxed">
                          {d.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right 4 Cols: Course Curriculum Playlist */}
        <div className="lg:col-span-4 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden sticky top-20">
          <div className="p-4 border-b border-purple-100/60 bg-gradient-to-r from-purple-50/50 to-indigo-50/30 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-purple-950 uppercase tracking-wider">
                Curriculum Playlist
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                {course?.title}
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {allCourseLessons.length} Lessons
            </span>
          </div>

          <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
            {allCourseLessons.map((item, idx) => {
              const isActive = item.lesson.id === currentLesson?.id;
              return (
                <div
                  key={item.lesson.id}
                  onClick={() => onSelectLesson(item.lesson.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isActive ? 'bg-purple-50/90 border-l-4 border-l-purple-700' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.lesson.is_completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                          isActive
                            ? 'border-purple-700 text-purple-700'
                            : 'border-slate-300 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-slate-400 font-medium truncate">
                      {item.chapterTitle}
                    </div>
                    <div
                      className={`text-xs font-bold leading-snug line-clamp-2 ${
                        isActive ? 'text-purple-800' : 'text-slate-800'
                      }`}
                    >
                      {item.lesson.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span>{item.lesson.duration_minutes} Mins</span>
                      {item.lesson.pdf_name && <span>• PDF Notes</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
