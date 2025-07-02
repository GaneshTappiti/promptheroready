# Codebase Structure Documentation

## Overview

This document outlines the improved, organized structure of the Pitch Perfect Engine codebase. The structure follows modern React/TypeScript best practices with clear separation of concerns, reusable components, and maintainable architecture.

## Directory Structure

```
src/
├── shared/                     # Shared utilities, types, and constants
│   ├── constants/             # Application constants
│   ├── types/                 # Shared TypeScript types
│   ├── utils/                 # Utility functions
│   └── hooks/                 # Custom React hooks
├── config/                    # Configuration management
├── components/                # React components
│   ├── ui/                   # Base UI components (buttons, inputs, etc.)
│   ├── layout/               # Layout components (navbar, sidebar, etc.)
│   ├── features/             # Feature-specific components
│   │   ├── ideaforge/        # IdeaForge feature components
│   │   ├── mvp-studio/       # MVP Studio feature components
│   │   └── ...               # Other feature directories
│   └── common/               # Common components (ErrorBoundary, etc.)
├── pages/                     # Page components
├── services/                  # Business logic and API services
│   └── providers/            # AI provider implementations
├── contexts/                  # React contexts
├── data/                     # Static data and mock data
├── lib/                      # Third-party library configurations
├── types/                    # TypeScript type definitions
├── utils/                    # Legacy utility functions (to be migrated)
├── hooks/                    # Legacy hooks (to be migrated)
└── tests/                    # Test files
```

## Key Improvements

### 1. Shared Directory Structure

#### `src/shared/constants/index.ts`
- Centralized application constants
- API configuration
- UI constants
- Route paths
- Error messages
- Feature flags

#### `src/shared/types/index.ts`
- Common TypeScript interfaces
- Base entity types
- API response types
- UI component props
- Utility types

#### `src/shared/utils/`
- **validation.ts**: Form validation, input sanitization
- **formatting.ts**: Date, number, text formatting utilities
- **storage.ts**: localStorage/sessionStorage utilities
- **index.ts**: Barrel export with additional utility functions

#### `src/shared/hooks/`
- **useLocalStorage.ts**: Type-safe localStorage hook
- **useApi.ts**: API call management with caching
- **index.ts**: Collection of utility hooks

### 2. Configuration Management

#### `src/config/index.ts`
- Environment-specific configuration
- Feature flags
- API endpoints
- Security settings
- Performance settings
- Validation and error handling

### 3. Component Organization

#### UI Components (`src/components/ui/`)
- Base, reusable UI components
- Consistent styling and behavior
- Barrel exports for easy importing

#### Layout Components (`src/components/layout/`)
- Page layout components
- Navigation components
- Landing page sections

#### Feature Components (`src/components/features/`)
- Feature-specific components organized by domain
- Each feature has its own directory with barrel exports

#### Common Components (`src/components/common/`)
- **ErrorBoundary**: Enhanced error handling with reporting
- **LoadingSpinner**: Reusable loading states

### 4. Services Architecture

#### `src/services/index.ts`
- Centralized service exports
- Business logic separation
- API service management

### 5. Improved App.tsx

- Lazy loading for better performance
- Proper error boundaries
- Optimized QueryClient configuration
- Suspense for loading states
- Clean provider hierarchy

## Best Practices Implemented

### 1. Barrel Exports
- Each directory has an `index.ts` file for clean imports
- Reduces import complexity
- Makes refactoring easier

### 2. Type Safety
- Comprehensive TypeScript types
- Shared interfaces for consistency
- Proper error handling types

### 3. Performance Optimizations
- Lazy loading of page components
- Optimized QueryClient configuration
- Proper caching strategies

### 4. Error Handling
- Comprehensive error boundaries
- Development vs production error displays
- Error reporting integration ready

### 5. Configuration Management
- Environment-specific settings
- Feature flags for controlled rollouts
- Validation for required configurations

## Usage Examples

### Importing Components
```typescript
// Before
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// After (with barrel exports)
import { Button, Card } from '@/components/ui';
```

### Using Shared Utilities
```typescript
import { formatDate, validateEmail, localStorage } from '@/shared/utils';
import { API_CONFIG, ROUTES } from '@/shared/constants';
import { ApiResponse, User } from '@/shared/types';
```

### Configuration Usage
```typescript
import { config } from '@/config';

// Access specific configuration
const apiUrl = config.api.baseUrl;
const isFeatureEnabled = config.features.aiTools;
```

### Custom Hooks
```typescript
import { useLocalStorage, useApi, useToggle } from '@/shared/hooks';

const [theme, setTheme] = useLocalStorage('theme', 'dark');
const { data, loading, error } = useApi(fetchUserData, { immediate: true });
const [isOpen, toggle] = useToggle(false);
```

## Migration Notes

### Existing Code
- Legacy utilities in `src/utils/` and `src/hooks/` are preserved
- Gradual migration to shared directory structure
- Backward compatibility maintained

### Future Improvements
- Complete migration of legacy utilities
- Enhanced testing structure
- Documentation generation
- Performance monitoring integration

## Development Guidelines

### 1. Component Creation
- Use shared types for props
- Implement proper error boundaries
- Follow naming conventions
- Add barrel exports

### 2. Service Development
- Use shared API response types
- Implement proper error handling
- Add caching where appropriate
- Follow service patterns

### 3. Configuration Changes
- Update config files instead of hardcoding
- Use feature flags for new features
- Validate configuration changes

### 4. Testing
- Test shared utilities thoroughly
- Mock services properly
- Use shared test utilities

This improved structure provides a solid foundation for scalable, maintainable code while preserving existing functionality and enabling smooth migration.
