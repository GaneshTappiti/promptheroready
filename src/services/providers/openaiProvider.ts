// OpenAI Provider Implementation
import { 
  AIRequest, 
  AIResponse, 
  AIError, 
  OpenAIConfig,
  AIProviderCapabilities 
} from '@/types/aiProvider';

export class OpenAIProvider {
  async generateResponse(request: AIRequest, config: OpenAIConfig): Promise<AIResponse> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          ...(config.organization && { 'OpenAI-Organization': config.organization })
        },
        body: JSON.stringify({
          model: config.modelName || 'gpt-4',
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
          code: `OPENAI_${response.status}`,
          message: errorData.error?.message || `OpenAI API error: ${response.status}`,
          provider: 'openai',
          retryable: response.status >= 500 || response.status === 429,
          details: errorData
        });
      }

      const data = await response.json();
      const choice = data.choices[0];

      return {
        content: choice.message.content,
        tokensUsed: {
          input: data.usage.prompt_tokens,
          output: data.usage.completion_tokens,
          total: data.usage.total_tokens
        },
        model: data.model,
        provider: 'openai',
        finishReason: choice.finish_reason,
        metadata: {
          id: data.id,
          created: data.created,
          object: data.object
        }
      };
    } catch (error: any) {
      if (error instanceof AIError) {
        throw error;
      }

      throw new AIError({
        code: 'OPENAI_REQUEST_FAILED',
        message: error.message || 'OpenAI request failed',
        provider: 'openai',
        retryable: false,
        details: { originalError: error }
      });
    }
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      provider: 'openai',
      name: 'OpenAI',
      description: 'Advanced AI models including GPT-4 and GPT-3.5',
      models: [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          description: 'Most capable model, best for complex tasks',
          contextLength: 8192,
          inputCostPer1kTokens: 0.03,
          outputCostPer1kTokens: 0.06,
          isDefault: true
        },
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo',
          description: 'Faster and more cost-effective than GPT-4',
          contextLength: 128000,
          inputCostPer1kTokens: 0.01,
          outputCostPer1kTokens: 0.03
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          description: 'Fast and cost-effective for simpler tasks',
          contextLength: 16385,
          inputCostPer1kTokens: 0.001,
          outputCostPer1kTokens: 0.002
        }
      ],
      features: [
        { name: 'Text Generation', supported: true },
        { name: 'Code Generation', supported: true },
        { name: 'Function Calling', supported: true },
        { name: 'JSON Mode', supported: true },
        { name: 'Vision', supported: true, description: 'GPT-4 Vision models only' },
        { name: 'Streaming', supported: true }
      ],
      pricing: {
        type: 'paid',
        paidPlans: ['Pay-per-use', 'ChatGPT Plus ($20/month)']
      },
      limits: {
        requestsPerMinute: 3500,
        tokensPerMinute: 90000
      },
      setupInstructions: 'Get your API key from https://platform.openai.com/api-keys',
      websiteUrl: 'https://openai.com'
    };
  }
}
