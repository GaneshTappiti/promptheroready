// Mistral Provider Implementation
import { 
  AIRequest, 
  AIResponse, 
  AIError, 
  MistralConfig,
  AIProviderCapabilities 
} from '@/types/aiProvider';

export class MistralProvider {
  async generateResponse(request: AIRequest, config: MistralConfig): Promise<AIResponse> {
    try {
      const endpoint = config.endpoint || 'https://api.mistral.ai/v1';
      
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.modelName || 'mistral-large-latest',
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
          code: `MISTRAL_${response.status}`,
          message: errorData.error?.message || `Mistral API error: ${response.status}`,
          provider: 'mistral',
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
        provider: 'mistral',
        finishReason: choice.finish_reason,
        metadata: {
          id: data.id,
          created: data.created
        }
      };
    } catch (error: any) {
      if (error instanceof AIError) {
        throw error;
      }

      throw new AIError({
        code: 'MISTRAL_REQUEST_FAILED',
        message: error.message || 'Mistral request failed',
        provider: 'mistral',
        retryable: false,
        details: { originalError: error }
      });
    }
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      provider: 'mistral',
      name: 'Mistral AI',
      description: 'European AI models with strong multilingual capabilities',
      models: [
        {
          id: 'mistral-large-latest',
          name: 'Mistral Large',
          description: 'Most capable model for complex reasoning',
          contextLength: 32768,
          inputCostPer1kTokens: 0.004,
          outputCostPer1kTokens: 0.012,
          isDefault: true
        },
        {
          id: 'mistral-medium-latest',
          name: 'Mistral Medium',
          description: 'Balanced performance for most tasks',
          contextLength: 32768,
          inputCostPer1kTokens: 0.0025,
          outputCostPer1kTokens: 0.0075
        },
        {
          id: 'mistral-small-latest',
          name: 'Mistral Small',
          description: 'Fast and cost-effective for simple tasks',
          contextLength: 32768,
          inputCostPer1kTokens: 0.001,
          outputCostPer1kTokens: 0.003
        }
      ],
      features: [
        { name: 'Text Generation', supported: true },
        { name: 'Code Generation', supported: true },
        { name: 'Function Calling', supported: true },
        { name: 'JSON Mode', supported: true },
        { name: 'Vision', supported: false },
        { name: 'Multilingual', supported: true, description: 'Strong support for European languages' },
        { name: 'Streaming', supported: true }
      ],
      pricing: {
        type: 'paid',
        paidPlans: ['Pay-per-use']
      },
      limits: {
        requestsPerMinute: 100,
        tokensPerMinute: 1000000
      },
      setupInstructions: 'Get your API key from https://console.mistral.ai/',
      websiteUrl: 'https://mistral.ai'
    };
  }
}
