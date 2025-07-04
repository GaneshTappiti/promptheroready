/**
 * Quick API Key Test Script
 * Can be run from browser console or as a standalone test
 */

import { quickAPIKeyTest } from '@/utils/apiKeyValidationTest';
import { supabase } from '@/lib/supabase';

/**
 * Test the current user's API key configuration
 * Usage: testCurrentUserAPIKey()
 */
export async function testCurrentUserAPIKey(): Promise<void> {
  try {
    // Get current user
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Authentication error:', error.message);
      return;
    }
    
    if (!user) {
      console.error('❌ No user logged in. Please log in first.');
      return;
    }
    
    console.log(`🔍 Testing API key for user: ${user.email}`);
    await quickAPIKeyTest(user.id);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test a specific API key without saving it
 * Usage: testSpecificAPIKey('openai', 'sk-...')
 */
export async function testSpecificAPIKey(provider: string, apiKey: string): Promise<void> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('❌ Please log in first');
      return;
    }
    
    console.log(`🔍 Testing ${provider} API key...`);
    
    // Import the tester dynamically to avoid circular dependencies
    const { APIKeyValidationTester } = await import('@/utils/apiKeyValidationTest');
    const tester = new APIKeyValidationTester(user.id);
    
    const result = await tester.testAPIKey(provider as any, apiKey);
    
    if (result.success) {
      console.log(`✅ ${provider} API key is working!`);
      console.log(`Response time: ${result.responseTime}ms`);
    } else {
      console.error(`❌ ${provider} API key test failed:`, result.message);
      if (result.error) {
        console.error('Error details:', result.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Quick health check for the entire application
 */
export async function healthCheck(): Promise<void> {
  console.log('🏥 Running application health check...');
  
  try {
    // Check Supabase connection
    console.log('🔗 Testing Supabase connection...');
    const { data, error } = await supabase.from('user_ai_preferences').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connection working');
    }
    
    // Check user authentication
    console.log('🔐 Checking user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('❌ Authentication check failed:', authError.message);
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
      
      // Test API key if user is logged in
      await testCurrentUserAPIKey();
    } else {
      console.log('ℹ️ No user logged in');
    }
    
    console.log('🏥 Health check complete');
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }
}

// Make functions available globally for console usage
if (typeof window !== 'undefined') {
  (window as any).testAPIKey = testCurrentUserAPIKey;
  (window as any).testSpecificAPIKey = testSpecificAPIKey;
  (window as any).healthCheck = healthCheck;
  
  console.log(`
🧪 API Key Testing Functions Available:
- testAPIKey() - Test current user's configured API key
- testSpecificAPIKey(provider, key) - Test a specific API key
- healthCheck() - Run full application health check

Example usage:
testAPIKey()
testSpecificAPIKey('openai', 'sk-...')
healthCheck()
  `);
}

export default {
  testCurrentUserAPIKey,
  testSpecificAPIKey,
  healthCheck
};
