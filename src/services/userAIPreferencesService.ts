// User AI Preferences Service - Helper functions for managing user AI settings
import { supabase } from '@/lib/supabase';
import { UserAIPreferences, AIProviderConfig, ConnectionStatus } from '@/types/aiProvider';
import { encryptApiKey, decryptApiKey } from './encryptionService';

export class UserAIPreferencesService {
  /**
   * Get user's AI preferences
   */
  static async getUserPreferences(userId: string): Promise<UserAIPreferences | null> {
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

      if (!data) return null;

      // Convert snake_case to camelCase for TypeScript
      return {
        id: data.id,
        userId: data.user_id,
        provider: data.provider,
        apiKeyEncrypted: data.api_key_encrypted,
        modelName: data.model_name,
        customEndpoint: data.custom_endpoint,
        temperature: data.temperature,
        maxTokens: data.max_tokens,
        providerSettings: data.provider_settings,
        totalRequests: data.total_requests,
        totalTokensUsed: data.total_tokens_used,
        lastUsedAt: data.last_used_at,
        connectionStatus: data.connection_status,
        lastError: data.last_error,
        lastTestAt: data.last_test_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return null;
    }
  }

  /**
   * Save or update user's AI preferences
   */
  static async saveUserPreferences(userId: string, config: AIProviderConfig): Promise<boolean> {
    try {
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

      return true;
    } catch (error) {
      console.error('Error in saveUserPreferences:', error);
      return false;
    }
  }

  /**
   * Update connection status
   */
  static async updateConnectionStatus(
    userId: string, 
    status: ConnectionStatus, 
    error?: string
  ): Promise<boolean> {
    try {
      const { error: updateError } = await supabase
        .from('user_ai_preferences')
        .update({
          connection_status: status,
          last_error: error || null,
          last_test_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating connection status:', updateError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error in updateConnectionStatus:', err);
      return false;
    }
  }

  /**
   * Update usage statistics
   */
  static async updateUsageStats(userId: string, tokensUsed: number): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('user_ai_preferences')
        .select('total_requests, total_tokens_used')
        .eq('user_id', userId)
        .single();

      if (data) {
        const { error } = await supabase
          .from('user_ai_preferences')
          .update({
            total_requests: (data.total_requests || 0) + 1,
            total_tokens_used: (data.total_tokens_used || 0) + tokensUsed,
            last_used_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating usage stats:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in updateUsageStats:', error);
      return false;
    }
  }

  /**
   * Delete user's AI preferences
   */
  static async deleteUserPreferences(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_ai_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting user AI preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteUserPreferences:', error);
      return false;
    }
  }

  /**
   * Get usage statistics for a user
   */
  static async getUsageStats(userId: string): Promise<{
    totalRequests: number;
    totalTokensUsed: number;
    lastUsedAt?: string;
    connectionStatus: ConnectionStatus;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('user_ai_preferences')
        .select('total_requests, total_tokens_used, last_used_at, connection_status')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching usage stats:', error);
        return null;
      }

      return {
        totalRequests: data.total_requests || 0,
        totalTokensUsed: data.total_tokens_used || 0,
        lastUsedAt: data.last_used_at,
        connectionStatus: data.connection_status
      };
    } catch (error) {
      console.error('Error in getUsageStats:', error);
      return null;
    }
  }

  /**
   * Check if user has AI provider configured
   */
  static async hasProviderConfigured(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_ai_preferences')
        .select('api_key_encrypted')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking provider configuration:', error);
        return false;
      }

      return !!(data && data.api_key_encrypted);
    } catch (error) {
      console.error('Error in hasProviderConfigured:', error);
      return false;
    }
  }

  /**
   * Get decrypted API key for internal use
   */
  static async getDecryptedApiKey(encryptedKey: string, userId: string): Promise<string> {
    return await decryptApiKey(encryptedKey, userId);
  }
}

// Export helper functions for easier use
export const {
  getUserPreferences,
  saveUserPreferences,
  updateConnectionStatus,
  updateUsageStats,
  deleteUserPreferences,
  getUsageStats,
  hasProviderConfigured,
  getDecryptedApiKey
} = UserAIPreferencesService;
