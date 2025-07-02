// Claude Provider Implementation
import { 
  AIRequest, 
  AIResponse, 
  AIError, 
  ClaudeConfig,
  AIProviderCapabilities 
} from '@/types/aiProvider';

export class ClaudeProvider {
  async generateResponse(request: AIRequest, config: ClaudeConfig): Promise<AIResponse> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': config.version || '2023-06-01'
        },
        body: JSON.stringify({
          model: config.modelName || 'claude-3-sonnet-20240229',
          max_tokens: request.maxTokens || config.maxTokens || 2000,
          temperature: request.temperature || config.temperature || 0.7,
          system: request.systemPrompt,
          messages: [
            { role: 'user', content: request.prompt }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AIError({
          code: `CLAUDE_${response.status}`,
          message: errorData.error?.message || `Claude API error: ${response.status}`,
          provider: 'claude',
          retryable: response.status >= 500 || response.status === 429,
          details: errorData
        });
      }

      const data = await response.json();

      return {
        content: data.content[0].text,
        tokensUsed: {
          input: data.usage.input_tokens,
          output: data.usage.output_tokens,
          total: data.usage.input_tokens + data.usage.output_tokens
        },
        model: data.model,
        provider: 'claude',
        finishReason: data.stop_reason,
        metadata: {
          id: data.id,
          type: data.type,
          role: data.role
        }
      };
    } catch (error: any) {
      if (error instanceof AIError) {
        throw error;
      }

      throw new AIError({
        code: 'CLAUDE_REQUEST_FAILED',
        message: error.message || 'Claude request failed',
        provider: 'claude',
        retryable: false,
        details: { originalError: error }
      });
    }
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      provider: 'claude',
      name: 'Anthropic Claude',
      description: 'Advanced AI assistant with strong reasoning and safety features',
      models: [
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          description: 'Most powerful model for complex tasks',
          contextLength: 200000,
          inputCostPer1kTokens: 0.015,
          outputCostPer1kTokens: 0.075
        },
        {
          id: 'claude-3-sonnet-20240229',
          name: 'Claude 3 Sonnet',
          description: 'Balanced performance and speed',
          contextLength: 200000,
          inputCostPer1kTokens: 0.003,
          outputCostPer1kTokens: 0.015,
          isDefault: true
        },
        {
          id: 'claude-3-haiku-20240307',
          name: 'Claude 3 Haiku',
          description: 'Fastest and most cost-effective',
          contextLength: 200000,
          inputCostPer1kTokens: 0.00025,
          outputCostPer1kTokens: 0.00125
        }
      ],
      features: [
        { name: 'Text Generation', supported: true },
        { name: 'Code Generation', supported: true },
        { name: 'Function Calling', supported: false },
        { name: 'JSON Mode', supported: true },
        { name: 'Vision', supported: true, description: 'Claude 3 models only' },
        { name: 'Long Context', supported: true, description: 'Up to 200K tokens' },
        { name: 'Safety Features', supported: true, description: 'Built-in safety measures' }
      ],
      pricing: {
        type: 'paid',
        paidPlans: ['Pay-per-use', 'Claude Pro ($20/month)']
      },
      limits: {
        requestsPerMinute: 50,
        tokensPerMinute: 40000
      },
      setupInstructions: 'Get your API key from https://console.anthropic.com/',
      websiteUrl: 'https://anthropic.com'
    };
  }
}
