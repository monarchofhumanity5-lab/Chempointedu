import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Fingerprint,
  UserCheck,
  ArrowRight,
  Send,
} from 'lucide-react';
import { ChemPointLogo } from '../common/ChemPointLogo';

interface FacultyAccountSettingsViewProps {
  onBackToDashboard?: () => void;
}

export const FacultyAccountSettingsView: React.FC<FacultyAccountSettingsViewProps> = ({
  onBackToDashboard,
}) => {
  const { user, changePassword, changeEmail, resetPassword } = useAuth();

  // Change Password state
  const [currentPasswordForPw, setCurrentPasswordForPw] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Change Email state
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [showEmailPw, setShowEmailPw] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Reset email dispatch state
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [resetEmailSuccess, setResetEmailSuccess] = useState<string | null>(null);
  const [resetEmailError, setResetEmailError] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPasswordForPw) {
      setPasswordError('Please provide your current faculty password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await changePassword({
        currentPassword: currentPasswordForPw,
        newPassword,
        confirmPassword,
      });
      setPasswordSuccess(res.message || 'Faculty password updated successfully in Supabase Auth.');
      setCurrentPasswordForPw('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password. Please verify current password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSuccess(null);
    setEmailError(null);

    const clean = newEmail.trim().toLowerCase();
    if (!clean || !/^\S+@\S+\.\S+$/.test(clean)) {
      setEmailError('Please enter a valid new email address.');
      return;
    }
    if (!currentPasswordForEmail) {
      setEmailError('Please enter your current faculty password to authorize email change.');
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const res = await changeEmail({
        newEmail: clean,
        currentPassword: currentPasswordForEmail,
      });
      setEmailSuccess(res.message || 'Faculty email updated successfully in Supabase Auth.');
      setNewEmail('');
      setCurrentPasswordForEmail('');
    } catch (err: any) {
      setEmailError(err.message || 'Failed to update email address.');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleDispatchResetEmail = async () => {
    if (!user?.email) return;
    setResetEmailSuccess(null);
    setResetEmailError(null);
    setIsSendingResetEmail(true);
    try {
      const res = await resetPassword(user.email);
      setResetEmailSuccess(
        res.message || `Password reset link dispatched to ${user.email}. Check inbox or spam.`
      );
    } catch (err: any) {
      setResetEmailError(err.message || 'Unable to send password reset email.');
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 text-white shadow-xl relative overflow-hidden border border-purple-900/40">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-2 shadow-inner">
              <ChemPointLogo className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Faculty Administration
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Supabase Auth Active
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white mt-1">
                Faculty Account & Security Credentials
              </h1>
              <p className="text-xs text-purple-200/80 mt-0.5">
                Manage your administrative login credentials, update faculty email, and configure Supabase Auth password.
              </p>
            </div>
          </div>

          {onBackToDashboard && (
            <button
              id="btn-back-to-dashboard"
              type="button"
              onClick={onBackToDashboard}
              className="btn-tactile self-start md:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 cursor-pointer backdrop-blur-xs"
            >
              ← Back to Overview
            </button>
          )}
        </div>
      </div>

      {/* Security Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Authority Role
            </p>
            <p className="text-sm font-black text-slate-900 truncate">
              {user?.role === 'admin' ? 'Faculty Administrator' : 'Restricted'}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Full LMS Clearance</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Faculty Email
            </p>
            <p className="text-sm font-black text-slate-900 truncate" title={user?.email}>
              {user?.email || 'admin@chempoint.edu'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Primary Auth Identifier</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Auth Integration
            </p>
            <p className="text-sm font-black text-slate-900 truncate">Supabase Auth Verified</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Zero Public Shortcuts</p>
          </div>
        </div>
      </div>

      {/* Main Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Update Password */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Change Faculty Password</h2>
                  <p className="text-[11px] text-slate-500">Requires current password confirmation</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Min 8 characters
              </span>
            </div>

            {passwordSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-current-faculty-pw"
                    type={showCurrentPw ? 'text' : 'password'}
                    required
                    value={currentPasswordForPw}
                    onChange={(e) => setCurrentPasswordForPw(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle current password visibility"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-new-faculty-pw"
                    type={showNewPw ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 8 characters"
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle new password visibility"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-confirm-faculty-pw"
                    type={showConfirmPw ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-submit-change-password"
                type="submit"
                disabled={isUpdatingPassword}
                className="btn-tactile w-full mt-3 py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isUpdatingPassword ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying & Updating in Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Update Faculty Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Section 2: Update Email & Password Reset Dispatch */}
        <div className="space-y-6">
          {/* Update Email Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Update Faculty Email</h2>
                  <p className="text-[11px] text-slate-500">Synchronizes Supabase Auth and admin profile</p>
                </div>
              </div>
            </div>

            {emailSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{emailSuccess}</span>
              </div>
            )}

            {emailError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{emailError}</span>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Faculty Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-new-faculty-email"
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. tapas.majumder@chempoint.edu"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm With Current Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-password-for-email-change"
                    type={showEmailPw ? 'text' : 'password'}
                    required
                    value={currentPasswordForEmail}
                    onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                    placeholder="Enter current password to authorize"
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailPw(!showEmailPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showEmailPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-submit-change-email"
                type="submit"
                disabled={isUpdatingEmail}
                className="btn-tactile w-full mt-2 py-2.5 px-4 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isUpdatingEmail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Email Address...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Update Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Supabase Password Reset Email Dispatch */}
          <div className="bg-gradient-to-br from-amber-50/60 to-purple-50/40 rounded-2xl border border-amber-200/80 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-amber-700" />
                  Emergency Password Reset Dispatch
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Need to initiate an out-of-band password reset? Supabase Auth will generate and dispatch a secure recovery token to <strong className="text-slate-900">{user?.email}</strong>.
                </p>
              </div>
            </div>

            {resetEmailSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {resetEmailSuccess}
              </div>
            )}

            {resetEmailError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {resetEmailError}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-amber-200/60">
              <span className="text-[11px] text-slate-500">Helpline: 9366389429</span>
              <button
                id="btn-dispatch-reset-email"
                type="button"
                onClick={handleDispatchResetEmail}
                disabled={isSendingResetEmail}
                className="btn-tactile px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSendingResetEmail ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-amber-700" />
                )}
                <span>Send Reset Email</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
