# Development Guide - Pitch Perfect Engine

## 🚀 Quick Start with the New Structure

### **Clean Imports**
```typescript
// UI Components
import { Button, Card, Input, Dialog } from '@/components/ui';

// Utilities
import { formatDate, isValidEmail, debounce } from '@/shared/utils';
import { useLocalStorage, useApi } from '@/shared/hooks';

// Constants & Config
import { ROUTES, API_CONFIG } from '@/shared/constants';
import { config } from '@/config';

// Types
import type { User, ApiResponse } from '@/shared/types';
```

### **Configuration Usage**
```typescript
import { config } from '@/config';

// Feature flags
if (config.features.aiTools) {
  // AI tools feature is enabled
}

// API configuration
const apiUrl = config.api.baseUrl;
const timeout = config.api.timeout;

// UI settings
const isMobile = window.innerWidth < config.ui.breakpoints.mobile;
```

### **Custom Hooks**
```typescript
import { useLocalStorage, useApi, useToggle } from '@/shared/hooks';

function MyComponent() {
  // Type-safe localStorage
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  
  // API calls with caching
  const { data, loading, error } = useApi(fetchUserData, { 
    immediate: true,
    cacheKey: 'user-data' 
  });
  
  // Simple state management
  const [isOpen, toggle] = useToggle(false);
  
  return (
    <div>
      <Button onClick={toggle}>
        {isOpen ? 'Close' : 'Open'}
      </Button>
    </div>
  );
}
```

### **Validation & Formatting**
```typescript
import { 
  isValidEmail, 
  formatDate, 
  formatCurrency,
  validateForm 
} from '@/shared/utils';

// Email validation
const email = 'user@example.com';
if (isValidEmail(email)) {
  // Valid email
}

// Date formatting
const date = new Date();
const formatted = formatDate(date, 'long'); // "January 15, 2024, 10:30 AM"

// Form validation
const { isValid, errors } = validateForm(formData, {
  email: [
    { type: 'required', message: 'Email is required' },
    { type: 'email', message: 'Invalid email format' }
  ],
  password: [
    { type: 'required', message: 'Password is required' },
    { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' }
  ]
});
```

### **Error Handling**
```typescript
import { ErrorBoundary } from '@/components/common';

function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}

// Custom error handling
import { useErrorHandler } from '@/components/common';

function MyComponent() {
  const handleError = useErrorHandler();
  
  const handleAsyncOperation = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      handleError(error);
    }
  };
}
```

### **Loading States**
```typescript
import { LoadingSpinner, PageLoader, InlineLoader } from '@/components/common';

// Full screen loading
<LoadingSpinner fullScreen text="Loading application..." />

// Page loading
<PageLoader text="Loading dashboard..." />

// Inline loading
<InlineLoader text="Saving..." />

// Button loading
<Button disabled={loading}>
  {loading && <ButtonLoader />}
  Save Changes
</Button>
```

## 🏗️ Creating New Components

### **Feature Component**
```typescript
// src/components/features/my-feature/MyComponent.tsx
import React from 'react';
import { Button, Card } from '@/components/ui';
import { formatDate } from '@/shared/utils';
import { config } from '@/config';
import type { ComponentProps } from '@/shared/types';

interface MyComponentProps extends ComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onAction,
  className,
  children,
  testId
}) => {
  return (
    <Card className={className} data-testid={testId}>
      <h2>{title}</h2>
      {children}
      <Button onClick={onAction}>
        Action
      </Button>
    </Card>
  );
};

// src/components/features/my-feature/index.ts
export { MyComponent } from './MyComponent';
```

### **Custom Hook**
```typescript
// src/shared/hooks/useMyHook.ts
import { useState, useEffect } from 'react';
import { config } from '@/config';

export function useMyHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Hook logic
  }, []);
  
  return { value, setValue, loading };
}

// Add to src/shared/hooks/index.ts
export { useMyHook } from './useMyHook';
```

### **Service**
```typescript
// src/services/myService.ts
import { config } from '@/config';
import type { ApiResponse } from '@/shared/types';

export class MyService {
  private baseUrl = config.api.baseUrl;
  
  async getData(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/data`);
      const data = await response.json();
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const myService = new MyService();

// Add to src/services/index.ts
export { myService } from './myService';
```

## 🧪 Testing Patterns

### **Component Testing**
```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/features/my-feature';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(
      <MyComponent 
        title="Test Title" 
        onAction={() => {}} 
        testId="my-component"
      />
    );
    
    expect(screen.getByTestId('my-component')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

### **Hook Testing**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '@/shared/hooks';

describe('useMyHook', () => {
  it('works correctly', () => {
    const { result } = renderHook(() => useMyHook('initial'));
    
    expect(result.current.value).toBe('initial');
    
    act(() => {
      result.current.setValue('updated');
    });
    
    expect(result.current.value).toBe('updated');
  });
});
```

## 📝 Best Practices

### **1. Always Use Barrel Exports**
```typescript
// ✅ Good
import { Button, Card, Input } from '@/components/ui';

// ❌ Avoid
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

### **2. Use Shared Types**
```typescript
// ✅ Good
import type { ComponentProps, ApiResponse } from '@/shared/types';

interface MyProps extends ComponentProps {
  data: ApiResponse<User>;
}
```

### **3. Leverage Configuration**
```typescript
// ✅ Good
import { config } from '@/config';
const isEnabled = config.features.myFeature;

// ❌ Avoid
const isEnabled = process.env.VITE_MY_FEATURE === 'true';
```

### **4. Use Error Boundaries**
```typescript
// ✅ Good
<ErrorBoundary>
  <RiskyComponent />
</ErrorBoundary>
```

### **5. Implement Loading States**
```typescript
// ✅ Good
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <Content data={data} />;
```

This guide provides everything you need to work effectively with the newly organized codebase! 🎉
