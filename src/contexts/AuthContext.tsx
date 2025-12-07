import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: AppRole | null;
  rt?: string;
  rw?: string;
}

interface AuthContextType {
  user: UserWithRole | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  hasPermission: (allowedRoles: AppRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUserRole = async (userId: string, userEmail: string, fullName?: string) => {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role, rt, rw')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle();

    return {
      id: userId,
      email: userEmail,
      name: profileData?.full_name || fullName || userEmail.split('@')[0],
      role: roleData?.role || null,
      rt: roleData?.rt || undefined,
      rw: roleData?.rw || undefined,
    };
  };

  useEffect(() => {
    let isMounted = true;
    let initialized = false;

    // Check for existing session FIRST
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (!isMounted) return;
        
        setSession(existingSession);
        
        if (existingSession?.user) {
          const userData = await fetchUserRole(
            existingSession.user.id,
            existingSession.user.email || '',
            existingSession.user.user_metadata?.full_name
          );
          if (isMounted) {
            setUser(userData);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
          initialized = true;
        }
      }
    };

    initializeAuth();

    // Set up auth state listener AFTER initial check
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;
        
        // Only process after initialization to prevent race conditions
        if (!initialized && event !== 'SIGNED_IN' && event !== 'TOKEN_REFRESHED') {
          return;
        }
        
        setSession(newSession);
        
        if (newSession?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlocks
          setTimeout(async () => {
            if (!isMounted) return;
            const userData = await fetchUserRole(
              newSession.user.id,
              newSession.user.email || '',
              newSession.user.user_metadata?.full_name
            );
            if (isMounted) {
              setUser(userData);
              setIsLoading(false);
            }
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Email atau password salah' };
      }
      return { error: error.message };
    }

    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const hasPermission = (allowedRoles: AppRole[]): boolean => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session && !!user,
        isLoading,
        isInitialized,
        login,
        logout,
        hasPermission,
      }}
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
