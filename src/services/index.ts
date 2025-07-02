/**
 * Services Barrel Export
 * Centralized export for all services
 */

// AI Services
export { aiProviderService } from './aiProviderService';
export { AIEngine } from './aiEngine';
export { UserAIPreferencesService } from './userAIPreferencesService';

// Core Services
export { FrameworkGeneratorService } from './frameworkGenerator';
export { EnhancedToolRecommenderService } from './enhancedToolRecommender';
export { MVPPromptTemplateService } from './mvpPromptTemplates';
export { mvpStudioAnalytics } from './mvpStudioAnalytics';
export { toolMatcher } from './toolMatcher';

// Security Services
export { encryptApiKey, decryptApiKey } from './encryptionService';
export { SecurityAuditService } from './securityAuditService';

// Provider Services
// export * from './providers'; // Uncomment when providers barrel export is created

// Service Types
export type {
  AIProvider,
  AIProviderConfig,
  AIRequest,
  AIResponse,
  UserAIPreferences,
  ConnectionStatus,
} from '../types/aiProvider';

export type {
  FrameworkGenerationRequest,
  GeneratedFramework,
  PageDefinition,
  TechStackRecommendation,
} from './frameworkGenerator';

export type {
  EnhancedRecommendation,
  CostAnalysis,
} from './enhancedToolRecommender';
