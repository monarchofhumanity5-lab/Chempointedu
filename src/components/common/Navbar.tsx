import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Phone,
  BookOpen,
  Home,
  GraduationCap,
  KeyRound,
  Mail,
  Instagram,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { ChemPointLogo } from './ChemPointLogo';

interface NavbarProps {
  onOpenAuth: (mode?: 'student-login' | 'student-register' | 'admin-login') => void;
  onToggleSidebar: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onToggleSidebar,
  onNavigate,
  currentView,
}) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Determine active states
  const isHomeActive = currentView === 'public-home';
  const isLmsActive =
    currentView.includes('dashboard') ||
    currentView.includes('course') ||
    currentView.includes('lesson');
  const isAnnouncementsActive = currentView.includes('announcements');
  const isStudentsActive = currentView === 'admin-students';
  const isCoursesActive = currentView === 'admin-courses';

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ease-out ${
        isScrolled
          ? 'py-2 px-3 sm:px-6'
          : 'py-0 px-0'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto transition-all duration-500 ease-out ${
          isScrolled
            ? 'rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-2xl border border-purple-200/60 shadow-lg shadow-purple-950/5 px-4 sm:px-6'
            : 'bg-white/92 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 lg:px-8'
        }`}
      >
        <div className="flex items-center justify-between h-16 sm:h-17">
          
          {/* Left: Brand Identity & Portal Trigger */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {user && (
              <button
                id="btn-sidebar-toggle"
                type="button"
                onClick={onToggleSidebar}
                className="p-2 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-50 lg:hidden focus:outline-hidden transition-all duration-200 btn-tactile cursor-pointer"
                aria-label="Toggle curriculum navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* ChemPoint Logo & Typography */}
            <div
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group"
              onClick={() => {
                onNavigate('public-home');
                setIsMobileMenuOpen(false);
              }}
              title="ChemPoint Home"
            >
              <div className="relative transform group-hover:scale-105 transition-transform duration-300">
                <ChemPointLogo className="w-9 h-9 sm:w-10 sm:h-10" />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-purple-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
                    CHEM<span className="text-purple-700">POINT</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-900 border border-purple-200/80">
                    Est. 2017
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wide">
                  A Chemistry Institution
                </p>
              </div>
            </div>
          </div>

          {/* Center: Dynamic Desktop Navigation with Physical Pill Indicator */}
          <nav className="hidden lg:flex items-center gap-1 relative p-1 rounded-2xl bg-slate-100/70 border border-slate-200/50 backdrop-blur-md">
            
            {/* Common: Home Link */}
            <button
              type="button"
              onClick={() => onNavigate('public-home')}
              className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer z-10 btn-tactile ${
                isHomeActive
                  ? 'text-purple-950'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isHomeActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-xl bg-white shadow-xs border border-purple-200/70 -z-10 animate-in fade-in zoom-in-95 duration-200"
                />
              )}
              <Home className={`w-3.5 h-3.5 ${isHomeActive ? 'text-purple-700' : 'text-slate-400'}`} />
              <span>Home / About</span>
            </button>

            {/* Public Visitor Specific Links */}
            {!user && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('public-home');
                    const el = document.getElementById('courses-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all duration-200 flex items-center gap-1.5 cursor-pointer btn-tactile"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  <span>Academic Programs</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('public-home');
                    const el = document.getElementById('contact-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all duration-200 flex items-center gap-1.5 cursor-pointer btn-tactile"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Contact</span>
                </button>
              </>
            )}

            {/* Student Authenticated Links */}
            {user && user.role === 'student' && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('student-dashboard')}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer z-10 btn-tactile ${
                    isLmsActive
                      ? 'text-purple-950'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isLmsActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl bg-white shadow-xs border border-purple-200/70 -z-10 animate-in fade-in zoom-in-95 duration-200"
                    />
                  )}
                  <GraduationCap className={`w-3.5 h-3.5 ${isLmsActive ? 'text-purple-700' : 'text-slate-400'}`} />
                  <span>My Learning</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('student-announcements')}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer z-10 btn-tactile ${
                    isAnnouncementsActive
                      ? 'text-purple-950'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isAnnouncementsActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl bg-white shadow-xs border border-purple-200/70 -z-10 animate-in fade-in zoom-in-95 duration-200"
                    />
                  )}
                  <Bell className={`w-3.5 h-3.5 ${isAnnouncementsActive ? 'text-purple-700' : 'text-slate-400'}`} />
                  <span>Announcements</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('student-profile')}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer z-10 btn-tactile ${
                    currentView === 'student-profile'
                      ? 'text-purple-950'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {currentView === 'student-profile' && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl bg-white shadow-xs border border-purple-200/70 -z-10 animate-in fade-in zoom-in-95 duration-200"
                    />
                  )}
                  <User className={`w-3.5 h-3.5 ${currentView === 'student-profile' ? 'text-purple-700' : 'text-slate-400'}`} />
                  <span>Profile</span>
                </button>
              </>
            )}

            {/* Admin / Faculty Authenticated Links */}
            {user && user.role === 'admin' && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('admin-dashboard')}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer z-10 btn-tactile ${
                    currentView === 'admin-dashboard'
                      ? 'text-purple-950'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {currentView === 'admin-dashboard' && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl bg-white shadow-xs border border-purple-200/70 -z-10 animate-in fade-in zoom-in-95 duration-200"
                    />
                  )}
                  <Shield className={`w-3.5 h-3.5 ${currentView === 'admin-dashboard' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>Faculty Console</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('admin-students')}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer z-10 btn-tactile ${
                    isStudentsActive
                      ? 'text-purple-950'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isStudentsActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl bg-white shadow-xs border border-purple-200/70 -z-10 animate-in fade-in zoom-in-95 duration-200"
                    />
                  )}
                  <span>Students</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('admin-courses')}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer z-10 btn-tactile ${
                    isCoursesActive
                      ? 'text-purple-950'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isCoursesActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl bg-white shadow-xs border border-purple-200/70 -z-10 animate-in fade-in zoom-in-95 duration-200"
                    />
                  )}
                  <span>Courses</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('admin-announcements')}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer z-10 btn-tactile ${
                    isAnnouncementsActive
                      ? 'text-purple-950'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isAnnouncementsActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl bg-white shadow-xs border border-purple-200/70 -z-10 animate-in fade-in zoom-in-95 duration-200"
                    />
                  )}
                  <Bell className={`w-3.5 h-3.5 ${isAnnouncementsActive ? 'text-purple-700' : 'text-slate-400'}`} />
                  <span>Announcements</span>
                </button>
              </>
            )}
          </nav>

          {/* Right: Actions, Faculty Quick Contact, Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Direct Faculty Contact Actions (Desktop Only) */}
            <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <a
                href="tel:9366389429"
                aria-label="Call Faculty Tapas Majumder: 9366389429"
                className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border border-purple-200/60 shadow-2xs btn-tactile"
                title="Helpline: 9366389429"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>9366389429</span>
              </a>

              <a
                href="mailto:tapash489@gmail.com"
                aria-label="Email Faculty Tapas Majumder: tapash489@gmail.com"
                className="p-1.5 rounded-xl text-slate-500 hover:text-purple-700 hover:bg-purple-50 border border-transparent hover:border-purple-200/60 transition-all duration-200 btn-tactile"
                title="Email: tapash489@gmail.com"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://www.instagram.com/tapasmajumder.14/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tapas Majumder on Instagram: @tapasmajumder.14"
                className="p-1.5 rounded-xl text-slate-500 hover:text-pink-600 hover:bg-pink-50 border border-transparent hover:border-pink-200/60 transition-all duration-200 btn-tactile"
                title="Instagram: @tapasmajumder.14"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Authenticated User Menu */}
            {user ? (
              <div className="relative">
                <button
                  id="btn-user-profile-menu"
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-purple-50 transition-all duration-200 focus:outline-hidden cursor-pointer btn-tactile"
                >
                  <img
                    src={
                      user.avatar_url && user.avatar_url.trim()
                        ? user.avatar_url
                        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name || 'User')}`
                    }
                    alt={user.full_name || 'User Profile'}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-purple-200 shadow-2xs"
                  />
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {user.full_name}
                    </div>
                    <div className="text-[10px] text-purple-700 font-semibold">
                      {user.role === 'admin' ? 'Faculty Admin' : user.batch_name || 'Student'}
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-2xl shadow-2xl shadow-purple-950/15 border border-purple-100 p-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                      <div className="font-bold text-slate-900 text-xs">{user.full_name}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{user.email}</div>
                      <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-900 border border-purple-200">
                        {user.role === 'admin' ? 'Faculty Admin' : `Roll: ${user.roll_number || 'Enrolled'}`}
                      </div>
                    </div>

                    <button
                      id="btn-profile-view"
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate(user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-900 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      {user.role === 'admin' ? 'Faculty Dashboard' : 'Student LMS Dashboard'}
                    </button>

                    {user.role === 'admin' ? (
                      <button
                        id="btn-faculty-settings"
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('admin-settings');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-amber-50 hover:text-amber-900 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4 text-amber-600" />
                        Faculty Account & Security
                      </button>
                    ) : (
                      <button
                        id="btn-student-profile-settings"
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('student-profile');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-900 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-indigo-600" />
                        My Profile & Batches
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('public-home');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Home className="w-4 h-4 text-slate-400" />
                      Visit Public Website
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      id="btn-logout"
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        onNavigate('public-home');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Public Visitor CTAs */
              <div className="flex items-center gap-2">
                <button
                  id="btn-open-login"
                  type="button"
                  onClick={() => onOpenAuth('student-login')}
                  className="px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-purple-900 hover:bg-purple-50 transition-all duration-200 cursor-pointer btn-tactile"
                >
                  Sign In
                </button>
                <button
                  id="btn-open-register"
                  type="button"
                  onClick={() => onOpenAuth('student-register')}
                  className="px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold btn-primary-cp cursor-pointer"
                >
                  <span>Create Account</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-purple-900 hover:bg-purple-50 lg:hidden transition-colors cursor-pointer btn-tactile"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* High-End Glassmorphism Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 top-16 z-50 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-full max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border-b border-purple-200 p-5 shadow-2xl space-y-4 animate-in slide-in-from-top-4 duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Identity */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <ChemPointLogo className="w-7 h-7" />
                <span className="text-sm font-black text-slate-900">CHEMPOINT NAVIGATION</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Links */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  onNavigate('public-home');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                  isHomeActive
                    ? 'bg-purple-100 text-purple-950 border border-purple-200'
                    : 'text-slate-700 hover:bg-purple-50'
                }`}
              >
                <Home className="w-4 h-4 text-purple-700" />
                <span>Home / About ChemPoint</span>
              </button>

              {!user && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('public-home');
                      setIsMobileMenuOpen(false);
                      const el = document.getElementById('courses-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-purple-50"
                  >
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>Academic Programs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('public-home');
                      setIsMobileMenuOpen(false);
                      const el = document.getElementById('contact-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-purple-50"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Contact & Admissions</span>
                  </button>
                </>
              )}

              {user && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-purple-50"
                  >
                    <GraduationCap className="w-4 h-4 text-purple-700" />
                    <span>{user.role === 'admin' ? 'Faculty Console' : 'My Learning LMS'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(user.role === 'admin' ? 'admin-announcements' : 'student-announcements');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-purple-50"
                  >
                    <Bell className="w-4 h-4 text-purple-700" />
                    <span>Announcements</span>
                  </button>
                </>
              )}
            </div>

            {/* Direct Faculty Contact Strip */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Direct Faculty Helpline
              </p>
              <div className="flex flex-col gap-1.5 text-xs">
                <a
                  href="tel:9366389429"
                  className="flex items-center gap-2 p-2 rounded-xl bg-purple-50 text-purple-950 font-bold"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call 9366389429</span>
                </a>
                <a
                  href="mailto:tapash489@gmail.com"
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 text-slate-700 font-semibold"
                >
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  <span>tapash489@gmail.com</span>
                </a>
                <a
                  href="https://www.instagram.com/tapasmajumder.14/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-xl bg-pink-50 text-pink-900 font-semibold"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  <span>@tapasmajumder.14</span>
                </a>
              </div>
            </div>

            {/* Mobile Auth Buttons */}
            {!user ? (
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth('student-login');
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold rounded-xl border border-slate-300 text-slate-800"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth('student-register');
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold rounded-xl btn-primary-cp"
                >
                  Create Account
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                    onNavigate('public-home');
                  }}
                  className="w-full py-2 text-center text-xs font-bold rounded-xl bg-red-50 text-red-600 flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
