/**
 * Supabase Connection Test Utility
 * Tests the connection to Supabase and verifies API key functionality
 */

import { supabase } from '@/lib/supabase';
import { aiProviderService } from '@/services/aiProviderService';

export interface SupabaseTestResult {
  success: boolean;
  message: string;
  details?: {
    connection: boolean;
    authentication: boolean;
    database: boolean;
    apiKeyTable: boolean;
    permissions: boolean;
  };
  error?: string;
}

export class SupabaseConnectionTester {
  
  /**
   * Run comprehensive Supabase connection tests
   */
  async runFullTest(): Promise<SupabaseTestResult> {
    const result: SupabaseTestResult = {
      success: false,
      message: '',
      details: {
        connection: false,
        authentication: false,
        database: false,
        apiKeyTable: false,
        permissions: false
      }
    };

    try {
      console.log('🔍 Testing Supabase connection...');

      // Test 1: Basic connection
      console.log('1️⃣ Testing basic connection...');
      const { data: healthData, error: healthError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (healthError) {
        result.error = `Connection failed: ${healthError.message}`;
        return result;
      }
      result.details!.connection = true;
      console.log('✅ Basic connection working');

      // Test 2: Authentication
      console.log('2️⃣ Testing authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.log('ℹ️ No user authenticated (this is normal if not logged in)');
      } else if (user) {
        result.details!.authentication = true;
        console.log('✅ User authenticated:', user.email);
      } else {
        console.log('ℹ️ No user logged in');
      }

      // Test 3: Database access
      console.log('3️⃣ Testing database access...');
      const { data: dbData, error: dbError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);

      if (dbError) {
        result.error = `Database access failed: ${dbError.message}`;
        return result;
      }
      result.details!.database = true;
      console.log('✅ Database access working');

      // Test 4: API key table
      console.log('4️⃣ Testing user_ai_preferences table...');
      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from('user_ai_preferences')
        .select('id')
        .limit(1);

      if (apiKeyError) {
        if (apiKeyError.message.includes('does not exist')) {
          result.error = 'user_ai_preferences table does not exist. Please run the migration.';
          return result;
        } else if (apiKeyError.message.includes('permission denied')) {
          result.error = 'Permission denied accessing user_ai_preferences table. Check RLS policies.';
          return result;
        } else {
          result.error = `API key table error: ${apiKeyError.message}`;
          return result;
        }
      }
      result.details!.apiKeyTable = true;
      console.log('✅ user_ai_preferences table accessible');

      // Test 5: Permissions (if user is logged in)
      if (user) {
        console.log('5️⃣ Testing user permissions...');
        try {
          const testPreferences = await aiProviderService.getUserPreferences(user.id);
          result.details!.permissions = true;
          console.log('✅ User permissions working');
          
          if (testPreferences) {
            console.log('📋 Found existing AI preferences:', testPreferences.provider);
          } else {
            console.log('ℹ️ No AI preferences configured yet');
          }
        } catch (permError) {
          console.warn('⚠️ Permission test failed:', permError);
        }
      }

      // All tests passed
      result.success = true;
      result.message = 'All Supabase tests passed successfully!';
      console.log('🎉 All Supabase tests completed successfully');

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.message = `Supabase test failed: ${result.error}`;
      console.error('❌ Supabase test failed:', error);
    }

    return result;
  }

  /**
   * Test API key storage and retrieval
   */
  async testAPIKeyStorage(userId: string): Promise<boolean> {
    try {
      console.log('🔐 Testing API key storage...');

      // Test saving a dummy API key
      const testConfig = {
        provider: 'openai' as const,
        apiKey: 'sk-test-key-for-storage-test',
        modelName: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000
      };

      const saveSuccess = await aiProviderService.saveUserPreferences(userId, testConfig);
      if (!saveSuccess) {
        console.error('❌ Failed to save test API key');
        return false;
      }

      // Test retrieving the API key
      const preferences = await aiProviderService.getUserPreferences(userId);
      if (!preferences || preferences.provider !== 'openai') {
        console.error('❌ Failed to retrieve test API key');
        return false;
      }

      console.log('✅ API key storage and retrieval working');
      return true;

    } catch (error) {
      console.error('❌ API key storage test failed:', error);
      return false;
    }
  }

  /**
   * Quick health check
   */
  async quickHealthCheck(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Generate a detailed report
   */
  generateReport(result: SupabaseTestResult): string {
    let report = '\n🔍 Supabase Connection Test Report\n';
    report += '=====================================\n\n';

    if (result.success) {
      report += '✅ Overall Status: PASSED\n';
    } else {
      report += '❌ Overall Status: FAILED\n';
    }

    report += `📝 Message: ${result.message}\n\n`;

    if (result.details) {
      report += 'Test Details:\n';
      report += `  - Connection: ${result.details.connection ? '✅' : '❌'}\n`;
      report += `  - Authentication: ${result.details.authentication ? '✅' : '❌'}\n`;
      report += `  - Database Access: ${result.details.database ? '✅' : '❌'}\n`;
      report += `  - API Key Table: ${result.details.apiKeyTable ? '✅' : '❌'}\n`;
      report += `  - Permissions: ${result.details.permissions ? '✅' : '❌'}\n`;
    }

    if (result.error) {
      report += `\n❌ Error: ${result.error}\n`;
    }

    report += '\n';
    return report;
  }
}

/**
 * Quick test function for console use
 */
export async function testSupabaseConnection(): Promise<void> {
  const tester = new SupabaseConnectionTester();
  const result = await tester.runFullTest();
  const report = tester.generateReport(result);
  
  console.log(report);
  
  if (!result.success) {
    console.error('❌ Supabase connection test failed. Please check your configuration.');
  } else {
    console.log('✅ Supabase connection is working properly!');
  }
}

// Make function available globally for console usage
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
  
  console.log(`
🔍 Supabase Testing Function Available:
- testSupabaseConnection() - Test Supabase connection and setup

Example usage:
testSupabaseConnection()
  `);
}

export default SupabaseConnectionTester;
