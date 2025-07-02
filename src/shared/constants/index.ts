/**
 * Application Constants
 * Centralized location for all application constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Database Configuration
export const DB_CONFIG = {
  CONNECTION_TIMEOUT: 5000,
  QUERY_TIMEOUT: 30000,
  MAX_CONNECTIONS: 20,
} as const;

// UI Constants
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 256,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
} as const;

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebar_state',
  RECENT_IDEAS: 'recent_ideas',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  WORKSPACE: '/workspace',
  IDEA_FORGE: '/workspace/idea-forge',
  MVP_STUDIO: '/workspace/mvp-studio',
  BLUEPRINT_ZONE: '/workspace/blueprint-zone',
  DOCS_DECKS: '/workspace/docs-decks',
  IDEA_VAULT: '/workspace/idea-vault',
  TEAM_SPACE: '/workspace/team-space',
  INVESTOR_RADAR: '/workspace/investor-radar',
  AI_TOOLS: '/workspace/ai-tools',
  SETTINGS: '/workspace/settings',
} as const;

// AI Provider Constants
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
  DEEPSEEK: 'deepseek',
  CLAUDE: 'claude',
  MISTRAL: 'mistral',
  CUSTOM: 'custom',
} as const;

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  MAX_FILES: 5,
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  IDEA_TITLE_MAX_LENGTH: 100,
  IDEA_DESCRIPTION_MAX_LENGTH: 1000,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Successfully saved!',
  UPDATED: 'Successfully updated!',
  DELETED: 'Successfully deleted!',
  CREATED: 'Successfully created!',
  UPLOADED: 'Successfully uploaded!',
} as const;
