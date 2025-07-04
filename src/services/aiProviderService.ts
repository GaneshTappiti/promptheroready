// AI Provider Service - Dynamic routing to different AI providers
import {
  AIProvider,
  AIProviderConfig,
  AIRequest,
  AIResponse,
  AIError,
  UserAIPreferences,
  ConnectionStatus,
  AIProviderCapabilities
} from '@/types/aiProvider';
import { supabase } from '@/lib/supabase';
import { encryptApiKey, decryptApiKey } from './encryptionService';
import { SecurityAuditService } from './securityAuditService';
import { OpenAIProvider } from './providers/openaiProvider';
import { GeminiProvider } from './providers/geminiProvider';
import { DeepSeekProvider } from './providers/deepseekProvider';
import { ClaudeProvider } from './providers/claudeProvider';
import { MistralProvider } from './providers/mistralProvider';
import { CustomProvider } from './providers/customProvider';

interface BaseProvider {
  generateResponse(request: AIRequest, config: AIProviderConfig): Promise<AIResponse>;
  getCapabilities(): AIProviderCapabilities;
}

export class AIProviderService {
  private providers: Map<AIProvider, BaseProvider> = new Map();

  constructor() {
    // Initialize providers
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set('deepseek', new DeepSeekProvider());
    this.providers.set('claude', new ClaudeProvider());
    this.providers.set('mistral', new MistralProvider());
    this.providers.set('custom', new CustomProvider());
  }

