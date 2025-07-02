// AI Providers Tests - Test individual provider implementations
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { OpenAIProvider } from '@/services/providers/openaiProvider';
import { GeminiProvider } from '@/services/providers/geminiProvider';
import { DeepSeekProvider } from '@/services/providers/deepseekProvider';
import { ClaudeProvider } from '@/services/providers/claudeProvider';
import { MistralProvider } from '@/services/providers/mistralProvider';
import { CustomProvider } from '@/services/providers/customProvider';
import { AIRequest } from '@/types/aiProvider';

// Mock fetch globally
const mockFetch = global.fetch as Mock;

describe('AI Providers', () => {
  const mockRequest: AIRequest = {
    prompt: 'Hello, how are you?',
    systemPrompt: 'You are a helpful assistant',
    temperature: 0.7,
    maxTokens: 100
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OpenAIProvider', () => {
    let provider: OpenAIProvider;

    beforeEach(() => {
      provider = new OpenAIProvider();
    });

    it('should generate response successfully', async () => {
      const mockResponse = {
        choices: [{
          message: { content: 'Hello! I am doing well, thank you.' },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 8,
          total_tokens: 18
        },
        model: 'gpt-4',
        id: 'chatcmpl-123',
        created: 1234567890,
        object: 'chat.completion'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const config = {
        provider: 'openai' as const,
        apiKey: 'sk-test-key',
        modelName: 'gpt-4'
      };

      const response = await provider.generateResponse(mockRequest, config);

      expect(response.content).toBe('Hello! I am doing well, thank you.');
      expect(response.tokensUsed.total).toBe(18);
      expect(response.provider).toBe('openai');
      expect(response.model).toBe('gpt-4');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          error: { message: 'Invalid API key' }
        })
      });

      const config = {
        provider: 'openai' as const,
        apiKey: 'invalid-key'
      };

      await expect(
        provider.generateResponse(mockRequest, config)
      ).rejects.toThrow('Invalid API key');
    });

    it('should include organization header when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
          usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 },
          model: 'gpt-4'
        })
      });

      const config = {
        provider: 'openai' as const,
        apiKey: 'sk-test-key',
        providerSettings: { organization: 'org-123' }
      };

      await provider.generateResponse(mockRequest, config);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            'OpenAI-Organization': 'org-123'
          })
        })
      );
    });

    it('should return correct capabilities', () => {
      const capabilities = provider.getCapabilities();
      
      expect(capabilities.provider).toBe('openai');
      expect(capabilities.name).toBe('OpenAI');
      expect(capabilities.models).toHaveLength(3);
      expect(capabilities.models[0].id).toBe('gpt-4');
      expect(capabilities.features.some(f => f.name === 'Text Generation')).toBe(true);
    });
  });

  describe('GeminiProvider', () => {
    let provider: GeminiProvider;

    beforeEach(() => {
      provider = new GeminiProvider();
    });

    it('should generate response successfully', async () => {
      // Mock GoogleGenerativeAI
      const mockGenerateContent = vi.fn().mockResolvedValue({
        response: {
          text: () => 'Hello! I am doing well.',
          candidates: [{
            finishReason: 'STOP',
            safetyRatings: [],
            citationMetadata: null
          }]
        }
      });

      const mockModel = {
        generateContent: mockGenerateContent
      };

      const mockGenAI = {
        getGenerativeModel: vi.fn().mockReturnValue(mockModel)
      };

      // Mock the GoogleGenerativeAI constructor
      vi.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: vi.fn().mockImplementation(() => mockGenAI)
      }));

      const config = {
        provider: 'gemini' as const,
        apiKey: 'test-key',
        modelName: 'gemini-2.0-flash'
      };

      const response = await provider.generateResponse(mockRequest, config);

      expect(response.content).toBe('Hello! I am doing well.');
      expect(response.provider).toBe('gemini');
      expect(response.model).toBe('gemini-2.0-flash');
    });

    it('should return correct capabilities', () => {
      const capabilities = provider.getCapabilities();
      
      expect(capabilities.provider).toBe('gemini');
      expect(capabilities.name).toBe('Google Gemini');
      expect(capabilities.pricing.type).toBe('freemium');
      expect(capabilities.features.some(f => f.name === 'Vision')).toBe(true);
    });
  });

  describe('DeepSeekProvider', () => {
    let provider: DeepSeekProvider;

    beforeEach(() => {
      provider = new DeepSeekProvider();
    });

    it('should generate response successfully', async () => {
      const mockResponse = {
        choices: [{
          message: { content: 'DeepSeek response' },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 8,
          completion_tokens: 5,
          total_tokens: 13
        },
        model: 'deepseek-chat'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const config = {
        provider: 'deepseek' as const,
        apiKey: 'test-key'
      };

      const response = await provider.generateResponse(mockRequest, config);

      expect(response.content).toBe('DeepSeek response');
      expect(response.provider).toBe('deepseek');
    });

    it('should use custom base URL when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
          usage: { total_tokens: 10 }
        })
      });

      const config = {
        provider: 'deepseek' as const,
        apiKey: 'test-key',
        baseURL: 'https://custom.deepseek.com/v1'
      };

      await provider.generateResponse(mockRequest, config);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom.deepseek.com/v1/chat/completions',
        expect.any(Object)
      );
    });
  });

  describe('ClaudeProvider', () => {
    let provider: ClaudeProvider;

    beforeEach(() => {
      provider = new ClaudeProvider();
    });

    it('should generate response successfully', async () => {
      const mockResponse = {
        content: [{ text: 'Claude response here' }],
        usage: {
          input_tokens: 12,
          output_tokens: 6
        },
        model: 'claude-3-sonnet-20240229',
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        stop_reason: 'end_turn'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const config = {
        provider: 'claude' as const,
        apiKey: 'test-key'
      };

      const response = await provider.generateResponse(mockRequest, config);

      expect(response.content).toBe('Claude response here');
      expect(response.tokensUsed.input).toBe(12);
      expect(response.tokensUsed.output).toBe(6);
      expect(response.provider).toBe('claude');
    });

    it('should include anthropic version header', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'Response' }],
          usage: { input_tokens: 5, output_tokens: 3 }
        })
      });

      const config = {
        provider: 'claude' as const,
        apiKey: 'test-key',
        version: '2023-06-01'
      };

      await provider.generateResponse(mockRequest, config);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          headers: expect.objectContaining({
            'anthropic-version': '2023-06-01'
          })
        })
      );
    });
  });

  describe('CustomProvider', () => {
    let provider: CustomProvider;

    beforeEach(() => {
      provider = new CustomProvider();
    });

    it('should generate response with OpenAI format', async () => {
      const mockResponse = {
        choices: [{
          message: { content: 'Custom response' },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15
        },
        model: 'custom-model'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const config = {
        provider: 'custom' as const,
        apiKey: 'test-key',
        customEndpoint: 'https://api.custom.com/v1/chat/completions',
        requestFormat: 'openai' as const
      };

      const response = await provider.generateResponse(mockRequest, config);

      expect(response.content).toBe('Custom response');
      expect(response.provider).toBe('custom');
    });

    it('should handle simple text response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve('Simple text response')
      });

      const config = {
        provider: 'custom' as const,
        apiKey: 'test-key',
        customEndpoint: 'https://api.custom.com/generate'
      };

      const response = await provider.generateResponse(mockRequest, config);

      expect(response.content).toBe('Simple text response');
    });

    it('should require custom endpoint', async () => {
      const config = {
        provider: 'custom' as const,
        apiKey: 'test-key'
      };

      await expect(
        provider.generateResponse(mockRequest, config)
      ).rejects.toThrow('Custom endpoint is required');
    });

    it('should include custom headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve('Response')
      });

      const config = {
        provider: 'custom' as const,
        apiKey: 'test-key',
        customEndpoint: 'https://api.custom.com/generate',
        headers: {
          'X-Custom-Header': 'custom-value'
        }
      };

      await provider.generateResponse(mockRequest, config);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.custom.com/generate',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value'
          })
        })
      );
    });
  });

  describe('Error handling across providers', () => {
    const providers = [
      { name: 'OpenAI', instance: new OpenAIProvider() },
      { name: 'DeepSeek', instance: new DeepSeekProvider() },
      { name: 'Mistral', instance: new MistralProvider() }
    ];

    providers.forEach(({ name, instance }) => {
      it(`${name} should handle network errors`, async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        const config = {
          provider: name.toLowerCase() as any,
          apiKey: 'test-key'
        };

        await expect(
          instance.generateResponse(mockRequest, config)
        ).rejects.toThrow();
      });

      it(`${name} should handle rate limiting`, async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 429,
          json: () => Promise.resolve({
            error: { message: 'Rate limit exceeded' }
          })
        });

        const config = {
          provider: name.toLowerCase() as any,
          apiKey: 'test-key'
        };

        await expect(
          instance.generateResponse(mockRequest, config)
        ).rejects.toThrow();
      });
    });
  });
});
