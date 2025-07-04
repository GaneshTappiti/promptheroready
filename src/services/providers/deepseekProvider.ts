// DeepSeek Provider Implementation
import { 
  AIRequest, 
  AIResponse, 
  AIError, 
  DeepSeekConfig,
  AIProviderCapabilities 
} from '@/types/aiProvider';

export class DeepSeekProvider {
  async generateResponse(request: AIRequest, config: DeepSeekConfig): Promise<AIResponse> {
    try {
      const baseURL = config.baseURL || 'https://api.deepseek.com/v1';
      
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.modelName || 'deepseek-chat',
          messages: [
            ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
            { role: 'user', content: request.prompt }
          ],
          temperature: request.temperature || config.temperature || 0.7,
          max_tokens: request.maxTokens || config.maxTokens || 2000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AIError({
          code: `DEEPSEEK_${response.status}`,
          message: errorData.error?.message || `DeepSeek API error: ${response.status}`,
          provider: 'deepseek',
          retryable: response.status >= 500 || response.status === 429,
          details: errorData
        });
      }

      const data = await response.json();
      const choice = data.choices[0];

      return {
        content: choice.message.content,
        tokensUsed: {
          input: data.usage?.prompt_tokens || 0,
          output: data.usage?.completion_tokens || 0,
          total: data.usage?.total_tokens || 0
        },
        model: data.model,
        provider: 'deepseek',
        finishReason: choice.finish_reason,
        metadata: {
          id: data.id,
          created: data.created
        }
      };
    } catch (error: unknown) {
      if (error instanceof AIError) {
        throw error;
      }

      throw new AIError({
        code: 'DEEPSEEK_REQUEST_FAILED',
        message: (error as any)?.message || 'DeepSeek request failed',
        provider: 'deepseek',
        retryable: false,
        details: { originalError: error }
      });
    }
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      provider: 'deepseek',
      name: 'DeepSeek',
      description: 'Cost-effective AI models with strong coding capabilities',
      models: [
        {
          id: 'deepseek-chat',
          name: 'DeepSeek Chat',
          description: 'General purpose conversational model',
          contextLength: 32768,
          inputCostPer1kTokens: 0.00014,
          outputCostPer1kTokens: 0.00028,
          isDefault: true
        },
        {
          id: 'deepseek-coder',
          name: 'DeepSeek Coder',
          description: 'Specialized model for coding tasks',
          contextLength: 16384,
          inputCostPer1kTokens: 0.00014,
          outputCostPer1kTokens: 0.00028
        }
      ],
      features: [
        { name: 'Text Generation', supported: true },
        { name: 'Code Generation', supported: true, description: 'Excellent coding capabilities' },
        { name: 'Function Calling', supported: false },
        { name: 'JSON Mode', supported: true },
        { name: 'Vision', supported: false },
        { name: 'Streaming', supported: true }
      ],
      pricing: {
        type: 'paid',
        paidPlans: ['Pay-per-use (very cost-effective)']
      },
      limits: {
        requestsPerMinute: 60,
        tokensPerMinute: 1000000
      },
      setupInstructions: 'Get your API key from https://platform.deepseek.com/api_keys',
      websiteUrl: 'https://deepseek.com'
    };
  }
}
