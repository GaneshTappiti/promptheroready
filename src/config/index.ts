/**
 * Application Configuration
 * Centralized configuration management with environment-specific settings
 */

// Helper function to get environment variable with fallback
const getEnvVar = (reactKey: string, viteKey: string, defaultValue: string = '') => {
  return process.env[reactKey] || process.env[viteKey] || defaultValue;
};

// Environment variables with defaults - supporting both REACT_APP_ and VITE_ prefixes
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_NAME: getEnvVar('REACT_APP_NAME', 'VITE_APP_NAME', 'Pitch Perfect Engine'),
  APP_VERSION: getEnvVar('REACT_APP_VERSION', 'VITE_APP_VERSION', '1.0.0'),
  APP_ENVIRONMENT: getEnvVar('REACT_APP_ENVIRONMENT', 'VITE_APP_ENVIRONMENT', 'development'),
  API_BASE_URL: getEnvVar('REACT_APP_API_BASE_URL', 'VITE_API_BASE_URL', 'http://localhost:3000'),
  API_TIMEOUT: getEnvVar('REACT_APP_API_TIMEOUT', 'VITE_API_TIMEOUT', '30000'),
  SUPABASE_URL: getEnvVar('REACT_APP_SUPABASE_URL', 'VITE_SUPABASE_URL', ''),
  SUPABASE_ANON_KEY: getEnvVar('REACT_APP_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY', ''),
  DATABASE_URL: getEnvVar('REACT_APP_DATABASE_URL', 'VITE_DATABASE_URL', ''),
  ENCRYPTION_KEY: getEnvVar('REACT_APP_ENCRYPTION_KEY', 'VITE_ENCRYPTION_KEY', ''),
  SENTRY_DSN: getEnvVar('REACT_APP_SENTRY_DSN', 'VITE_SENTRY_DSN', ''),
  ANALYTICS_ID: getEnvVar('REACT_APP_ANALYTICS_ID', 'VITE_ANALYTICS_ID', ''),
  GOOGLE_ANALYTICS_ID: getEnvVar('REACT_APP_GOOGLE_ANALYTICS_ID', 'VITE_GOOGLE_ANALYTICS_ID', ''),
  FEATURE_FLAGS: getEnvVar('REACT_APP_FEATURE_FLAGS', 'VITE_FEATURE_FLAGS', ''),
  ENABLE_ANALYTICS: getEnvVar('REACT_APP_ENABLE_ANALYTICS', 'VITE_ENABLE_ANALYTICS', 'true'),
  ENABLE_ERROR_REPORTING: getEnvVar('REACT_APP_ENABLE_ERROR_REPORTING', 'VITE_ENABLE_ERROR_REPORTING', 'true'),
  ENABLE_PERFORMANCE_MONITORING: getEnvVar('REACT_APP_ENABLE_PERFORMANCE_MONITORING', 'VITE_ENABLE_PERFORMANCE_MONITORING', 'true'),
  ENABLE_PWA: getEnvVar('REACT_APP_ENABLE_PWA', 'VITE_ENABLE_PWA', 'true'),
  ENABLE_OFFLINE_MODE: getEnvVar('REACT_APP_ENABLE_OFFLINE_MODE', 'VITE_ENABLE_OFFLINE_MODE', 'false'),
  MOBILE_OPTIMIZATIONS: getEnvVar('REACT_APP_MOBILE_OPTIMIZATIONS', 'VITE_MOBILE_OPTIMIZATIONS', 'true'),
  // AI Provider Keys
  OPENAI_API_KEY: getEnvVar('REACT_APP_OPENAI_API_KEY', 'VITE_OPENAI_API_KEY', ''),
  GEMINI_API_KEY: getEnvVar('REACT_APP_GEMINI_API_KEY', 'VITE_GEMINI_API_KEY', ''),
  CLAUDE_API_KEY: getEnvVar('REACT_APP_CLAUDE_API_KEY', 'VITE_CLAUDE_API_KEY', ''),
  ANTHROPIC_API_KEY: getEnvVar('REACT_APP_ANTHROPIC_API_KEY', 'VITE_ANTHROPIC_API_KEY', ''),
  DEEPSEEK_API_KEY: getEnvVar('REACT_APP_DEEPSEEK_API_KEY', 'VITE_DEEPSEEK_API_KEY', ''),
} as const;

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const;

