import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowRight,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ChemPointLogo } from '../common/ChemPointLogo';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'student-login' | 'student-register' | 'admin-login';
  onClose: () => void;
  onSuccessNavigate?: (role: 'student' | 'admin') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'student-login',
  onClose,
  onSuccessNavigate,
}) => {
  const {
    login,
    register,
    resetPassword,
    resendConfirmationEmail,
    isLoading,
    error,
    clearError,
    user,
  } = useAuth();

  const [mode, setMode] = useState<'student-login' | 'student-register' | 'admin-login' | 'forgot-password'>(
    initialMode
  );

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [medium, setMedium] = useState<'English' | 'Bengali'>('English');
  const [batchName, setBatchName] = useState('Class 11 Chemistry (Ker Chowmuhani)');
  const [targetExam, setTargetExam] = useState('Class 11 Chemistry');
  const [showPassword, setShowPassword] = useState(false);
  // Status & Feedback States
  const [localError, setLocalError] = useState<string | null>(null);
  const [isUnconfirmedError, setIsUnconfirmedError] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  // Synchronize initial mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setLocalError(null);
      setIsUnconfirmedError(false);
      setResetSuccessMessage(null);
      setRegistrationSuccess(false);
      setResendStatus(null);
      clearError();
    }
  }, [initialMode, isOpen, clearError]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // View shown if already authenticated
    // Handle Resending Confirmation Email
  const handleResendConfirmation = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLocalError('Please enter a valid email address to resend verification.');
      return;
    }
    setIsResending(true);
    setResendStatus(null);
    try {
      const res = await resendConfirmationEmail(cleanEmail);
      setResendStatus(res.message || 'Verification link sent! Please check your inbox.');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to dispatch confirmation email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsUnconfirmedError(false);
    setResetSuccessMessage(null);
    setRegistrationSuccess(false);
    setResendStatus(null);
    clearError();

    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot-password') {
      try {
        const res = await resetPassword(cleanEmail);
        setResetSuccessMessage(
          res?.message ||
            'Password reset instructions have been dispatched to your email address.'
        );
      } catch (err: any) {
        setLocalError(err.message || 'Failed to request password reset. Please try again.');
      }
      return;
    }

    if (!password || password.length < 6) {
      setLocalError('Password must be at least 6 characters in length.');
      return;
    }

    try {
      if (mode === 'student-login' || mode === 'admin-login') {
        const portal = mode === 'admin-login' ? 'admin' : undefined;
        const authenticatedProfile = await login(cleanEmail, password, portal);
        onClose();
        if (onSuccessNavigate) {
          onSuccessNavigate(authenticatedProfile.role);
        }
      } else if (mode === 'student-register') {
        if (!fullName.trim()) {
          setLocalError('Please enter your full name.');
          return;
        }

        const regRes = await register({
          email: cleanEmail,
          password,
          full_name: fullName.trim(),
          phone: phone.trim(),
          batch_name: `${batchName.trim()} [${medium} Medium]`,
          target_exam: targetExam,
        });

        if (regRes && regRes.hasSession) {
          onClose();
          if (onSuccessNavigate) onSuccessNavigate('student');
        } else {
          setRegistrationSuccess(true);
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('not been confirmed')) {
        setIsUnconfirmedError(true);
      }
      setLocalError(msg);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="auth-modal-container"
        className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-purple-950/20 border border-purple-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-300 ease-out my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
          <button
            id="btn-close-auth-modal"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer btn-tactile"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ChemPoint Logo Badge */}
          <div className="flex items-center gap-3 mb-2.5 relative z-10">
            <ChemPointLogo className="w-10 h-10 ring-2 ring-white/20 rounded-full shadow-md" />
            <div>
              <span className="text-base font-black tracking-tight text-white flex items-center gap-1">
                CHEM<span className="text-purple-400">POINT</span>
              </span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-purple-200 border border-white/15 backdrop-blur-xs">
                A Chemistry Institution • Agartala
              </span>
            </div>
          </div>

          <h2 id="auth-modal-heading" className="text-lg font-black text-white relative z-10">
            {mode === 'student-login' && 'Sign In'}
            {mode === 'student-register' && 'Create Student Account'}
            {mode === 'admin-login' && 'Faculty & Administration Sign In'}
            {mode === 'forgot-password' && 'Reset Account Password'}
          </h2>
          <p className="text-xs text-purple-200/80 mt-0.5 relative z-10">
            {mode === 'student-login' && 'Sign in to access your enrolled courses, lectures & notes'}
            {mode === 'student-register' && 'Register your student profile for ChemPoint academic batches'}
            {mode === 'admin-login' && 'Authorized sign-in for faculty & course coordinators'}
            {mode === 'forgot-password' && 'Enter your registered email address to receive reset instructions'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'forgot-password' ? (
          <div className="flex border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600 p-1.5 gap-1.5">
            <button
              id="tab-student-login"
              type="button"
              onClick={() => {
                setMode('student-login');
                clearError();
                setLocalError(null);
                setIsUnconfirmedError(false);
                setResetSuccessMessage(null);
                setRegistrationSuccess(false);
                setResendStatus(null);
              }}
              className={`flex-1 py-2 px-2.5 text-center rounded-xl transition-all cursor-pointer btn-tactile ${
                mode === 'student-login' || mode === 'admin-login'
                  ? 'bg-white text-purple-950 shadow-2xs font-bold border border-slate-200/80'
                  : 'hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-student-register"
              type="button"
              onClick={() => {
                setMode('student-register');
                clearError();
                setLocalError(null);
                setIsUnconfirmedError(false);
                setResetSuccessMessage(null);
                setRegistrationSuccess(false);
                setResendStatus(null);
              }}
              className={`flex-1 py-2 px-2.5 text-center rounded-xl transition-all cursor-pointer btn-tactile ${
                mode === 'student-register'
                  ? 'bg-white text-purple-950 shadow-2xs font-bold border border-slate-200/80'
                  : 'hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Create Student Account
            </button>
          </div>
        ) : (
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <button
              id="btn-back-to-login"
              type="button"
              onClick={() => {
                setMode('student-login');
                clearError();
                setLocalError(null);
                setIsUnconfirmedError(false);
                setResetSuccessMessage(null);
                setRegistrationSuccess(false);
                setResendStatus(null);
              }}
              className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer btn-tactile"
            >
              ← Back to Sign In
            </button>
            <span className="text-slate-400 text-[11px]">Admission & Academic Support</span>
          </div>
        )}

        {/* Registration Success View: Verification Email Dispatched */}
        {registrationSuccess ? (
          <div className="p-6 text-center space-y-4 overflow-y-auto flex-1 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto border border-purple-200 shadow-sm">
              <Mail className="w-7 h-7 text-purple-700" />
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200 mb-2">
                Verification Email Sent
              </span>
              <h3 className="text-base font-bold text-slate-900">Confirm Your Email Address</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Welcome to ChemPoint, <strong className="text-slate-900">{fullName.trim()}</strong>! We have dispatched a confirmation link to <strong className="text-purple-950">{email}</strong>.
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Please check your inbox (and spam folder) and click the link to verify your account, then sign in below.
              </p>
            </div>

            {resendStatus && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {resendStatus}
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setRegistrationSuccess(false);
                  setMode('student-login');
                }}
                className="w-full py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer btn-tactile"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={isResending}
                onClick={handleResendConfirmation}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 border border-purple-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isResending ? 'Sending...' : 'Resend Verification Email'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Unconfirmed Email Notice & Resend Option */}
            {isUnconfirmedError && (
              <div
                id="auth-unconfirmed-alert"
                className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 animate-in fade-in duration-150"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Email Verification Required</p>
                    <p className="text-[11px] leading-relaxed text-amber-800">
                      Your email address has not been confirmed yet. Please verify your email via the confirmation link sent to your inbox before signing in.
                    </p>
                  </div>
                </div>
                {resendStatus ? (
                  <p className="text-[11px] font-bold text-emerald-700 pt-1 border-t border-amber-200">
                    {resendStatus}
                  </p>
                ) : (
                  <div className="pt-1 border-t border-amber-200 flex justify-end">
                    <button
                      type="button"
                      disabled={isResending}
                      onClick={handleResendConfirmation}
                      className="text-[11px] font-bold text-purple-800 hover:text-purple-950 underline flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isResending ? 'Sending...' : 'Resend Verification Link'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Standard Error Message */}
            {!isUnconfirmedError && (error || localError) && (
              <div
                id="auth-error-alert"
                className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-2 animate-in fade-in duration-150"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-red-900">
                      {(localError || error)?.includes('already exists')
                        ? 'Account Already Registered'
                        : 'Authentication Notice'}
                    </p>
                    <p className="text-[11px] leading-relaxed text-red-700 mt-0.5">
                      {localError || error}
                    </p>
                  </div>
                </div>

                {/* Helpful contextual recovery buttons */}
                {(localError || error)?.includes('already exists') && mode === 'student-register' && (
                  <div className="pt-2 border-t border-red-200 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-red-600">Already have your login?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('student-login');
                        clearError();
                        setLocalError(null);
                      }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer btn-tactile flex items-center gap-1"
                    >
                      <span>Sign In with this email</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {(localError || error)?.includes('Invalid email address or password') && (
                  <div className="pt-2 border-t border-red-200 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        clearError();
                        setLocalError(null);
                      }}
                      className="text-[11px] text-red-800 font-bold hover:underline cursor-pointer"
                    >
                      Reset forgotten password?
                    </button>
                    
                  </div>
                )}
              </div>
            )}

            {/* Password Reset Message */}
            {resetSuccessMessage && (
              <div
                id="auth-reset-success"
                className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in duration-150"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div className="space-y-1">
                  <p className="font-bold">Reset Instructions Sent</p>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">{resetSuccessMessage}</p>
                </div>
              </div>
            )}

            {/* Registration specific fields */}
            {mode === 'student-register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="input-register-fullname"
                      type="text"
                      required
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter student full name"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="input-register-phone"
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Instruction Medium
                    </label>
                    <select
                      id="select-register-medium"
                      value={medium}
                      onChange={(e) => setMedium(e.target.value as 'English' | 'Bengali')}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all bg-white"
                    >
                      <option value="English">English Medium</option>
                      <option value="Bengali">Bengali Medium</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Academic Program *
                  </label>
                  <select
                    id="select-register-program"
                    value={targetExam}
                    onChange={(e) => {
                      setTargetExam(e.target.value);
                      if (e.target.value.includes('11')) setBatchName('Class 11 Chemistry (Ker Chowmuhani)');
                      else if (e.target.value.includes('12')) setBatchName('Class 12 Chemistry (Badharghat)');
                      else if (e.target.value.includes('10')) setBatchName('Class 10 Board Excellence (Bordowali)');
                      else if (e.target.value.includes('9')) setBatchName('Class 9 Foundation (Ker Chowmuhani)');
                      else if (e.target.value.includes('B.Sc')) setBatchName('B.Sc Chemistry Degree Batch (MBB/TU)');
                    }}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all bg-white"
                  >
                    <option value="Class 11 Chemistry">Class 11 Chemistry (Physical, Organic, Inorganic)</option>
                    <option value="Class 12 Chemistry">Class 12 Chemistry (Board + NEET / JEE / TBJEE)</option>
                    <option value="Class 10 Foundation">Class 10 (Complete Science & Mathematics)</option>
                    <option value="Class 9 Foundation">Class 9 (Complete Science & Mathematics)</option>
                    <option value="B.Sc Chemistry Major/Minor">B.Sc Chemistry (Major & Minor - MBB & TU)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Classroom Center / Batch
                  </label>
                  <input
                    id="input-register-batch"
                    type="text"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="e.g. Ker Chowmuhani Center - Morning Batch"
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all bg-white"
                  />
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="input-auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all bg-white"
                />
              </div>
            </div>

            {/* Password */}
            {mode !== 'forgot-password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password *</label>
                  {(mode === 'student-login' || mode === 'admin-login') && (
                    <button
                      id="btn-forgot-password-link"
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setLocalError(null);
                        setIsUnconfirmedError(false);
                        setResetSuccessMessage(null);
                        setRegistrationSuccess(false);
                        setResendStatus(null);
                      }}
                      className="text-[11px] text-purple-700 font-semibold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={mode === 'student-register' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all bg-white"
                  />
                  <button
                    id="btn-toggle-password"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Minimum 6 characters required</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="btn-submit-auth"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 btn-tactile"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {(mode === 'student-login' || mode === 'admin-login') && 'Sign In'}
                    {mode === 'student-register' && 'Create Student Account'}
                    {mode === 'forgot-password' && 'Send Password Reset Email'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Modal Footer Note & Contact Support */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-200 text-center text-[11px] text-slate-500 space-y-1">
          <div>
            Academic Helpline:{' '}
            <a href="tel:9366389429" aria-label="Call Tapas Majumder: 9366389429" className="font-bold text-purple-700 hover:underline">
              9366389429
            </a>
            {' '}•{' '}
            <a href="mailto:tapash489@gmail.com" aria-label="Email Tapas Majumder: tapash489@gmail.com" className="font-semibold text-purple-700 hover:underline">
              tapash489@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
