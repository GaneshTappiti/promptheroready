// Gemini Provider Implementation
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  AIRequest, 
  AIResponse, 
  AIError, 
  GeminiConfig,
  AIProviderCapabilities 
} from '@/types/aiProvider';

export class GeminiProvider {
  async generateResponse(request: AIRequest, config: GeminiConfig): Promise<AIResponse> {
    try {
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ 
        model: config.modelName || 'gemini-2.0-flash',
        safetySettings: config.safetySettings as any
      });

      // Combine system prompt and user prompt for Gemini
      const fullPrompt = request.systemPrompt 
        ? `${request.systemPrompt}\n\nUser: ${request.prompt}`
        : request.prompt;

      const result = await model.generateContent({
        contents: [{
          role: "user",
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: request.temperature || config.temperature || 0.7,
          maxOutputTokens: request.maxTokens || config.maxTokens || 2000,
        }
      });

      const response = await result.response;
      const text = response.text();

      // Gemini doesn't provide detailed token usage in the free tier
      // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
      const estimatedInputTokens = Math.ceil(fullPrompt.length / 4);
      const estimatedOutputTokens = Math.ceil(text.length / 4);

      return {
        content: text,
        tokensUsed: {
          input: estimatedInputTokens,
          output: estimatedOutputTokens,
          total: estimatedInputTokens + estimatedOutputTokens
        },
        model: config.modelName || 'gemini-2.0-flash',
        provider: 'gemini',
        finishReason: response.candidates?.[0]?.finishReason || 'stop',
        metadata: {
          safetyRatings: response.candidates?.[0]?.safetyRatings,
          citationMetadata: response.candidates?.[0]?.citationMetadata
        }
      };
    } catch (error: unknown) {
      // Handle Gemini-specific errors
      let errorCode = 'GEMINI_REQUEST_FAILED';
      let retryable = false;

      if ((error as any)?.message?.includes('API_KEY_INVALID')) {
        errorCode = 'GEMINI_INVALID_API_KEY';
      } else if ((error as any)?.message?.includes('QUOTA_EXCEEDED')) {
        errorCode = 'GEMINI_QUOTA_EXCEEDED';
        retryable = true;
      } else if ((error as any)?.message?.includes('RATE_LIMIT_EXCEEDED')) {
        errorCode = 'GEMINI_RATE_LIMIT';
        retryable = true;
      }

      throw new AIError({
        code: errorCode,
        message: (error as any)?.message || 'Gemini request failed',
        provider: 'gemini',
        retryable,
        details: { originalError: error }
      });
    }
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      provider: 'gemini',
      name: 'Google Gemini',
      description: 'Google\'s advanced AI model with multimodal capabilities',
      models: [
        {
          id: 'gemini-2.0-flash',
          name: 'Gemini 2.0 Flash',
          description: 'Latest and fastest Gemini model',
          contextLength: 1000000,
          inputCostPer1kTokens: 0.00015,
          outputCostPer1kTokens: 0.0006,
          isDefault: true
        },
        {
          id: 'gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          description: 'Most capable model with large context window',
          contextLength: 2000000,
          inputCostPer1kTokens: 0.00125,
          outputCostPer1kTokens: 0.005
        },
        {
          id: 'gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
          description: 'Fast and efficient for high-frequency tasks',
          contextLength: 1000000,
          inputCostPer1kTokens: 0.000075,
          outputCostPer1kTokens: 0.0003
        }
      ],
      features: [
        { name: 'Text Generation', supported: true },
        { name: 'Code Generation', supported: true },
        { name: 'Function Calling', supported: true },
        { name: 'JSON Mode', supported: true },
        { name: 'Vision', supported: true },
        { name: 'Audio Processing', supported: true },
        { name: 'Long Context', supported: true, description: 'Up to 2M tokens' }
      ],
      pricing: {
        type: 'freemium',
        freeQuota: '15 requests per minute',
        paidPlans: ['Pay-per-use']
      },
      limits: {
        requestsPerMinute: 15, // Free tier
        requestsPerDay: 1500   // Free tier
      },
      setupInstructions: 'Get your API key from https://aistudio.google.com/app/apikey',
      websiteUrl: 'https://gemini.google.com'
    };
  }
}
