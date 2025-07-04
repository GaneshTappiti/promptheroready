import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, Provider } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  signInWithProvider: (provider: Provider) => Promise<{ error: Error | null }>;
  resendVerificationEmail: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          toast({
            title: "Error",
            description: "Failed to get session. Please try again.",
            variant: "destructive"
          });
        }
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast({
          title: "Error",
          description: "Failed to initialize authentication. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Only show success toasts for manual sign in/out actions
      // AuthCallback will handle redirects and onboarding checks
      if (event === 'SIGNED_OUT') {
        toast({
          title: "Success",
          description: "Signed out successfully!"
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: (error as Error).message || "Invalid credentials",
          variant: "destructive"
        });
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign in",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData?: Record<string, unknown>) => {
    try {
      console.log('🔄 Attempting signup for email:', email);

      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : '/auth/callback';

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData,
        },
      });

      if (error) {
        console.error('❌ Signup error:', error);
        toast({
          title: "Sign Up Failed",
          description: (error as Error).message || "Failed to create account",
          variant: "destructive"
        });
        return { error };
      } else {
        console.log('✅ Signup successful:', data);

        // If user was created, try to create their profile manually
        if (data.user) {
          // Wait a moment for the database trigger to potentially create the profile
          setTimeout(async () => {
            try {
              console.log('🔄 Checking/creating user profile for:', data.user.email);

              // First check if profile already exists (from trigger)
              const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('id', data.user.id)
                .single();

              if (existingProfile) {
                console.log('✅ User profile already exists (created by trigger)');
                return;
              }

              // If no profile exists, create one manually
              console.log('🔄 Creating user profile manually...');
              const userRole = data.user.email === 'ganeshtappiti1605@gmail.com' ? 'super_admin' : 'user';

              const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                  id: data.user.id,
                  role: userRole,
                  avatar_url: data.user.user_metadata?.avatar_url
                })
                .select();

              if (profileError) {
                console.error('❌ Failed to create user profile:', profileError);
                // Try with minimal data if full insert fails
                const { error: minimalError } = await supabase
                  .from('user_profiles')
                  .insert({
                    id: data.user.id,
                    role: userRole
                  });

                if (minimalError) {
                  console.error('❌ Failed to create minimal user profile:', minimalError);
                } else {
                  console.log('✅ Minimal user profile created successfully');
                }
              } else {
                console.log('✅ User profile created successfully:', profileData);
              }
            } catch (profileErr) {
              console.error('❌ Error in profile creation process:', profileErr);
            }
          }, 1000); // Wait 1 second for trigger to potentially run
        }

        toast({
          title: "Account Created",
          description: "Please check your email to verify your account",
        });
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected signup error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign up",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/reset-password`
        : '/auth/reset-password';

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      return { error };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (error) {
      console.error('Error updating password:', error);
      return { error };
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : '/auth/callback';

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });
      return { error };
    } catch (error) {
      console.error('Error signing in with provider:', error);
      return { error };
    }
  };

  const resendVerificationEmail = async () => {
    if (!user) return { error: new Error('No user found') };

    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : '/auth/callback';

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      return { error };
    } catch (error) {
      console.error('Error resending verification email:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithProvider,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 