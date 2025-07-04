// AI Provider Types and Interfaces

export type AIProvider = 'openai' | 'google' | 'gemini' | 'anthropic' | 'claude' | 'deepseek' | 'mistral' | 'custom' | 'none';

export type ConnectionStatus = 'untested' | 'connected' | 'error' | 'quota_exceeded';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  modelName?: string;
  customEndpoint?: string;
  temperature?: number;
  maxTokens?: number;
  providerSettings?: Record<string, unknown>;
}

export interface UserAIPreferences {
  id: string;
  userId: string;
  provider: AIProvider;
  apiKeyEncrypted?: string;
  modelName?: string;
  customEndpoint?: string;
  temperature: number;
  maxTokens: number;
  providerSettings: Record<string, unknown>;
  totalRequests: number;
  totalTokensUsed: number;
  lastUsedAt?: string;
  connectionStatus: ConnectionStatus;
  lastError?: string;
  lastTestAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIProviderCapabilities {
  provider: AIProvider;
  name: string;
  description: string;
  models: AIModel[];
  features: AIFeature[];
  pricing: PricingInfo;
  limits: UsageLimits;
  setupInstructions: string;
  websiteUrl: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
  isDefault?: boolean;
}

export interface AIFeature {
  name: string;
  supported: boolean;
  description?: string;
}

export interface PricingInfo {
  type: 'free' | 'freemium' | 'paid';
  freeQuota?: string;
  paidPlans?: string[];
}

export interface UsageLimits {
  requestsPerMinute?: number;
  requestsPerDay?: number;
  tokensPerMinute?: number;
  tokensPerDay?: number;
}

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AIResponse {
  content: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  model: string;
  provider: AIProvider;
  finishReason: string;
  metadata?: Record<string, any>;
}

export interface AIErrorData {
  code: string;
  message: string;
  provider: AIProvider;
  retryable: boolean;
  details?: Record<string, any>;
}

export class AIError extends Error {
  code: string;
  provider: AIProvider;
  retryable: boolean;
  details?: Record<string, any>;

  constructor(data: AIErrorData) {
    super(data.message);
    this.name = 'AIError';
    this.code = data.code;
    this.provider = data.provider;
    this.retryable = data.retryable;
    this.details = data.details;
  }
}

// Provider-specific configuration interfaces
export interface OpenAIConfig extends AIProviderConfig {
  provider: 'openai';
  organization?: string;
  baseURL?: string;
}

export interface GeminiConfig extends AIProviderConfig {
  provider: 'gemini';
  safetySettings?: unknown[];
}

export interface ClaudeConfig extends AIProviderConfig {
  provider: 'claude';
  version?: string;
}

export interface DeepSeekConfig extends AIProviderConfig {
  provider: 'deepseek';
  baseURL?: string;
}

export interface MistralConfig extends AIProviderConfig {
  provider: 'mistral';
  endpoint?: string;
}

export interface CustomConfig extends AIProviderConfig {
  provider: 'custom';
  customEndpoint: string;
  headers?: Record<string, string>;
  requestFormat?: 'openai' | 'custom';
}

// Union type for all provider configs
export type ProviderConfig = OpenAIConfig | GeminiConfig | ClaudeConfig | DeepSeekConfig | MistralConfig | CustomConfig;