  /**
   * Get user's AI preferences from database
   */
  async getUserPreferences(userId: string): Promise<UserAIPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_ai_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user AI preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return null;
    }
  }

  /**
   * Save or update user's AI preferences
   */
  async saveUserPreferences(userId: string, config: AIProviderConfig): Promise<boolean> {
    try {
      // Validate API key format
      if (config.apiKey) {
        const validation = SecurityAuditService.validateApiKeyFormat(config.provider, config.apiKey);
        if (!validation.valid) {
          console.warn('API key validation failed:', validation.warnings);
        }
      }

      // Audit provider configuration
      const configIssues = SecurityAuditService.auditProviderConfig(config);
      if (configIssues.length > 0) {
        console.warn('Provider configuration issues:', configIssues);
      }

      const encryptedApiKey = config.apiKey ? await encryptApiKey(config.apiKey, userId) : null;
      
      const preferences = {
        user_id: userId,
        provider: config.provider,
        api_key_encrypted: encryptedApiKey,
        model_name: config.modelName,
        custom_endpoint: config.customEndpoint,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2000,
        provider_settings: config.providerSettings || {},
        connection_status: 'untested' as ConnectionStatus,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_ai_preferences')
        .upsert(preferences, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving user AI preferences:', error);
        return false;
      }

      // Log security event
      await SecurityAuditService.logApiKeyCreated(userId, config.provider);

      return true;
    } catch (error) {
      console.error('Error in saveUserPreferences:', error);
      return false;
    }
  }

  /**
   * Test connection to AI provider
   */
  async testConnection(userId: string, config?: AIProviderConfig): Promise<{ success: boolean; error?: string }> {
    let testConfig = config;

    try {
      
      if (!testConfig) {
        const preferences = await this.getUserPreferences(userId);
        if (!preferences || !preferences.apiKeyEncrypted) {
          return { success: false, error: 'No API key configured' };
        }
        
        testConfig = {
          provider: preferences.provider,
          apiKey: await decryptApiKey(preferences.apiKeyEncrypted, userId),
          modelName: preferences.modelName,
          customEndpoint: preferences.customEndpoint,
          temperature: preferences.temperature,
          maxTokens: preferences.maxTokens,
          providerSettings: preferences.providerSettings
        };
      }

      const provider = this.providers.get(testConfig.provider);
      if (!provider) {
        return { success: false, error: `Provider ${testConfig.provider} not supported` };
      }

      // Test with a simple prompt
      const testRequest: AIRequest = {
        prompt: 'Hello! Please respond with just "OK" to confirm the connection.',
        maxTokens: 10
      };

      await provider.generateResponse(testRequest, testConfig);
      
      // Update connection status in database
      await this.updateConnectionStatus(userId, 'connected');

      return { success: true };
    } catch (error: unknown) {
      console.error('Connection test failed:', error);

      const errorMessage = error instanceof Error ? (error as Error).message : 'Unknown error';

      // Log security event
      await SecurityAuditService.logConnectionTestFailed(
        userId,
        testConfig?.provider || 'unknown',
        errorMessage
      );

      // Update connection status in database
      const status = errorMessage.includes('quota') ? 'quota_exceeded' : 'error';
      await this.updateConnectionStatus(userId, status, errorMessage);

      return { success: false, error: errorMessage || 'Connection test failed' };
    }
  }

  /**
   * Generate AI response using user's configured provider
   */
  async generateResponse(userId: string, request: AIRequest): Promise<AIResponse> {
    // Check if we're in development mode and should use mock responses
    if (process.env.NODE_ENV === 'development' && !userId) {
      return this.generateMockResponseInternal(request);
    }

    const preferences = await this.getUserPreferences(userId);

    if (!preferences || !preferences.apiKeyEncrypted) {
      // In development, return mock response instead of throwing error
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockResponseInternal(request);
      }

      throw new AIError({
        code: 'NO_API_KEY',
        message: 'No AI provider configured. Please set up your AI provider in settings.',
        provider: 'custom',
        retryable: false
      });
    }

    const config: AIProviderConfig = {
      provider: preferences.provider,
      apiKey: await decryptApiKey(preferences.apiKeyEncrypted, userId),
      modelName: preferences.modelName,
      customEndpoint: preferences.customEndpoint,
      temperature: request.temperature || preferences.temperature,
      maxTokens: request.maxTokens || preferences.maxTokens,
      providerSettings: preferences.providerSettings
    };

    const provider = this.providers.get(config.provider);
    if (!provider) {
      throw new AIError({
        code: 'PROVIDER_NOT_SUPPORTED',
        message: `Provider ${config.provider} is not supported`,
        provider: config.provider,
        retryable: false
      });
    }

    try {
      const response = await provider.generateResponse(request, config);
      
      // Update usage statistics
      await this.updateUsageStats(userId, response.tokensUsed.total);
      
      return response;
    } catch (error: unknown) {
      // Update error status
      const errorMessage = error instanceof Error ? (error as Error).message : 'Unknown error';
      const status = errorMessage.includes('quota') ? 'quota_exceeded' : 'error';
      await this.updateConnectionStatus(userId, status, errorMessage);

      throw error;
    }
  }

  /**
   * Get available AI providers and their capabilities
   */
  getAvailableProviders() {
    return Array.from(this.providers.keys()).map(provider => {
      const providerInstance = this.providers.get(provider);
      return providerInstance?.getCapabilities?.() || {
        provider,
        name: provider.charAt(0).toUpperCase() + provider.slice(1),
        description: `${provider} AI provider`,
        models: [],
        features: [],
        pricing: { type: 'paid' as const },
        limits: {},
        setupInstructions: `Configure your ${provider} API key`,
        websiteUrl: '#'
      };
    });
  }

  // Private helper methods

  private async updateConnectionStatus(userId: string, status: ConnectionStatus, error?: string) {
    try {
      await supabase
        .from('user_ai_preferences')
        .update({
          connection_status: status,
          last_error: error || null,
          last_test_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } catch (err) {
      console.error('Error updating connection status:', err);
    }
  }

  private async updateUsageStats(userId: string, tokensUsed: number) {
    try {
      const { data } = await supabase
        .from('user_ai_preferences')
        .select('total_requests, total_tokens_used')
        .eq('user_id', userId)
        .single();

      if (data) {
        await supabase
          .from('user_ai_preferences')
          .update({
            total_requests: (data.total_requests || 0) + 1,
            total_tokens_used: (data.total_tokens_used || 0) + tokensUsed,
            last_used_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error('Error updating usage stats:', error);
    }
  }

  /**
   * Get available providers
   */
  async getProviders(): Promise<string[]> {
    return Array.from(this.providers.keys());
  }

  /**
   * Generate error response when no valid provider is available
   */
  private generateErrorResponse(): AIResponse {
    return {
      content: 'Error: No AI provider configured. Please set up your AI provider in settings.',
      tokensUsed: {
        input: 0,
        output: 0,
        total: 0
      },
      model: 'error',
      provider: 'none',
      finishReason: 'error'
    };
  }

  /**
   * Generate mock response for development/testing
   */
  private generateMockResponseInternal(request: AIRequest): AIResponse {
    return {
      content: `Mock response for: ${request.prompt.substring(0, 100)}...`,
      tokensUsed: {
        input: request.prompt.length / 4,
        output: 50,
        total: (request.prompt.length / 4) + 50
      },
      model: 'mock-model',
      provider: 'custom',
      finishReason: 'stop',
      metadata: {
        mock: true,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Singleton instance
export const aiProviderService = new AIProviderService();
