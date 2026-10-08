import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

export interface InstituteSignUpDetails {
  name: string;
  department?: string;
  accreditation?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  role: UserRole | null;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    instituteDetails?: InstituteSignUpDetails
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; role?: UserRole }>;
  signOut: () => Promise<void>;
  switchMockRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** localStorage key holding the demo-mode identity so a refresh keeps the same user. */
const DEMO_PROFILE_KEY = 'jansetu.demo.profile.v1';

const readDemoProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DEMO_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch (err) {
    console.warn('Could not read stored demo profile:', err);
    return null;
  }
};

const writeDemoProfile = (profile: UserProfile | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (profile) {
      window.localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile));
    } else {
      window.localStorage.removeItem(DEMO_PROFILE_KEY);
    }
  } catch (err) {
    console.warn('Could not persist demo profile:', err);
  }
};

/** Builds a readable display name out of an email local-part ("asha.rao" -> "Asha Rao"). */
const nameFromEmail = (email: string): string => {
  const local = (email || '').split('@')[0] || '';
  const built = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  return built || 'JanSetu User';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const normalizeRole = (r?: string | null): UserRole => {
    if (!r) return 'CITIZEN';
    const upper = r.toUpperCase();
    if (upper === 'ADMIN') return 'ADMIN';
    if (upper === 'INSTITUTE') return 'INSTITUTE';
    return 'CITIZEN';
  };

  /** Applies a demo-mode identity to state + localStorage in one place. */
  const applyDemoProfile = (next: UserProfile) => {
    setProfile(next);
    setUser({ id: next.id, email: next.email } as User);
    writeDemoProfile(next);
  };

  const fetchProfile = async (userId: string, userEmail: string, userMetadata?: any) => {
    if (!isSupabaseConfigured()) {
      applyDemoProfile({
        id: userId,
        full_name: userMetadata?.full_name || nameFromEmail(userEmail),
        email: userEmail,
        role: normalizeRole(userMetadata?.role)
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.warn('Profile fetch error or missing profile, falling back to auth metadata:', error);
        setProfile({
          id: userId,
          full_name: userMetadata?.full_name || nameFromEmail(userEmail),
          email: userEmail,
          role: normalizeRole(userMetadata?.role)
        });
      } else {
        setProfile({
          ...data,
          // The profiles row may not carry an email column - keep the auth email as fallback.
          email: data.email || userEmail,
          full_name: data.full_name || userMetadata?.full_name || nameFromEmail(userEmail),
          role: normalizeRole(data.role)
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile({
        id: userId,
        full_name: userMetadata?.full_name || nameFromEmail(userEmail),
        email: userEmail,
        role: normalizeRole(userMetadata?.role)
      });
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Demo mode: restore the previously used identity instead of resetting it on every render.
      const stored = readDemoProfile();
      if (stored) {
        setProfile(stored);
        setUser({ id: stored.id, email: stored.email } as User);
      } else {
        applyDemoProfile({
          id: 'demo-user-1',
          full_name: 'Guest User',
          email: 'guest@jansetu.org',
          role: 'CITIZEN'
        });
      }
      setLoading(false);
      return;
    }

    // Live Supabase Auth Session listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '', session.user.user_metadata);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        fetchProfile(nextSession.user.id, nextSession.user.email || '', nextSession.user.user_metadata);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
    // Intentionally runs once. Re-running this on every mock-role change used to wipe the
    // signed-up user's real name and replace it with a generic placeholder profile.
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    instituteDetails?: InstituteSignUpDetails
  ): Promise<{ error: any }> => {
    const normRole = normalizeRole(role);
    if (!isSupabaseConfigured()) {
      applyDemoProfile({
        id: 'demo-' + Date.now(),
        full_name: fullName || nameFromEmail(email),
        email,
        role: normRole
      });
      return { error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: normRole
        }
      }
    });

    if (error) {
      return { error };
    }

    if (data.user) {
      if (normRole === 'INSTITUTE' && instituteDetails?.name) {
        const { error: instErr } = await supabase
          .from('institutes')
          .insert({
            profile_id: data.user.id,
            name: instituteDetails.name,
            department: instituteDetails.department || null,
            accreditation: instituteDetails.accreditation || null
          });

        if (instErr) {
          console.error('Error creating institute record during signup:', instErr);
          console.error('Supabase error details:', JSON.stringify(instErr, null, 2));
          return { error: instErr };
        }
      }

      await fetchProfile(data.user.id, email, { full_name: fullName, role: normRole });
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string): Promise<{ error: any; role?: UserRole }> => {
    if (!isSupabaseConfigured()) {
      const stored = readDemoProfile();
      // Same email as the stored demo identity -> keep the name/role it was signed up with.
      if (stored && stored.email.toLowerCase() === email.toLowerCase()) {
        applyDemoProfile(stored);
        return { error: null, role: normalizeRole(stored.role) };
      }

      applyDemoProfile({
        id: 'demo-' + Date.now(),
        full_name: nameFromEmail(email),
        email,
        role: 'CITIZEN'
      });
      return { error: null, role: 'CITIZEN' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      return { error };
    }

    await fetchProfile(data.user.id, data.user.email || email, data.user.user_metadata);

    // Returned so the caller can redirect immediately, without waiting for the
    // context state update to propagate (which made the old redirect use a stale role).
    let resolvedRole = normalizeRole(data.user.user_metadata?.role);
    try {
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
      if (prof?.role) resolvedRole = normalizeRole(prof.role);
    } catch (err) {
      console.warn('Could not resolve role for redirect, using auth metadata:', err);
    }

    return { error: null, role: resolvedRole };
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    } else {
      writeDemoProfile(null);
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const switchMockRole = (newRole: UserRole) => {
    const norm = normalizeRole(newRole);
    if (!profile) return;
    const next: UserProfile = { ...profile, role: norm };
    setProfile(next);
    if (!isSupabaseConfigured()) {
      writeDemoProfile(next);
    }
  };

  const activeRole = profile?.role ? normalizeRole(profile.role) : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        role: activeRole,
        signUp,
        signIn,
        signOut,
        switchMockRole
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
