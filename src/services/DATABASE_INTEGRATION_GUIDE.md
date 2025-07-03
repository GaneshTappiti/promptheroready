# 🔗 Database Integration Guide

This guide explains how to integrate the enhanced database service into your PromptHeroReady application components.

## 📋 Overview

The enhanced database service provides:
- ✅ **Type-safe operations** with TypeScript support
- ✅ **Automatic error handling** with retry logic
- ✅ **Performance monitoring** and logging
- ✅ **Intelligent caching** for better performance
- ✅ **Connection health monitoring**
- ✅ **Batch operations** for efficiency

## 🚀 Quick Start

### 1. Import the Database Service

```typescript
// Import the centralized service
import databaseService from '@/services/database';

// Or import specific helpers
import { workspaceHelpers, ideaVaultHelpers } from '@/services/database';
```

### 2. Basic Usage in Components

```typescript
import React, { useState, useEffect } from 'react';
import databaseService from '@/services/database';

const WorkspacePage: React.FC = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        const result = await databaseService.workspace.getDashboardStats('user-id');
        
        if (result.error) {
          setError(result.error.message);
        } else {
          setStats(result.data);
        }
      } catch (err) {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Active Ideas: {stats?.activeIdeas}</p>
      <p>Total Prompts: {stats?.totalPrompts}</p>
    </div>
  );
};
```

## 🔧 Advanced Usage Patterns

### 1. Error Handling with Performance Metrics

```typescript
const handleCreateIdea = async (ideaData: any) => {
  const result = await databaseService.ideaVault.createIdea(ideaData);
  
  if (result.error) {
    console.error('Failed to create idea:', result.error);
    // Show user-friendly error message
    toast.error('Failed to create idea. Please try again.');
    return;
  }
  
  // Log performance metrics in development
  if (import.meta.env.DEV && result.performance) {
    console.log(`✅ Idea created in ${result.performance.duration.toFixed(2)}ms`);
  }
  
  // Success handling
  toast.success('Idea created successfully!');
  return result.data;
};
```

### 2. Using Cached Operations

```typescript
// Cached operations automatically handle caching
const loadUserStats = async (userId: string) => {
  // This will be cached for 1 minute
  const result = await databaseService.workspace.getDashboardStats(userId);
  return result.data;
};

// Force refresh by clearing cache
const refreshStats = async (userId: string) => {
  databaseService.clearAllCaches();
  return await loadUserStats(userId);
};
```

### 3. Batch Operations

```typescript
const loadMultipleIdeas = async (ideaIds: string[]) => {
  const operations = ideaIds.map(id => 
    () => databaseService.ideaVault.getIdea(id)
  );
  
  // Execute with max 3 concurrent operations
  const results = await databaseService.batchOperation(operations, 3);
  return results.filter(result => !result.error);
};
```

### 4. Connection Health Monitoring

```typescript
const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState('checking');
  
  useEffect(() => {
    const checkConnection = async () => {
      const health = await databaseService.healthCheck();
      setStatus(health.status);
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={`status-indicator ${status}`}>
      Database: {status}
    </div>
  );
};
```

## 📊 Available Operations

### Workspace Operations
```typescript
// Get dashboard statistics (cached for 1 minute)
await databaseService.workspace.getDashboardStats(userId);

// Get recent activity (cached for 30 seconds)
await databaseService.workspace.getRecentActivity(userId, limit);

// Get usage tracking (cached for 5 minutes)
await databaseService.workspace.getUsageTracking(userId);
```

### Idea Vault Operations
```typescript
// Get ideas with filtering
await databaseService.ideaVault.getIdeas(userId, {
  status: 'active',
  category: 'tech',
  search: 'AI',
  limit: 10,
  offset: 0
});

// Create new idea (clears related caches)
await databaseService.ideaVault.createIdea(ideaData);

// Update idea (clears related caches)
await databaseService.ideaVault.updateIdea(ideaId, updates);

// Delete idea (clears related caches)
await databaseService.ideaVault.deleteIdea(ideaId);

// Get categories (cached for 10 minutes)
await databaseService.ideaVault.getIdeaCategories(userId);
```

### Other Operations
```typescript
// IdeaForge operations
databaseService.ideaForge.getWikiPages(ideaId);
databaseService.ideaForge.createJourneyEntry(entryData);

// MVP Studio operations
databaseService.mvpStudio.getMVPs(userId);
databaseService.mvpStudio.generatePrompt(promptData);

// Team Space operations
databaseService.teamSpace.getTeams(userId);
databaseService.teamSpace.sendMessage(messageData);

// And many more...
```

## 🎯 Best Practices

### 1. Error Handling
```typescript
// Always handle errors gracefully
const result = await databaseService.someOperation();
if (result.error) {
  // Log for debugging
  console.error('Operation failed:', result.error);
  
  // Show user-friendly message
  toast.error('Something went wrong. Please try again.');
  
  // Return early or handle appropriately
  return;
}

// Use the data
const data = result.data;
```

### 2. Loading States
```typescript
const [loading, setLoading] = useState(false);

const handleOperation = async () => {
  setLoading(true);
  try {
    const result = await databaseService.someOperation();
    // Handle result
  } finally {
    setLoading(false);
  }
};
```

### 3. Cache Management
```typescript
// Clear specific caches after mutations
const handleUpdate = async () => {
  await databaseService.ideaVault.updateIdea(id, updates);
  // Caches are automatically cleared for related operations
};

// Manual cache clearing when needed
const forceRefresh = () => {
  databaseService.clearAllCaches();
  // Reload data
};
```

### 4. Performance Monitoring
```typescript
// Monitor performance in development
if (import.meta.env.DEV) {
  const result = await databaseService.someOperation();
  if (result.performance) {
    console.log(`Operation took ${result.performance.duration}ms`);
  }
}
```

## 🔄 Migration from Old Helpers

### Before (Old Way)
```typescript
import { supabaseHelpers } from '@/lib/supabase';

const { data, error } = await supabaseHelpers.getIdeas();
if (error) {
  console.error(error);
  return;
}
// Use data
```

### After (New Way)
```typescript
import databaseService from '@/services/database';

const result = await databaseService.ideaVault.getIdeas(userId);
if (result.error) {
  console.error(result.error);
  return;
}
// Use result.data with performance metrics
```

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Errors**
   ```typescript
   // Check connection status
   const status = await databaseService.getConnectionStatus();
   if (status !== 'connected') {
     // Handle offline state
   }
   ```

2. **Cache Issues**
   ```typescript
   // Clear caches if data seems stale
   databaseService.clearAllCaches();
   ```

3. **Performance Issues**
   ```typescript
   // Use batch operations for multiple requests
   const results = await databaseService.batchOperation(operations, 3);
   ```

### Debug Mode
```typescript
// Enable debug logging in development
if (import.meta.env.DEV) {
  // Performance metrics are automatically logged
  // Connection status changes are logged
  // Cache hits/misses are logged
}
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)
- [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)

---

**Remember**: Always handle errors gracefully, use loading states, and monitor performance in development! 🚀
