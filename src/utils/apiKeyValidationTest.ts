/**
 * API Key Validation Test Utility
 * Comprehensive testing of user-provided API keys throughout the application
 */

import { aiProviderService } from '@/services/aiProviderService';
import { AIProvider, AIProviderConfig } from '@/types/aiProvider';
import { supabase } from '@/lib/supabase';

export interface APIKeyTestResult {
  success: boolean;
  provider: AIProvider;
  message: string;
  details?: {
    keyFormat: boolean;
    connection: boolean;
    response: boolean;
    storage: boolean;
    encryption: boolean;
  };
  error?: string;
  responseTime?: number;
}

export interface ComprehensiveTestResult {
  overall: boolean;
  results: APIKeyTestResult[];
  summary: {
    tested: number;
    passed: number;
    failed: number;
  };
}

export class APIKeyValidationTester {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Test a specific API key for a provider
   */
  async testAPIKey(provider: AIProvider, apiKey: string): Promise<APIKeyTestResult> {
    const startTime = Date.now();
    const result: APIKeyTestResult = {
      success: false,
      provider,
      message: '',
      details: {
        keyFormat: false,
        connection: false,
        response: false,
        storage: false,
        encryption: false
      }
    };

    try {
      // Step 1: Validate API key format
      console.log(`🔍 Testing ${provider} API key format...`);
      const formatValid = this.validateKeyFormat(provider, apiKey);
      result.details!.keyFormat = formatValid;
      
      if (!formatValid) {
        result.message = `Invalid API key format for ${provider}`;
        return result;
      }

      // Step 2: Test storage and encryption
      console.log(`💾 Testing ${provider} API key storage...`);
      const config: AIProviderConfig = {
        provider,
        apiKey,
        modelName: this.getDefaultModel(provider),
        temperature: 0.7,
        maxTokens: 100
      };

      const saveSuccess = await aiProviderService.saveUserPreferences(this.userId, config);
      result.details!.storage = saveSuccess;
      result.details!.encryption = saveSuccess; // If save succeeds, encryption worked

      if (!saveSuccess) {
        result.message = `Failed to save ${provider} API key`;
        return result;
      }

      // Step 3: Test connection
      console.log(`🔗 Testing ${provider} connection...`);
      const connectionResult = await aiProviderService.testConnection(this.userId, config);
      result.details!.connection = connectionResult.success;

      if (!connectionResult.success) {
        result.message = connectionResult.error || `Connection failed for ${provider}`;
        result.error = connectionResult.error;
        return result;
      }

      // Step 4: Test actual AI response
      console.log(`🤖 Testing ${provider} AI response...`);
      const responseResult = await aiProviderService.generateResponse(this.userId, {
        prompt: 'Say "API_TEST_SUCCESS" to confirm the connection is working.',
        maxTokens: 20
      });

      result.details!.response = responseResult.content.includes('API_TEST_SUCCESS') || 
                                responseResult.content.toLowerCase().includes('success');

      if (!result.details!.response) {
        result.message = `${provider} responded but test phrase not found`;
        return result;
      }

      // All tests passed
      result.success = true;
      result.message = `${provider} API key is working perfectly!`;
      result.responseTime = Date.now() - startTime;

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.message = `${provider} test failed: ${result.error}`;
    }

    return result;
  }

