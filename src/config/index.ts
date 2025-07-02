/**
 * Application Configuration
 * Centralized configuration management with environment-specific settings
 */

// Environment variables with defaults
const env = {
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'Pitch Perfect Engine',
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  VITE_DATABASE_URL: import.meta.env.VITE_DATABASE_URL || '',
  VITE_ENCRYPTION_KEY: import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-change-in-production',
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
  VITE_ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID || '',
  VITE_FEATURE_FLAGS: import.meta.env.VITE_FEATURE_FLAGS || '',
} as const;

// Validate required environment variables
const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const;

const validateEnvironment = () => {
  const missing = requiredEnvVars.filter(key => !env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    if (env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
};

// Validate environment on module load
validateEnvironment();

// Application configuration
export const config = {
  // App metadata
  app: {
    name: env.VITE_APP_NAME,
    version: env.VITE_APP_VERSION,
    environment: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },

  // API configuration
  api: {
    baseUrl: env.VITE_API_BASE_URL,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Database configuration
  database: {
    url: env.VITE_DATABASE_URL,
    connectionTimeout: 5000,
    queryTimeout: 30000,
    maxConnections: 20,
    ssl: env.NODE_ENV === 'production',
  },

  // Supabase configuration
  supabase: {
    url: env.VITE_SUPABASE_URL,
    anonKey: env.VITE_SUPABASE_ANON_KEY,
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },

  // Security configuration
  security: {
    encryptionKey: env.VITE_ENCRYPTION_KEY,
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
    ...parseFeatureFlags(env.VITE_FEATURE_FLAGS),
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

  // Analytics configuration
  analytics: {
    enabled: env.NODE_ENV === 'production' && !!env.VITE_ANALYTICS_ID,
    id: env.VITE_ANALYTICS_ID,
    trackPageViews: true,
    trackUserInteractions: true,
    trackErrors: true,
  },

  // Error reporting configuration
  errorReporting: {
    enabled: env.NODE_ENV === 'production' && !!env.VITE_SENTRY_DSN,
    dsn: env.VITE_SENTRY_DSN,
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
  if (config.app.isProduction && config.security.encryptionKey === 'default-key-change-in-production') {
    errors.push('Encryption key must be changed in production');
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
