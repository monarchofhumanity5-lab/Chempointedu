import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { supabase, fetchProfileById, buildProfileFromAuthUser } from '../lib/supabaseClient';
import { getStoredUser, setStoredSession } from '../services/api';

export interface RegisterResult {
  success: boolean;
  hasSession: boolean;
  message?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  currentRole: 'student' | 'admin' | null;
  isLoading: boolean;
  isInitialLoading: boolean;
  error: string | null;
  login: (email: string, password: string, portal?: 'student' | 'admin') => Promise<UserProfile>;
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    batch_name?: string;
    target_exam?: string;
  }) => Promise<RegisterResult>;
  resetPassword: (email: string) => Promise<{ message: string }>;
  resendConfirmationEmail: (email: string) => Promise<{ message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<{ message: string }>;
  changeEmail: (data: { newEmail: string; currentPassword: string }) => Promise<{ message: string }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Session Initialization & Recovery via getSession() and onAuthStateChange()
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
        }

        const currentSession = sessionData?.session;

        if (currentSession?.user) {
          const profile = await fetchProfileById(currentSession.user.id, currentSession.user);
          if (profile && isMounted) {
            setUser(profile);
            setToken(currentSession.access_token);
            setStoredSession({ token: currentSession.access_token, user: profile });
            return;
          }
        }

        // If no active Supabase session found, check cached local user fallback
        const cachedUser = getStoredUser();
        if (cachedUser && isMounted) {
          setUser(cachedUser);
        } else if (isMounted) {
          setUser(null);
          setToken(null);
          setStoredSession(null);
        }
      } catch (err: any) {
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    }

    initAuth();

    // 2. Direct Supabase Auth State Change Listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;

        if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED' ||
          event === 'INITIAL_SESSION'
        ) {
          if (currentSession?.user) {
            const profile = await fetchProfileById(currentSession.user.id, currentSession.user);
            if (profile && isMounted) {
              setUser(profile);
              setToken(currentSession.access_token);
              setStoredSession({ token: currentSession.access_token, user: profile });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            setToken(null);
            setStoredSession(null);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 3. Direct Browser-Side Supabase Login
  const login = async (
    email: string,
    password: string,
    portal?: 'student' | 'admin'
  ): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });


      if (authError || !authData?.user || !authData?.session) {
        const rawMsg = authError?.message || '';
        const isUnconfirmed = rawMsg.toLowerCase().includes('email not confirmed');
        const isInvalid = rawMsg === 'Invalid login credentials';

        const safeMessage = isUnconfirmed
          ? 'Your email address has not been confirmed yet. Please verify your email via the confirmation link sent to your inbox before signing in.'
          : isInvalid
          ? 'Invalid email address or password. Please verify your credentials and try again.'
          : rawMsg || 'Authentication failed. Please verify your credentials.';
        throw new Error(safeMessage);
      }


      // Fetch verified user profile directly from public.profiles via RLS
      let profile = await fetchProfileById(authData.user.id, authData.user);
      if (!profile) {
        profile = buildProfileFromAuthUser(authData.user);
      }


      // Strict Role-Based Portal Verification:
      // Only deny if non-admin explicitly attempts admin portal. Admin accessing student portal is welcomed and routed.
      if (portal === 'admin' && profile.role !== 'admin') {
        await supabase.auth.signOut().catch(() => {});
        throw new Error('Access denied. You do not have faculty or administrator permissions.');
      }

      // Establish authenticated session in state and localStorage
      setUser(profile);
      setToken(authData.session.access_token);
      setStoredSession({ token: authData.session.access_token, user: profile });
      return profile;
    } catch (err: any) {
      const displayMsg = err.message || 'Login failed. Please check your credentials.';
      setError(displayMsg);
      throw new Error(displayMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Direct Browser-Side Supabase Student Registration
  const register = async (data: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    batch_name?: string;
    target_exam?: string;
  }): Promise<RegisterResult> => {
    setIsLoading(true);
    setError(null);
    const cleanEmail = data.email.trim().toLowerCase();

    try {
      const res = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name.trim(),
            phone: data.phone?.trim() || '',
            batch_name: data.batch_name?.trim() || 'Class 11 Chemistry Batch',
            target_exam: data.target_exam?.trim() || 'Class 11 Chemistry',
            role: 'student', // Strict enforcement: Always student
          },
        },
      });

      if (res.error) {
        const errMsg = res.error.message || '';
        if (
          errMsg.toLowerCase().includes('already registered') ||
          errMsg.toLowerCase().includes('already exists')
        ) {
          throw new Error('An account with this email address already exists. Please sign in instead.');
        } else if (res.error.status === 429 || errMsg.toLowerCase().includes('rate limit')) {
          throw new Error('Too many sign-up requests. Please wait a few moments before trying again.');
        }
        throw new Error(errMsg);
      }

      if (!res.data?.user) {
        throw new Error('Unable to complete registration. Please try again.');
      }

      // If session was returned immediately (if email confirmation is turned off)
      if (res.data.session) {
        const profile = await fetchProfileById(res.data.user.id, res.data.user);
        if (profile) {
          setUser(profile);
          setToken(res.data.session.access_token);
          setStoredSession({ token: res.data.session.access_token, user: profile });
        }
        return {
          success: true,
          hasSession: true,
          message: 'Account created successfully! Welcome to ChemPoint.',
        };
      }

      // When Supabase email confirmation is enabled:
      // session is null, user is created awaiting email confirmation
      return {
        success: true,
        hasSession: false,
        message: `Account created successfully! A verification email has been sent to ${cleanEmail}. Please check your inbox and verify your email before signing in.`,
      };
    } catch (err: any) {
      const displayMsg = err.message || 'Registration failed.';
      setError(displayMsg);
      throw new Error(displayMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Direct Supabase Password Reset
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (resetErr) {
        throw new Error(resetErr.message);
      }
      return {
        message: 'Password reset instructions have been dispatched to your email address.',
      };
    } catch (err: any) {
      const msg = err.message || 'Password reset request failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Direct Supabase Resend Confirmation Email
  const resendConfirmationEmail = async (email: string) => {
    setIsLoading(true);
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      });
      if (resendErr) {
        throw new Error(resendErr.message);
      }
      return {
        message: 'A fresh verification email has been dispatched to your inbox.',
      };
    } catch (err: any) {
      const msg = err.message || 'Failed to dispatch verification email.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Direct Supabase Sign Out
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut().catch(() => {});
    } catch (e) {
      console.warn('[ChemPoint Auth] Sign out error:', e);
    }
    setUser(null);
    setToken(null);
    setError(null);
    setStoredSession(null);
  }, []);

  // 8. Profile Updates via Direct Supabase Query
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user?.id) throw new Error('Not authenticated');
      const { data: updatedData, error: updateErr } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name?.trim() || user.full_name,
          phone: data.phone?.trim() ?? user.phone,
          avatar_url: data.avatar_url ?? user.avatar_url,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateErr) throw new Error(updateErr.message);
      if (updatedData) {
        setUser(updatedData as UserProfile);
        setStoredSession({ token: token || '', user: updatedData as UserProfile });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  // 9. Password Change via Direct Supabase Call
  const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: updatePwErr } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      if (updatePwErr) throw new Error(updatePwErr.message);
      return { message: 'Password updated successfully.' };
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 10. Email Change via Direct Supabase Call
  const changeEmail = async (data: {
    newEmail: string;
    currentPassword: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: changeErr } = await supabase.auth.updateUser({
        email: data.newEmail.trim().toLowerCase(),
      });
      if (changeErr) throw new Error(changeErr.message);
      return { message: 'Confirmation link dispatched to your new email address.' };
    } catch (err: any) {
      setError(err.message || 'Failed to update email address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const currentRole = user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        currentRole,
        isLoading,
        isInitialLoading,
        error,
        login,
        register,
        resetPassword,
        resendConfirmationEmail,
        logout,
        updateProfile,
        changePassword,
        changeEmail,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