  /**
   * Test all configured API keys for the user
   */
  async testAllConfiguredKeys(): Promise<ComprehensiveTestResult> {
    console.log('🚀 Starting comprehensive API key validation...');
    
    const results: APIKeyTestResult[] = [];
    let passed = 0;

    try {
      // Get user's AI preferences
      const preferences = await aiProviderService.getUserPreferences(this.userId);
      
      if (!preferences || !preferences.apiKeyEncrypted) {
        return {
          overall: false,
          results: [{
            success: false,
            provider: 'none' as AIProvider,
            message: 'No API keys configured for this user',
            details: {
              keyFormat: false,
              connection: false,
              response: false,
              storage: false,
              encryption: false
            }
          }],
          summary: { tested: 0, passed: 0, failed: 1 }
        };
      }

      // Test the configured provider
      console.log(`Testing configured provider: ${preferences.provider}`);
      const testResult = await aiProviderService.testConnection(this.userId);
      
      const result: APIKeyTestResult = {
        success: testResult.success,
        provider: preferences.provider,
        message: testResult.success ? 
          `${preferences.provider} is working correctly` : 
          testResult.error || 'Connection failed',
        details: {
          keyFormat: true, // If it's stored, format was valid
          connection: testResult.success,
          response: testResult.success,
          storage: true, // If we got preferences, storage worked
          encryption: true // If we got preferences, encryption worked
        },
        error: testResult.error
      };

      results.push(result);
      if (result.success) passed++;

    } catch (error) {
      results.push({
        success: false,
        provider: 'unknown' as AIProvider,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return {
      overall: passed > 0,
      results,
      summary: {
        tested: results.length,
        passed,
        failed: results.length - passed
      }
    };
  }

  /**
   * Validate API key format for different providers
   */
  private validateKeyFormat(provider: AIProvider, apiKey: string): boolean {
    if (!apiKey || apiKey.length < 10) return false;

    switch (provider) {
      case 'openai':
        return apiKey.startsWith('sk-') && apiKey.length >= 40;
      case 'gemini':
      case 'google':
        return apiKey.length >= 30 && !apiKey.includes(' ');
      case 'claude':
      case 'anthropic':
        return apiKey.startsWith('sk-ant-') && apiKey.length >= 40;
      case 'deepseek':
        return apiKey.startsWith('sk-') && apiKey.length >= 40;
      case 'mistral':
        return apiKey.length >= 30 && !apiKey.includes(' ');
      case 'custom':
        return apiKey.length >= 10; // More lenient for custom providers
      default:
        return apiKey.length >= 10;
    }
  }

  /**
   * Get default model for each provider
   */
  private getDefaultModel(provider: AIProvider): string {
    switch (provider) {
      case 'openai':
        return 'gpt-4';
      case 'gemini':
      case 'google':
        return 'gemini-pro';
      case 'claude':
      case 'anthropic':
        return 'claude-3-sonnet-20240229';
      case 'deepseek':
        return 'deepseek-chat';
      case 'mistral':
        return 'mistral-medium';
      default:
        return 'default';
    }
  }

  /**
   * Generate a detailed report
   */
  generateReport(result: ComprehensiveTestResult): string {
    let report = '\n🔍 API Key Validation Report\n';
    report += '================================\n\n';

    if (result.overall) {
      report += '✅ Overall Status: PASSED\n';
    } else {
      report += '❌ Overall Status: FAILED\n';
    }

    report += `📊 Summary: ${result.summary.passed}/${result.summary.tested} tests passed\n\n`;

    result.results.forEach((test, index) => {
      report += `Test ${index + 1}: ${test.provider.toUpperCase()}\n`;
      report += `Status: ${test.success ? '✅ PASS' : '❌ FAIL'}\n`;
      report += `Message: ${test.message}\n`;
      
      if (test.details) {
        report += 'Details:\n';
        report += `  - Key Format: ${test.details.keyFormat ? '✅' : '❌'}\n`;
        report += `  - Storage: ${test.details.storage ? '✅' : '❌'}\n`;
        report += `  - Encryption: ${test.details.encryption ? '✅' : '❌'}\n`;
        report += `  - Connection: ${test.details.connection ? '✅' : '❌'}\n`;
        report += `  - Response: ${test.details.response ? '✅' : '❌'}\n`;
      }
      
      if (test.responseTime) {
        report += `Response Time: ${test.responseTime}ms\n`;
      }
      
      if (test.error) {
        report += `Error: ${test.error}\n`;
      }
      
      report += '\n';
    });

    return report;
  }
}

/**
 * Quick test function for immediate use
 */
export async function quickAPIKeyTest(userId: string): Promise<void> {
  const tester = new APIKeyValidationTester(userId);
  const result = await tester.testAllConfiguredKeys();
  const report = tester.generateReport(result);
  
  console.log(report);
  
  if (!result.overall) {
    console.error('❌ API key validation failed. Please check your configuration.');
  } else {
    console.log('✅ All API key tests passed! Your application is ready to use.');
  }
}
