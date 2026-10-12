import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Bell,
  User,
  Users,
  FolderTree,
  Megaphone,
  ChevronRight,
  ShieldCheck,
  Award,
  X,
  Home,
  Phone,
  Mail,
  Instagram,
  KeyRound,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const studentNav = [
    { id: 'student-dashboard', label: 'My Learning Dashboard', icon: LayoutDashboard },
    { id: 'student-courses', label: 'My Classroom & Batches', icon: BookOpen },
    { id: 'student-announcements', label: 'Announcements', icon: Bell },
    { id: 'student-profile', label: 'Student Profile', icon: User },
    { id: 'public-home', label: 'ChemPoint Public Portal', icon: Home },
  ];

  const adminNav = [
    { id: 'admin-dashboard', label: 'Faculty Overview', icon: LayoutDashboard },
    { id: 'admin-courses', label: 'Curriculum & Lectures', icon: FolderTree },
    { id: 'admin-students', label: 'Student Access Control', icon: Users },
    { id: 'admin-announcements', label: 'Announcements & Alerts', icon: Megaphone },
    { id: 'admin-settings', label: 'Faculty Account & Security', icon: KeyRound },
    { id: 'public-home', label: 'ChemPoint Public Portal', icon: Home },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl flex flex-col justify-between transition-transform duration-300 ease-out shadow-2xl lg:shadow-xs lg:translate-x-0 lg:static lg:inset-auto lg:z-auto lg:w-64 lg:shrink-0 lg:h-[calc(100vh-6.5rem)] lg:sticky lg:top-20 lg:rounded-3xl lg:border lg:border-purple-100/70 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          {/* Mobile drawer header */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Navigation Menu
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Context Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/80 via-indigo-50/40 to-white border border-purple-200/70 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-2xs ${
                  isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                }`}
              >
                {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-900">
                {isAdmin ? 'Teacher / Admin Portal' : 'Student Study Center'}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 leading-snug truncate">
              {isAdmin ? 'Tapas Majumder (Faculty)' : user?.batch_name || 'Batch Allocation Pending'}
            </p>
            {!isAdmin && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-purple-800 border border-purple-200/80 shadow-2xs">
                  {user?.target_exam || 'Class 11 Chemistry'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                  {user?.roll_number ? `Roll: ${user.roll_number}` : 'Admission Pending'}
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isAdmin ? 'Faculty Management' : 'Academic Hub'}
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    type="button"
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 cursor-pointer btn-tactile ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-bold shadow-md shadow-purple-700/20'
                        : 'text-slate-600 hover:bg-purple-50/70 hover:text-purple-950 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-purple-200" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer info: ChemPoint helpline & faculty contact */}
        <div className="p-3.5 border-t border-purple-100/60 bg-gradient-to-b from-purple-50/30 to-slate-50/70 lg:rounded-b-3xl space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CHEMPOINT</span>
            </div>
            <a
              href="tel:9366389429"
              aria-label="Call Tapas Majumder at 9366389429"
              className="text-purple-700 font-extrabold hover:text-purple-900 transition-colors flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              9366389429
            </a>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <a
              href="mailto:tapash489@gmail.com"
              aria-label="Email Tapas Majumder: tapash489@gmail.com"
              className="hover:text-purple-700 transition-colors flex items-center gap-1"
            >
              <Mail className="w-3 h-3 text-purple-600" />
              tapash489@gmail.com
            </a>
            <a
              href="https://www.instagram.com/tapasmajumder.14/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @tapasmajumder.14"
              className="text-purple-600 hover:text-pink-600 transition-colors flex items-center gap-1"
            >
              <Instagram className="w-3 h-3" />
              @tapasmajumder.14
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