const validateEnvironment = () => {
  try {
    const missing = requiredEnvVars.filter(key => !env[key]);

    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:', missing);
      if (env.NODE_ENV === 'production') {
        console.error('🔥 Production deployment missing critical environment variables!');
        // Don't throw in production to prevent complete app failure
        // throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
      }
    } else {
      console.log('✅ All required environment variables are present');
    }
  } catch (error) {
    console.error('🔥 Error validating environment:', error);
  }
};

// Validate environment on module load
validateEnvironment();

// Application configuration
export const config = {
  // App metadata
  app: {
    name: env.APP_NAME,
    version: env.APP_VERSION,
    environment: env.APP_ENVIRONMENT,
    nodeEnv: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },

  // API configuration
  api: {
    baseUrl: env.API_BASE_URL,
    timeout: parseInt(env.API_TIMEOUT) || 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Database configuration
  database: {
    url: env.DATABASE_URL,
    connectionTimeout: 5000,
    queryTimeout: 30000,
    maxConnections: 20,
    ssl: env.NODE_ENV === 'production',
  },

  // Supabase configuration
  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },

  // Security configuration
  security: {
    encryptionKey: env.ENCRYPTION_KEY,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },

  // UI configuration
  ui: {
    theme: {
      default: 'dark',
      storageKey: 'theme-preference',
    },
    sidebar: {
      defaultCollapsed: false,
      storageKey: 'sidebar-collapsed',
    },
    animations: {
      enabled: true,
      duration: {
        fast: 150,
        normal: 300,
        slow: 500,
      },
    },
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1280,
      wide: 1536,
    },
  },

  // Feature flags
  features: {
    aiTools: true,
    mvpStudio: true,
    ideaForge: true,
    blueprintZone: true,
    docsDecks: true,
    ideaVault: true,
    teamSpace: true,
    investorRadar: true,
    analytics: env.NODE_ENV === 'production',
    debugging: env.NODE_ENV === 'development',
    betaFeatures: env.NODE_ENV !== 'production',
    ...parseFeatureFlags(env.FEATURE_FLAGS),
  },

  // File upload configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/json',
    ],
    maxFiles: 5,
  },

  // Cache configuration
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 100, // Max number of cached items
    storage: 'sessionStorage' as 'localStorage' | 'sessionStorage',
  },

  // Analytics configuration (legacy)
  analyticsLegacy: {
    enabled: env.NODE_ENV === 'production' && !!env.ANALYTICS_ID,
    id: env.ANALYTICS_ID,
    trackPageViews: true,
    trackUserInteractions: true,
    trackErrors: true,
  },

  // Error reporting configuration (legacy)
  errorReportingLegacy: {
    enabled: env.NODE_ENV === 'production' && !!env.SENTRY_DSN,
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    sampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
  },

  // AI provider configuration
  ai: {
    defaultProvider: 'openai',
    timeout: 60000, // 60 seconds
    maxRetries: 3,
    providers: {
      openai: {
        baseUrl: 'https://api.openai.com/v1',
        models: ['gpt-4', 'gpt-3.5-turbo'],
        defaultModel: 'gpt-4',
      },
      gemini: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        models: ['gemini-pro', 'gemini-pro-vision'],
        defaultModel: 'gemini-pro',
      },
      claude: {
        baseUrl: 'https://api.anthropic.com/v1',
        models: ['claude-3-opus', 'claude-3-sonnet'],
        defaultModel: 'claude-3-sonnet',
      },
    },
  },

  // Mobile & PWA configuration
  mobile: {
    optimizations: env.MOBILE_OPTIMIZATIONS === 'true',
    touchTargetSize: 44, // Minimum touch target size in pixels
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1280,
      wide: 1536,
    },
    gestures: {
      swipeThreshold: 50,
      longPressDelay: 500,
      doubleTapDelay: 300,
    },
    performance: {
      lazyLoadImages: true,
      prefetchCritical: true,
      bundleSplitting: true,
    },
  },

  // PWA configuration
  pwa: {
    enabled: env.ENABLE_PWA === 'true',
    offlineMode: env.ENABLE_OFFLINE_MODE === 'true',
    cacheStrategy: 'networkFirst',
    updatePrompt: true,
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
    },
  },

  // Analytics configuration
  analytics: {
    enabled: env.ENABLE_ANALYTICS === 'true',
    googleAnalyticsId: env.GOOGLE_ANALYTICS_ID,
    trackPageViews: true,
    trackUserInteractions: true,
    trackPerformance: env.ENABLE_PERFORMANCE_MONITORING === 'true',
  },

  // Error reporting configuration
  errorReporting: {
    enabled: env.ENABLE_ERROR_REPORTING === 'true',
    sentryDsn: env.SENTRY_DSN,
    environment: env.APP_ENVIRONMENT,
    sampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend: (event: unknown) => {
      // Filter out sensitive information
      if ((event as any)?.exception) {
        const error = (event as any)?.exception?.values?.[0];
        if (error?.value?.includes('API_KEY') || error?.value?.includes('password')) {
          return null; // Don't send sensitive errors
        }
      }
      return event;
    },
  },

  // AI Provider configuration
  aiProviders: {
    openai: {
      apiKey: env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com/v1',
      models: ['gpt-4', 'gpt-3.5-turbo'],
      defaultModel: 'gpt-3.5-turbo',
    },
    gemini: {
      apiKey: env.GEMINI_API_KEY,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      models: ['gemini-pro', 'gemini-pro-vision'],
      defaultModel: 'gemini-pro',
    },
    claude: {
      apiKey: env.CLAUDE_API_KEY || env.ANTHROPIC_API_KEY,
      baseUrl: 'https://api.anthropic.com/v1',
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      defaultModel: 'claude-3-sonnet',
    },
    deepseek: {
      apiKey: env.DEEPSEEK_API_KEY,
      baseUrl: 'https://api.deepseek.com/v1',
      models: ['deepseek-chat', 'deepseek-coder'],
      defaultModel: 'deepseek-chat',
    },
  },

  // Logging configuration
  logging: {
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    enableConsole: env.NODE_ENV === 'development',
    enableRemote: env.NODE_ENV === 'production',
    maxLogSize: 1000, // Max number of logs to keep in memory
  },

  // Performance configuration
  performance: {
    enableMetrics: env.NODE_ENV === 'production',
    bundleAnalysis: env.NODE_ENV === 'development',
    lazyLoading: true,
    imageOptimization: true,
  },
} as const;

