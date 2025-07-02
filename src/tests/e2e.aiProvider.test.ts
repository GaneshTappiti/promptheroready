// End-to-End AI Provider Tests - Complete system integration
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { createAIEngine } from '@/services/aiEngine';
import { aiProviderService } from '@/services/aiProviderService';
import { encryptApiKey, decryptApiKey } from '@/services/encryptionService';
import { SecurityAuditService } from '@/services/securityAuditService';

// Mock all external dependencies
vi.mock('@/services/encryptionService');
vi.mock('@/lib/supabase');
vi.mock('@google/generative-ai');

const mockEncryptApiKey = encryptApiKey as Mock;
const mockDecryptApiKey = decryptApiKey as Mock;

describe('End-to-End AI Provider System', () => {
  const testUserId = 'e2e-test-user';
  const testApiKey = 'sk-test-key-for-e2e';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup encryption mocks
    mockEncryptApiKey.mockResolvedValue('encrypted-test-key');
    mockDecryptApiKey.mockResolvedValue(testApiKey);

    // Mock Supabase operations
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: '1',
                user_id: testUserId,
                provider: 'openai',
                api_key_encrypted: 'encrypted-test-key',
                model_name: 'gpt-4',
                temperature: 0.7,
                max_tokens: 2000,
                provider_settings: {},
                total_requests: 0,
                total_tokens_used: 0,
                connection_status: 'untested',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              error: null
            })
          }))
        })),
        upsert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null })
        }))
      }))
    };

    vi.doMock('@/lib/supabase', () => ({ supabase: mockSupabase }));

    // Mock fetch for API calls
    global.fetch = vi.fn();
  });

  describe('Complete User Journey', () => {
    it('should handle new user setup to first AI request', async () => {
      // Step 1: User configures OpenAI provider
      const config = {
        provider: 'openai' as const,
        apiKey: testApiKey,
        modelName: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000
      };

      // Mock API key validation
      SecurityAuditService.validateApiKeyFormat = vi.fn().mockReturnValue({
        valid: true,
        warnings: []
      });

      SecurityAuditService.auditProviderConfig = vi.fn().mockReturnValue([]);
      SecurityAuditService.logApiKeyCreated = vi.fn();

      const saveResult = await aiProviderService.saveUserPreferences(testUserId, config);
      expect(saveResult).toBe(true);

      // Step 2: Test connection
      const mockOpenAIResponse = {
        choices: [{
          message: { content: 'OK' },
          finish_reason: 'stop'
        }],
        usage: { prompt_tokens: 5, completion_tokens: 1, total_tokens: 6 },
        model: 'gpt-4'
      };

      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockOpenAIResponse)
      });

      const testResult = await aiProviderService.testConnection(testUserId);
      expect(testResult.success).toBe(true);

      // Step 3: Generate AI response using the configured provider
      const aiEngine = createAIEngine(testUserId);
      
      const mockAnalysisResponse = {
        choices: [{
          message: { 
            content: JSON.stringify({
              problemStatement: "Build a meal planning app",
              targetMarket: "Health-conscious individuals",
              monetization: "Subscription model",
              mvpStack: ["React", "Node.js", "MongoDB"],
              launchPath: [
                {
                  phase: "MVP Development",
                  title: "Build core features",
                  description: "Develop meal planning functionality",
                  duration: "2-3 months"
                }
              ]
            })
          },
          finish_reason: 'stop'
        }],
        usage: { prompt_tokens: 50, completion_tokens: 200, total_tokens: 250 },
        model: 'gpt-4'
      };

      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAnalysisResponse)
      });

      const startupBrief = await aiEngine.analyzeStartupIdea('Build a meal planner app');
      
      expect(startupBrief).toBeDefined();
      expect(startupBrief.problemStatement).toBe('Build a meal planning app');
      expect(startupBrief.targetMarket).toBe('Health-conscious individuals');

      // Verify the entire flow worked
      expect(mockEncryptApiKey).toHaveBeenCalledWith(testApiKey, testUserId);
      expect(mockDecryptApiKey).toHaveBeenCalledWith('encrypted-test-key', testUserId);
      expect(SecurityAuditService.logApiKeyCreated).toHaveBeenCalledWith(testUserId, 'openai');
    });

    it('should handle provider switching', async () => {
      // Start with OpenAI
      const openaiConfig = {
        provider: 'openai' as const,
        apiKey: 'sk-openai-key',
        modelName: 'gpt-4'
      };

      await aiProviderService.saveUserPreferences(testUserId, openaiConfig);

      // Switch to Gemini
      const geminiConfig = {
        provider: 'gemini' as const,
        apiKey: 'gemini-api-key',
        modelName: 'gemini-2.0-flash'
      };

      // Update mock to return Gemini config
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  ...mockSupabase.from().select().eq().single().data,
                  provider: 'gemini',
                  model_name: 'gemini-2.0-flash'
                },
                error: null
              })
            }))
          })),
          upsert: vi.fn().mockResolvedValue({ error: null })
        }))
      };

      const switchResult = await aiProviderService.saveUserPreferences(testUserId, geminiConfig);
      expect(switchResult).toBe(true);

      // Test that the new provider works
      const preferences = await aiProviderService.getUserPreferences(testUserId);
      expect(preferences?.provider).toBe('gemini');
    });

    it('should handle errors gracefully throughout the flow', async () => {
      // Test encryption failure
      mockEncryptApiKey.mockRejectedValue(new Error('Encryption failed'));

      const config = {
        provider: 'openai' as const,
        apiKey: testApiKey
      };

      const saveResult = await aiProviderService.saveUserPreferences(testUserId, config);
      expect(saveResult).toBe(false);

      // Test API failure
      mockEncryptApiKey.mockResolvedValue('encrypted-key');
      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      const testResult = await aiProviderService.testConnection(testUserId);
      expect(testResult.success).toBe(false);
      expect(testResult.error).toContain('Network error');

      // Test decryption failure
      mockDecryptApiKey.mockRejectedValue(new Error('Decryption failed'));

      await expect(
        aiProviderService.generateResponse(testUserId, {
          prompt: 'Test prompt'
        })
      ).rejects.toThrow();
    });
  });

  describe('Multi-Provider Support', () => {
    it('should work with all supported providers', async () => {
      const providers = [
        { name: 'openai', key: 'sk-openai-test' },
        { name: 'gemini', key: 'gemini-test-key' },
        { name: 'deepseek', key: 'deepseek-test-key' },
        { name: 'claude', key: 'sk-ant-claude-test' },
        { name: 'mistral', key: 'mistral-test-key' }
      ];

      for (const provider of providers) {
        const config = {
          provider: provider.name as any,
          apiKey: provider.key
        };

        // Mock successful response for each provider
        (global.fetch as Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'Test response' }, finish_reason: 'stop' }],
            usage: { total_tokens: 10 },
            model: 'test-model'
          })
        });

        const saveResult = await aiProviderService.saveUserPreferences(testUserId, config);
        expect(saveResult).toBe(true);

        const testResult = await aiProviderService.testConnection(testUserId);
        expect(testResult.success).toBe(true);
      }
    });

    it('should handle custom provider configuration', async () => {
      const customConfig = {
        provider: 'custom' as const,
        apiKey: 'custom-api-key',
        customEndpoint: 'https://api.custom.com/v1/chat/completions',
        requestFormat: 'openai' as const,
        headers: {
          'X-Custom-Header': 'custom-value'
        }
      };

      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Custom response' }, finish_reason: 'stop' }],
          usage: { total_tokens: 15 }
        })
      });

      const saveResult = await aiProviderService.saveUserPreferences(testUserId, customConfig);
      expect(saveResult).toBe(true);

      const testResult = await aiProviderService.testConnection(testUserId);
      expect(testResult.success).toBe(true);

      // Verify custom headers were included
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.custom.com/v1/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value'
          })
        })
      );
    });
  });

  describe('Security and Audit Trail', () => {
    it('should maintain complete audit trail', async () => {
      const logSpy = vi.spyOn(console, 'log');
      
      SecurityAuditService.logApiKeyCreated = vi.fn();
      SecurityAuditService.logConnectionTestFailed = vi.fn();

      const config = {
        provider: 'openai' as const,
        apiKey: testApiKey
      };

      // Save configuration
      await aiProviderService.saveUserPreferences(testUserId, config);
      expect(SecurityAuditService.logApiKeyCreated).toHaveBeenCalledWith(testUserId, 'openai');

      // Failed connection test
      (global.fetch as Mock).mockRejectedValue(new Error('Invalid API key'));
      
      const testResult = await aiProviderService.testConnection(testUserId);
      expect(testResult.success).toBe(false);
      expect(SecurityAuditService.logConnectionTestFailed).toHaveBeenCalledWith(
        testUserId,
        'openai',
        'Invalid API key'
      );
    });

    it('should validate API key formats', () => {
      const testCases = [
        { provider: 'openai', key: 'sk-valid-openai-key-1234567890abcdef', valid: true },
        { provider: 'openai', key: 'invalid-key', valid: false },
        { provider: 'claude', key: 'sk-ant-valid-claude-key', valid: true },
        { provider: 'claude', key: 'sk-invalid-claude', valid: false },
        { provider: 'gemini', key: 'AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI', valid: true },
        { provider: 'gemini', key: 'short', valid: false }
      ];

      testCases.forEach(({ provider, key, valid }) => {
        const result = SecurityAuditService.validateApiKeyFormat(provider, key);
        if (valid) {
          expect(result.valid).toBe(true);
          expect(result.warnings).toHaveLength(0);
        } else {
          expect(result.valid).toBe(false);
          expect(result.warnings.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle high concurrency', async () => {
      const config = {
        provider: 'openai' as const,
        apiKey: testApiKey
      };

      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
          usage: { total_tokens: 10 }
        })
      });

      // Simulate multiple concurrent requests
      const promises = Array.from({ length: 10 }, (_, i) => 
        aiProviderService.generateResponse(testUserId, {
          prompt: `Test prompt ${i}`
        })
      );

      const responses = await Promise.all(promises);
      
      expect(responses).toHaveLength(10);
      responses.forEach(response => {
        expect(response.content).toBe('Response');
        expect(response.provider).toBe('openai');
      });
    });

    it('should handle rate limiting gracefully', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve({
          error: { message: 'Rate limit exceeded' }
        })
      });

      await expect(
        aiProviderService.generateResponse(testUserId, {
          prompt: 'Test prompt'
        })
      ).rejects.toThrow('Rate limit exceeded');
    });
  });
});
