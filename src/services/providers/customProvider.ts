// Custom Provider Implementation
import { 
  AIRequest, 
  AIResponse, 
  AIError, 
  CustomConfig,
  AIProviderCapabilities 
} from '@/types/aiProvider';

export class CustomProvider {
  async generateResponse(request: AIRequest, config: CustomConfig): Promise<AIResponse> {
    try {
      if (!config.customEndpoint) {
        throw new AIError({
          code: 'CUSTOM_NO_ENDPOINT',
          message: 'Custom endpoint is required for custom provider',
          provider: 'custom',
          retryable: false
        });
      }

      const requestFormat = config.requestFormat || 'openai';
      let requestBody: Record<string, unknown>;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.headers
      };

      // Add authorization header if API key is provided
      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      // Format request based on specified format
      if (requestFormat === 'openai') {
        requestBody = {
          model: config.modelName || 'custom-model',
          messages: [
            ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
            { role: 'user', content: request.prompt }
          ],
          temperature: request.temperature || config.temperature || 0.7,
          max_tokens: request.maxTokens || config.maxTokens || 2000,
          stream: false
        };
      } else {
        // Custom format - allow full customization
        requestBody = {
          prompt: request.prompt,
          system_prompt: request.systemPrompt,
          temperature: request.temperature || config.temperature || 0.7,
          max_tokens: request.maxTokens || config.maxTokens || 2000,
          model: config.modelName || 'custom-model',
          ...config.providerSettings
        };
      }

      const response = await fetch(config.customEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AIError({
          code: `CUSTOM_${response.status}`,
          message: errorData.error?.message || `Custom API error: ${response.status}`,
          provider: 'custom',
          retryable: response.status >= 500 || response.status === 429,
          details: errorData
        });
      }

      const data = await response.json();

      // Try to parse response in OpenAI format first
      if (data.choices && data.choices[0]) {
        const choice = data.choices[0];
        return {
          content: choice.message?.content || choice.text || '',
          tokensUsed: {
            input: data.usage?.prompt_tokens || 0,
            output: data.usage?.completion_tokens || 0,
            total: data.usage?.total_tokens || 0
          },
          model: data.model || config.modelName || 'custom-model',
          provider: 'custom',
          finishReason: choice.finish_reason || 'stop',
          metadata: {
            id: data.id,
            created: data.created,
            customResponse: data
          }
        };
      }

      // Try to parse as simple text response
      if (typeof data === 'string') {
        const estimatedTokens = Math.ceil(data.length / 4);
        return {
          content: data,
          tokensUsed: {
            input: Math.ceil(request.prompt.length / 4),
            output: estimatedTokens,
            total: Math.ceil(request.prompt.length / 4) + estimatedTokens
          },
          model: config.modelName || 'custom-model',
          provider: 'custom',
          finishReason: 'stop',
          metadata: { customResponse: data }
        };
      }

      // Try to extract content from various possible response formats
      const content = data.content || data.text || data.response || data.output || JSON.stringify(data);
      const estimatedTokens = Math.ceil(content.length / 4);

      return {
        content,
        tokensUsed: {
          input: Math.ceil(request.prompt.length / 4),
          output: estimatedTokens,
          total: Math.ceil(request.prompt.length / 4) + estimatedTokens
        },
        model: config.modelName || 'custom-model',
        provider: 'custom',
        finishReason: 'stop',
        metadata: { customResponse: data }
      };

    } catch (error: unknown) {
      if (error instanceof AIError) {
        throw error;
      }

      throw new AIError({
        code: 'CUSTOM_REQUEST_FAILED',
        message: (error as Error).message || 'Custom provider request failed',
        provider: 'custom',
        retryable: false,
        details: { originalError: error }
      });
    }
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      provider: 'custom',
      name: 'Custom Provider',
      description: 'Connect to your own AI endpoint or local model',
      models: [
        {
          id: 'custom-model',
          name: 'Custom Model',
          description: 'Your custom AI model',
          contextLength: 0, // Unknown
          inputCostPer1kTokens: 0, // User-defined
          outputCostPer1kTokens: 0, // User-defined
          isDefault: true
        }
      ],
      features: [
        { name: 'Text Generation', supported: true },
        { name: 'Code Generation', supported: true, description: 'Depends on your model' },
        { name: 'Function Calling', supported: false, description: 'Depends on your implementation' },
        { name: 'JSON Mode', supported: true, description: 'Depends on your model' },
        { name: 'Vision', supported: false, description: 'Depends on your model' },
        { name: 'Custom Format', supported: true, description: 'Full control over request/response format' }
      ],
      pricing: {
        type: 'free',
        freeQuota: 'Depends on your setup'
      },
      limits: {
        requestsPerMinute: 0, // User-defined
        tokensPerMinute: 0    // User-defined
      },
      setupInstructions: 'Provide your custom endpoint URL and configure request format',
      websiteUrl: '#'
    };
  }
}
