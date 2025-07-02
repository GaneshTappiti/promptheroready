/**
 * Main Application Barrel Export
 * Centralized export for the entire application
 */

// Main App component
export { default as App } from './App';

// Configuration
export { default as config } from './config';

// Shared utilities and types (selective exports to avoid conflicts)
export { ROUTES, API_CONFIG, UI_CONFIG } from './shared/constants';
export type { User, ApiResponse, ComponentProps } from './shared/types';
export { formatDate, isValidEmail, debounce, generateId } from './shared/utils';
export { useLocalStorage, useApi, useToggle } from './shared/hooks';

// Components (selective exports)
export { Button, Input, Card } from './components/ui';

// Services (selective exports)
export { aiProviderService, FrameworkGeneratorService } from './services';

// Contexts
export { AuthProvider, useAuth } from './contexts/AuthContext';
