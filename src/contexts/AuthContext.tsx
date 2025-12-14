import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  nik: string;
  address: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar_url?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  nik: string;
  address: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        throw error;
      }

      console.log('✅ Profile fetched:', data);
      console.log('👤 User role:', data?.role);

      setProfile(data as UserProfile);
    } catch (error) {
      console.error('❌ Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Manually fetch profile after login
      if (data.user) {
        await fetchProfile(data.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      // Step 1: Sign up with Supabase Auth
      const { error: signUpError, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Step 2: Insert into users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.full_name,
          nik: data.nik,
          address: data.address,
          phone: data.phone || '',
          role: 'user', // Default role
        });

      if (insertError) {
        console.error('Error inserting user profile:', insertError);
        throw insertError;
      }

      // Step 3: Fetch the profile
      await fetchProfile(authData.user.id);

      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const isAdmin = profile?.role === 'admin';

  console.log('🔐 Auth State:', {
    hasUser: !!user,
    hasProfile: !!profile,
    role: profile?.role,
    isAdmin,
    loading
  });

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signOut, isAdmin, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
