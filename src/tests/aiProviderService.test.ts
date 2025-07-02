// AI Provider Service Tests
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { AIProviderService } from '@/services/aiProviderService';
import { encryptApiKey, decryptApiKey } from '@/services/encryptionService';
import { SecurityAuditService } from '@/services/securityAuditService';
import { supabase } from '@/lib/supabase';

// Mock dependencies
vi.mock('@/services/encryptionService');
vi.mock('@/services/securityAuditService');
vi.mock('@/lib/supabase');

const mockEncryptApiKey = encryptApiKey as Mock;
const mockDecryptApiKey = decryptApiKey as Mock;
const mockSupabase = supabase as any;

describe('AIProviderService', () => {
  let aiProviderService: AIProviderService;
  const mockUserId = 'test-user-123';
  const mockApiKey = 'sk-test-api-key-123';

  beforeEach(() => {
    vi.clearAllMocks();
    aiProviderService = new AIProviderService();
    
    // Setup default mocks
    mockEncryptApiKey.mockResolvedValue('encrypted-key');
    mockDecryptApiKey.mockResolvedValue(mockApiKey);
    
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: '1',
              user_id: mockUserId,
              provider: 'openai',
              api_key_encrypted: 'encrypted-key',
              model_name: 'gpt-4',
              temperature: 0.7,
              max_tokens: 2000,
              provider_settings: {},
              total_requests: 10,
              total_tokens_used: 5000,
              connection_status: 'connected',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            error: null
          })
        })
      }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    });
  });

  describe('getUserPreferences', () => {
    it('should retrieve user preferences successfully', async () => {
      const preferences = await aiProviderService.getUserPreferences(mockUserId);
      
      expect(preferences).toBeDefined();
      expect(preferences?.provider).toBe('openai');
      expect(mockSupabase.from).toHaveBeenCalledWith('user_ai_preferences');
    });

    it('should return null when user has no preferences', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' } // No rows returned
            })
          })
        })
      });

      const preferences = await aiProviderService.getUserPreferences(mockUserId);
      expect(preferences).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'SOME_ERROR', message: 'Database error' }
            })
          })
        })
      });

      const preferences = await aiProviderService.getUserPreferences(mockUserId);
      expect(preferences).toBeNull();
    });
  });

  describe('saveUserPreferences', () => {
    const mockConfig = {
      provider: 'openai' as const,
      apiKey: mockApiKey,
      modelName: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      providerSettings: {}
    };

    it('should save user preferences successfully', async () => {
      const result = await aiProviderService.saveUserPreferences(mockUserId, mockConfig);
      
      expect(result).toBe(true);
      expect(mockEncryptApiKey).toHaveBeenCalledWith(mockApiKey, mockUserId);
      expect(SecurityAuditService.validateApiKeyFormat).toHaveBeenCalledWith('openai', mockApiKey);
      expect(SecurityAuditService.auditProviderConfig).toHaveBeenCalledWith(mockConfig);
      expect(SecurityAuditService.logApiKeyCreated).toHaveBeenCalledWith(mockUserId, 'openai');
    });

    it('should handle encryption failure', async () => {
      mockEncryptApiKey.mockRejectedValue(new Error('Encryption failed'));
      
      const result = await aiProviderService.saveUserPreferences(mockUserId, mockConfig);
      expect(result).toBe(false);
    });

    it('should handle database save failure', async () => {
      mockSupabase.from.mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ 
          error: { message: 'Database error' } 
        })
      });

      const result = await aiProviderService.saveUserPreferences(mockUserId, mockConfig);
      expect(result).toBe(false);
    });

    it('should validate API key format', async () => {
      const invalidConfig = { ...mockConfig, apiKey: 'invalid-key' };
      
      SecurityAuditService.validateApiKeyFormat = vi.fn().mockReturnValue({
        valid: false,
        warnings: ['API key format is invalid']
      });

      await aiProviderService.saveUserPreferences(mockUserId, invalidConfig);
      
      expect(SecurityAuditService.validateApiKeyFormat).toHaveBeenCalledWith('openai', 'invalid-key');
    });
  });

  describe('testConnection', () => {
    it('should test connection with provided config', async () => {
      const mockConfig = {
        provider: 'openai' as const,
        apiKey: mockApiKey,
        modelName: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000
      };

      // Mock provider response
      const mockProvider = {
        generateResponse: vi.fn().mockResolvedValue({
          content: 'OK',
          tokensUsed: { input: 5, output: 1, total: 6 },
          model: 'gpt-4',
          provider: 'openai',
          finishReason: 'stop'
        })
      };

      aiProviderService['providers'].set('openai', mockProvider);

      const result = await aiProviderService.testConnection(mockUserId, mockConfig);
      
      expect(result.success).toBe(true);
      expect(mockProvider.generateResponse).toHaveBeenCalled();
    });

    it('should test connection with stored preferences', async () => {
      const mockProvider = {
        generateResponse: vi.fn().mockResolvedValue({
          content: 'OK',
          tokensUsed: { input: 5, output: 1, total: 6 },
          model: 'gpt-4',
          provider: 'openai',
          finishReason: 'stop'
        })
      };

      aiProviderService['providers'].set('openai', mockProvider);

      const result = await aiProviderService.testConnection(mockUserId);
      
      expect(result.success).toBe(true);
      expect(mockDecryptApiKey).toHaveBeenCalled();
    });

    it('should handle connection failure', async () => {
      const mockProvider = {
        generateResponse: vi.fn().mockRejectedValue(new Error('Connection failed'))
      };

      aiProviderService['providers'].set('openai', mockProvider);

      const result = await aiProviderService.testConnection(mockUserId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection failed');
      expect(SecurityAuditService.logConnectionTestFailed).toHaveBeenCalled();
    });

    it('should handle missing API key', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      });

      const result = await aiProviderService.testConnection(mockUserId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No API key configured');
    });
  });

  describe('generateResponse', () => {
    const mockRequest = {
      prompt: 'Test prompt',
      systemPrompt: 'You are a helpful assistant',
      temperature: 0.7,
      maxTokens: 100
    };

    it('should generate response successfully', async () => {
      const mockProvider = {
        generateResponse: vi.fn().mockResolvedValue({
          content: 'Test response',
          tokensUsed: { input: 10, output: 5, total: 15 },
          model: 'gpt-4',
          provider: 'openai',
          finishReason: 'stop'
        })
      };

      aiProviderService['providers'].set('openai', mockProvider);

      const response = await aiProviderService.generateResponse(mockUserId, mockRequest);
      
      expect(response.content).toBe('Test response');
      expect(response.tokensUsed.total).toBe(15);
      expect(mockProvider.generateResponse).toHaveBeenCalledWith(
        mockRequest,
        expect.objectContaining({
          provider: 'openai',
          apiKey: mockApiKey
        })
      );
    });

    it('should throw error when no API key configured', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      });

      await expect(
        aiProviderService.generateResponse(mockUserId, mockRequest)
      ).rejects.toThrow('No AI provider configured');
    });

    it('should throw error for unsupported provider', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                ...mockSupabase.from().select().eq().single().data,
                provider: 'unsupported-provider'
              },
              error: null
            })
          })
        })
      });

      await expect(
        aiProviderService.generateResponse(mockUserId, mockRequest)
      ).rejects.toThrow('Provider unsupported-provider is not supported');
    });
  });

  describe('getAvailableProviders', () => {
    it('should return list of available providers', () => {
      const providers = aiProviderService.getAvailableProviders();
      
      expect(providers).toHaveLength(6); // openai, gemini, deepseek, claude, mistral, custom
      expect(providers.map(p => p.provider)).toContain('openai');
      expect(providers.map(p => p.provider)).toContain('gemini');
      expect(providers.map(p => p.provider)).toContain('custom');
    });

    it('should return provider capabilities', () => {
      const providers = aiProviderService.getAvailableProviders();
      const openaiProvider = providers.find(p => p.provider === 'openai');
      
      expect(openaiProvider).toBeDefined();
      expect(openaiProvider?.name).toBe('OpenAI');
      expect(openaiProvider?.models).toBeDefined();
      expect(openaiProvider?.features).toBeDefined();
    });
  });
});
