import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { PublicLandingPage } from './components/public/PublicLandingPage';
import { AmbientBackground } from './components/common/AmbientBackground';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { CourseDetailView } from './components/student/CourseDetailView';
import { LessonPlayerView } from './components/student/LessonPlayerView';
import { AnnouncementsView } from './components/student/AnnouncementsView';
import { StudentProfileView } from './components/student/StudentProfileView';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CourseManagementView } from './components/admin/CourseManagementView';
import { StudentAccessManagementView } from './components/admin/StudentAccessManagementView';
import { AdminAnnouncementsView } from './components/admin/AdminAnnouncementsView';
import { FacultyAccountSettingsView } from './components/admin/FacultyAccountSettingsView';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { getStoredUser } from './services/api';

const MainApp: React.FC = () => {
  const { user, currentRole, logout, isInitialLoading } = useAuth();

  // Navigation State: Retrieve from sessionStorage so browser refreshes stay on active dashboard
  const [currentView, setCurrentView] = useState<string>(() => {
    try {
      const savedView = sessionStorage.getItem('chempoint_current_view');
      if (savedView && savedView !== 'public-home') return savedView;
    } catch {}
    const initialUser = getStoredUser();
    return initialUser
      ? initialUser.role === 'admin'
        ? 'admin-dashboard'
        : 'student-dashboard'
      : 'public-home';
  });

  const [activeCourseId, setActiveCourseId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('chempoint_active_course_id') || null;
    } catch {
      return null;
    }
  });

  const [activeLessonId, setActiveLessonId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('chempoint_active_lesson_id') || null;
    } catch {
      return null;
    }
  });

  // UI State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'student-login' | 'student-register' | 'admin-login'>('student-login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync active view and context into sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('chempoint_current_view', currentView);
      if (activeCourseId) sessionStorage.setItem('chempoint_active_course_id', activeCourseId);
      else sessionStorage.removeItem('chempoint_active_course_id');
      if (activeLessonId) sessionStorage.setItem('chempoint_active_lesson_id', activeLessonId);
      else sessionStorage.removeItem('chempoint_active_lesson_id');
    } catch {}
  }, [currentView, activeCourseId, activeLessonId]);

  // Guard against unauthorized view access & sync view on role resolution
  useEffect(() => {

    if (!user) {
      if (!isInitialLoading && currentView !== 'public-home') {
        setCurrentView('public-home');
        try {
          sessionStorage.setItem('chempoint_current_view', 'public-home');
        } catch {}
      }
      return;
    }

    // When user is authenticated:
    // If currently on public-home, smoothly transition to their appropriate dashboard!
    if (currentView === 'public-home') {
      const targetView = user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard';
      setCurrentView(targetView);
      try {
        sessionStorage.setItem('chempoint_current_view', targetView);
      } catch {}
      return;
    }

    const isAdminView = currentView.startsWith('admin-');
    if (user.role !== 'admin' && isAdminView) {
      setCurrentView('student-dashboard');
    } else if (user.role === 'admin' && currentView === 'student-dashboard') {
      setCurrentView('admin-dashboard');
    }
  }, [user, user?.role, currentView, isInitialLoading]);

  // Only show full-screen loader on initial application boot/session recovery
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#faf9fe] flex items-center justify-center relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/80 backdrop-blur-2xl border border-purple-200/80 shadow-2xl shadow-purple-950/10">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-3 border-purple-700 border-t-transparent animate-spin" />
            <div className="absolute w-6 h-6 rounded-full bg-purple-500/20 blur-xs animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-slate-900 tracking-tight">CHEMPOINT</p>
            <p className="text-xs text-purple-700 font-semibold mt-0.5">Connecting to academic console...</p>
          </div>
        </div>
      </div>
    );
  }

  // Switch view helper
  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
    try {
      sessionStorage.setItem('chempoint_current_view', view);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Student specific navigation
  const handleOpenCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    setCurrentView('student-course');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLesson = (lessonId: string, courseId: string) => {
    setActiveLessonId(lessonId);
    setActiveCourseId(courseId);
    setCurrentView('student-lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin specific navigation
  const handleOpenCourseHierarchy = (courseId: string) => {
    setActiveCourseId(courseId);
    setCurrentView('admin-courses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPublicView = currentView === 'public-home';

  return (
    <div className="min-h-screen bg-[#faf9fe] text-slate-900 flex flex-col font-sans selection:bg-purple-600 selection:text-white antialiased relative">
      {/* Global Ambient Liquid Atmosphere */}
      <AmbientBackground />

      {/* Top Navbar */}
      <Navbar
        onOpenAuth={(mode) => {
          if (mode) setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onNavigate={handleNavigate}
        currentView={currentView}
      />

      {/* Render Public Landing Page when on 'public-home' */}
      {isPublicView ? (
        <div className="flex-1 flex flex-col">
          {/* Quick logged-in shortcut banner if a user visits the public page while logged in */}
          {user && (
            <div className="bg-purple-950 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-purple-800">
              <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                  <span>
                    Signed in as <strong className="text-white">{user.full_name}</strong> (
                    {user.role === 'admin' ? 'Teacher / Admin' : 'Student'})
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleNavigate(user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard')
                  }
                  className="px-3 py-1 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <PublicLandingPage
            onOpenLogin={() => {
              setAuthModalMode('student-login');
              setIsAuthModalOpen(true);
            }}
            onOpenRegister={() => {
              setAuthModalMode('student-register');
              setIsAuthModalOpen(true);
            }}
            onExploreCourses={() => {
              if (user) {
                handleNavigate(user.role === 'admin' ? 'admin-courses' : 'student-courses');
              } else {
                const el = document.getElementById('courses-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        </div>
      ) : (
        /* Render Authenticated / Portal Layout with Sidebar */
        <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 items-start relative z-10">
          {/* Responsive Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            currentView={currentView}
            onNavigate={handleNavigate}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <main key={currentView} className="flex-1 min-w-0 animate-in fade-in duration-300 ease-out">
            {/* Role Indicator Banner */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 px-4 rounded-2xl bg-white/90 backdrop-blur-md border border-purple-100/80 shadow-2xs text-xs">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-slate-400 font-medium">Signed in as:</span>
                <strong className="text-slate-950 font-bold">{user?.full_name}</strong>
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-2xs ${
                    currentRole === 'admin'
                      ? 'bg-amber-50 text-amber-900 border-amber-200/80'
                      : 'bg-purple-50 text-purple-900 border-purple-200/80'
                  }`}
                >
                  {currentRole === 'admin' ? 'TEACHER / FACULTY' : 'STUDENT'}
                </span>
                <span className="hidden md:inline text-slate-300">•</span>
                <span className="hidden md:inline text-slate-600 font-medium">
                  {currentRole === 'admin'
                    ? 'Tapas Majumder (M.Sc, B.Ed) • ChemPoint Academic Console'
                    : `${user?.batch_name || 'Batch Allocation Pending'} • Roll: ${user?.roll_number || 'Pending'}`}
                </span>
              </div>
              <div className="text-[11px] text-slate-700 font-bold flex items-center gap-1.5 shrink-0 bg-slate-100/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>CHEMPOINT • Agartala</span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* STUDENT VIEWS */}
            {/* ========================================================= */}
            {(currentView === 'student-dashboard' ||
              currentView === 'student-courses' ||
              currentView === 'all-courses') && (
              <StudentDashboard
                onSelectCourse={handleOpenCourse}
                onNavigate={handleNavigate}
                onOpenLesson={handleOpenLesson}
              />
            )}

            {currentView === 'student-course' && activeCourseId && (
              <CourseDetailView
                courseId={activeCourseId}
                onBack={() => handleNavigate('student-dashboard')}
                onOpenLesson={handleOpenLesson}
              />
            )}

            {currentView === 'student-lesson' && activeCourseId && activeLessonId && (
              <LessonPlayerView
                courseId={activeCourseId}
                lessonId={activeLessonId}
                onBackToCourse={() => handleNavigate('student-course')}
                onSelectLesson={(newLessonId) => setActiveLessonId(newLessonId)}
              />
            )}

            {currentView === 'student-announcements' && <AnnouncementsView />}

            {currentView === 'student-profile' && (
              <StudentProfileView
                onSelectCourse={handleOpenCourse}
                onLogout={logout}
              />
            )}

            {/* ========================================================= */}
            {/* ADMIN / TEACHER VIEWS (WITH ROLE PROTECTION) */}
            {/* ========================================================= */}
            {currentView === 'admin-dashboard' &&
              (user?.role === 'admin' ? (
                <AdminDashboard
                  onNavigate={handleNavigate}
                  onOpenCreateCourse={() => {
                    setActiveCourseId(null);
                    handleNavigate('admin-courses');
                  }}
                  onEditCourse={(course) => {
                    setActiveCourseId(course.id);
                    handleNavigate('admin-courses');
                  }}
                  onOpenCourseHierarchy={handleOpenCourseHierarchy}
                />
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <h3 className="text-base font-bold text-slate-800">Faculty & Admin Access Only</h3>
                  <p className="text-xs text-slate-500 mt-1">Please switch to the Administrator profile from the top bar.</p>
                  <button
                    type="button"
                    onClick={() => handleNavigate('student-dashboard')}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-purple-700 rounded-xl hover:bg-purple-600 transition-colors cursor-pointer"
                  >
                    Return to Student Dashboard
                  </button>
                </div>
              ))}

            {currentView === 'admin-courses' &&
              (user?.role === 'admin' ? (
                <CourseManagementView
                  initialCourseId={activeCourseId}
                  onBackToDashboard={() => handleNavigate('admin-dashboard')}
                />
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <h3 className="text-base font-bold text-slate-800">Faculty & Admin Access Only</h3>
                  <button
                    type="button"
                    onClick={() => handleNavigate('student-dashboard')}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-purple-700 rounded-xl hover:bg-purple-600 transition-colors cursor-pointer"
                  >
                    Return to Student Dashboard
                  </button>
                </div>
              ))}

            {currentView === 'admin-students' &&
              (user?.role === 'admin' ? (
                <StudentAccessManagementView
                  onBackToDashboard={() => handleNavigate('admin-dashboard')}
                />
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <h3 className="text-base font-bold text-slate-800">Faculty & Admin Access Only</h3>
                  <button
                    type="button"
                    onClick={() => handleNavigate('student-dashboard')}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-purple-700 rounded-xl hover:bg-purple-600 transition-colors cursor-pointer"
                  >
                    Return to Student Dashboard
                  </button>
                </div>
              ))}

            {currentView === 'admin-announcements' &&
              (user?.role === 'admin' ? (
                <AdminAnnouncementsView
                  onBackToDashboard={() => handleNavigate('admin-dashboard')}
                />
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <h3 className="text-base font-bold text-slate-800">Faculty & Admin Access Only</h3>
                  <button
                    type="button"
                    onClick={() => handleNavigate('student-dashboard')}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-purple-700 rounded-xl hover:bg-purple-600 transition-colors cursor-pointer"
                  >
                    Return to Student Dashboard
                  </button>
                </div>
              ))}

            {currentView === 'admin-settings' &&
              (user?.role === 'admin' ? (
                <FacultyAccountSettingsView
                  onBackToDashboard={() => handleNavigate('admin-dashboard')}
                />
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <h3 className="text-base font-bold text-slate-800">Faculty & Admin Access Only</h3>
                  <button
                    type="button"
                    onClick={() => handleNavigate('student-dashboard')}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-purple-700 rounded-xl hover:bg-purple-600 transition-colors cursor-pointer"
                  >
                    Return to Student Dashboard
                  </button>
                </div>
              ))}
          </main>
        </div>
      )}

      {/* Auth Modal for Login / Registration */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessNavigate={(role) => {
          const dest = role === 'admin' ? 'admin-dashboard' : 'student-dashboard';
          handleNavigate(dest);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
