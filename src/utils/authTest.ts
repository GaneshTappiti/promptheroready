/**
 * Authentication Test Utilities
 * Simple functions to test authentication functionality
 */

import { supabase } from '@/lib/supabase';

export interface AuthTestResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: unknown;
}

/**
 * Test Supabase connection
 */
export const testSupabaseConnection = async (): Promise<AuthTestResult> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        success: false,
        message: 'Failed to connect to Supabase',
        error
      };
    }

    return {
      success: true,
      message: 'Supabase connection successful',
      data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Supabase connection failed',
      error
    };
  }
};

/**
 * Test user sign up
 */
export const testSignUp = async (email: string, password: string): Promise<AuthTestResult> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return {
        success: false,
        message: `Sign up failed: ${(error as Error).message}`,
        error
      };
    }

    return {
      success: true,
      message: 'Sign up successful! Check your email for verification.',
      data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Sign up failed with unexpected error',
      error
    };
  }
};

/**
 * Test user sign in
 */
export const testSignIn = async (email: string, password: string): Promise<AuthTestResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        message: `Sign in failed: ${(error as Error).message}`,
        error
      };
    }

    return {
      success: true,
      message: 'Sign in successful!',
      data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Sign in failed with unexpected error',
      error
    };
  }
};

/**
 * Test user sign out
 */
export const testSignOut = async (): Promise<AuthTestResult> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        message: `Sign out failed: ${(error as Error).message}`,
        error
      };
    }

    return {
      success: true,
      message: 'Sign out successful!'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Sign out failed with unexpected error',
      error
    };
  }
};

/**
 * Get current user session
 */
export const getCurrentSession = async (): Promise<AuthTestResult> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return {
        success: false,
        message: `Failed to get session: ${(error as Error).message}`,
        error
      };
    }

    return {
      success: true,
      message: session ? 'User is authenticated' : 'No active session',
      data: session
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to get session with unexpected error',
      error
    };
  }
};

/**
 * Test password reset
 */
export const testPasswordReset = async (email: string): Promise<AuthTestResult> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return {
        success: false,
        message: `Password reset failed: ${(error as Error).message}`,
        error
      };
    }

    return {
      success: true,
      message: 'Password reset email sent successfully!'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Password reset failed with unexpected error',
      error
    };
  }
};

/**
 * Run all authentication tests
 */
export const runAuthTests = async () => {
  console.log('🧪 Running Authentication Tests...\n');

  // Test 1: Supabase Connection
  console.log('1. Testing Supabase Connection...');
  const connectionTest = await testSupabaseConnection();
  console.log(`   ${connectionTest.success ? '✅' : '❌'} ${connectionTest.message}`);
  if (!connectionTest.success) {
    console.error('   Error:', connectionTest.error);
  }

  // Test 2: Current Session
  console.log('\n2. Testing Current Session...');
  const sessionTest = await getCurrentSession();
  console.log(`   ${sessionTest.success ? '✅' : '❌'} ${sessionTest.message}`);
  if (sessionTest.data) {
    console.log('   User:', sessionTest.data.user?.email);
  }

  console.log('\n🧪 Authentication Tests Complete!');
  
  return {
    connection: connectionTest,
    session: sessionTest
  };
};
