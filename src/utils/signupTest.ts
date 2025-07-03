import { supabase } from '@/lib/supabase';
import { isValidEmail } from '@/shared/utils/validation';

export interface SignupTestResult {
  success: boolean;
  message: string;
  error?: any;
  data?: any;
}

/**
 * Test signup functionality with detailed logging
 */
export const testSignupFlow = async (email: string, password: string): Promise<SignupTestResult> => {
  try {
    console.log('🔄 Starting signup test...');
    console.log('📧 Email:', email);
    console.log('🔒 Password length:', password.length);

    // Step 1: Validate email format
    if (!isValidEmail(email)) {
      return {
        success: false,
        message: 'Email validation failed - invalid format',
        error: new Error('Invalid email format')
      };
    }
    console.log('✅ Email format validation passed');

    // Step 2: Check password length
    if (password.length < 6) {
      return {
        success: false,
        message: 'Password validation failed - too short',
        error: new Error('Password too short')
      };
    }
    console.log('✅ Password validation passed');

    // Step 3: Attempt Supabase signup
    console.log('🔄 Attempting Supabase signup...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('❌ Supabase signup error:', error);
      return {
        success: false,
        message: `Supabase signup failed: ${error.message}`,
        error
      };
    }

    console.log('✅ Supabase signup successful');
    console.log('📊 Signup data:', data);

    return {
      success: true,
      message: 'Signup completed successfully',
      data
    };

  } catch (error) {
    console.error('❌ Unexpected error during signup test:', error);
    return {
      success: false,
      message: 'Unexpected error during signup',
      error
    };
  }
};

/**
 * Test signup with a random email
 */
export const testRandomSignup = async (): Promise<SignupTestResult> => {
  const timestamp = Date.now();
  const randomEmail = `test.user.${timestamp}@example.com`;
  const password = 'TestPassword123!';
  
  console.log('🎲 Testing with random email:', randomEmail);
  return testSignupFlow(randomEmail, password);
};

/**
 * Cleanup test user (for development only)
 */
export const cleanupTestUser = async (email: string): Promise<void> => {
  try {
    console.log('🧹 Attempting to cleanup test user:', email);
    // Note: This would require admin privileges to delete users
    // For now, just log the attempt
    console.log('⚠️ User cleanup requires admin privileges');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
};