// Helper function to parse feature flags from environment
function parseFeatureFlags(flagsString: string): Record<string, boolean> {
  if (!flagsString) return {};
  
  try {
    return flagsString.split(',').reduce((flags, flag) => {
      const [key, value] = flag.split('=');
      if (key && value !== undefined) {
        flags[key.trim()] = value.trim().toLowerCase() === 'true';
      }
      return flags;
    }, {} as Record<string, boolean>);
  } catch (error) {
    console.warn('Failed to parse feature flags:', error);
    return {};
  }
}

// Configuration validation
export const validateConfig = () => {
  const errors: string[] = [];

  // Validate Supabase configuration
  if (!config.supabase.url) {
    errors.push('Supabase URL is required');
  }
  if (!config.supabase.anonKey) {
    errors.push('Supabase anonymous key is required');
  }

  // Validate encryption key in production
  if (config.app.isProduction && !config.security.encryptionKey) {
    errors.push('Encryption key is required in production');
  }

  if (errors.length > 0) {
    console.error('Configuration validation errors:', errors);
    if (config.app.isProduction) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }

  return errors.length === 0;
};

// Validate configuration on module load
validateConfig();

// Export individual configuration sections for convenience
export const {
  app,
  api,
  database,
  supabase,
  security,
  ui,
  features,
  upload,
  cache,
  analytics,
  errorReporting,
  ai,
  logging,
  performance,
} = config;

// Export environment variables (read-only)
export { env };

// Default export
export default config;
