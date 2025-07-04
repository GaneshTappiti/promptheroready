// =====================================================
// CENTRALIZED DATABASE SERVICE
// =====================================================
// This service provides a centralized interface for all database operations
// with enhanced error handling, caching, and performance monitoring

import { testSupabaseConnection, checkSupabaseConnection } from '@/lib/supabase';
import { 
  workspaceHelpers, 
  ideaVaultHelpers, 
  ideaForgeHelpers, 
  mvpStudioHelpers,
  teamSpaceHelpers,
  docsDecksHelpers,
  onboardingHelpers,
  profileHelpers,
  adminHelpers,
  subscriptionHelpers,
  allHelpers
} from '@/lib/database-helpers';

// =====================================================
// DATABASE SERVICE CLASS
// =====================================================

class DatabaseService {
  private connectionStatus: 'connected' | 'disconnected' | 'checking' = 'checking';
  private lastConnectionCheck: number = 0;
  private connectionCheckInterval: number = 30000; // 30 seconds
  private cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();
  private defaultCacheTTL: number = 300000; // 5 minutes

  constructor() {
    this.initializeService();
  }

  // =====================================================
  // SERVICE INITIALIZATION
  // =====================================================

  private async initializeService() {
    console.log('🔧 Initializing Database Service...');
    
    try {
      const connectionResult = await testSupabaseConnection();
      this.connectionStatus = connectionResult.success ? 'connected' : 'disconnected';
      
      if (connectionResult.success) {
        console.log('✅ Database Service initialized successfully');
        console.log(`📊 Connection time: ${connectionResult.performance.connectionTime.toFixed(2)}ms`);
      } else {
        console.error('❌ Database Service initialization failed:', connectionResult.errors);
      }
    } catch (error) {
      console.error('❌ Database Service initialization error:', error);
      this.connectionStatus = 'disconnected';
    }

    // Set up periodic connection checks
    setInterval(() => {
      this.checkConnectionHealth();
    }, this.connectionCheckInterval);
  }

  // =====================================================
  // CONNECTION MANAGEMENT
  // =====================================================

  private async checkConnectionHealth() {
    if (Date.now() - this.lastConnectionCheck < this.connectionCheckInterval) {
      return this.connectionStatus;
    }

    this.connectionStatus = 'checking';
    this.lastConnectionCheck = Date.now();

    try {
      const result = await checkSupabaseConnection();
      this.connectionStatus = result.isConnected ? 'connected' : 'disconnected';
      
      if (!result.isConnected) {
        console.warn('⚠️ Database connection lost:', result.error);
      }
    } catch (error) {
      console.error('❌ Connection health check failed:', error);
      this.connectionStatus = 'disconnected';
    }

    return this.connectionStatus;
  }

  public async getConnectionStatus() {
    return this.checkConnectionHealth();
  }

  public isConnected(): boolean {
    return this.connectionStatus === 'connected';
  }

  // =====================================================
  // CACHING SYSTEM
  // =====================================================

  private getCacheKey(operation: string, params: unknown): string {
    return `${operation}:${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.defaultCacheTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // =====================================================
  // ENHANCED HELPER ACCESS
  // =====================================================

  // Workspace operations
  public get workspace() {
    return {
      getDashboardStats: (userId: string) => this.withCache(
        'workspace.getDashboardStats',
        { userId },
        () => workspaceHelpers.getDashboardStats(userId),
        60000 // 1 minute cache
      ),
      getRecentActivity: (userId: string, limit?: number) => this.withCache(
        'workspace.getRecentActivity',
        { userId, limit },
        () => workspaceHelpers.getRecentActivity(userId, limit),
        30000 // 30 seconds cache
      ),
      getUsageTracking: (userId: string) => this.withCache(
        'workspace.getUsageTracking',
        { userId },
        () => workspaceHelpers.getUsageTracking(userId),
        300000 // 5 minutes cache
      )
    };
  }

  // Idea Vault operations
  public get ideaVault() {
    return {
      getIdeas: (userId: string, filters?: unknown) => 
        ideaVaultHelpers.getIdeas(userId, filters),
      createIdea: (ideaData: unknown) => {
        this.clearCache('ideaVault');
        this.clearCache('workspace');
        return ideaVaultHelpers.createIdea(ideaData as any);
      },
      updateIdea: (ideaId: string, updates: unknown) => {
        this.clearCache('ideaVault');
        this.clearCache('workspace');
        return ideaVaultHelpers.updateIdea(ideaId, updates);
      },
      deleteIdea: (ideaId: string) => {
        this.clearCache('ideaVault');
        this.clearCache('workspace');
        return ideaVaultHelpers.deleteIdea(ideaId);
      },
      getIdeaCategories: (userId: string) => this.withCache(
        'ideaVault.getIdeaCategories',
        { userId },
        () => ideaVaultHelpers.getIdeaCategories(userId),
        600000 // 10 minutes cache
      )
    };
  }

  // IdeaForge operations
  public get ideaForge() {
    return ideaForgeHelpers;
  }

  // MVP Studio operations
  public get mvpStudio() {
    return mvpStudioHelpers;
  }

  // Team Space operations
  public get teamSpace() {
    return teamSpaceHelpers;
  }

  // Docs & Decks operations
  public get docsDecks() {
    return docsDecksHelpers;
  }

  // Onboarding operations
  public get onboarding() {
    return onboardingHelpers;
  }

  // Profile operations
  public get profile() {
    return profileHelpers;
  }

  // Admin operations
  public get admin() {
    return adminHelpers;
  }

  // Subscription operations
  public get subscription() {
    return subscriptionHelpers;
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private async withCache<T>(
    operation: string,
    params: unknown,
    fn: () => Promise<T>,
    ttl: number = this.defaultCacheTTL
  ): Promise<T> {
    const cacheKey = this.getCacheKey(operation, params);
    
    // Try to get from cache first
    const cached = this.getFromCache<T>(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit for ${operation}`);
      return cached;
    }

    // Execute the operation
    const result = await fn();
    
    // Cache the result if successful
    if (result && !(result as any).error) {
      this.setCache(cacheKey, result, ttl);
    }

    return result;
  }

  // Batch operations
  public async batchOperation<T>(
    operations: Array<() => Promise<T>>,
    maxConcurrency: number = 5
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += maxConcurrency) {
      const batch = operations.slice(i, i + maxConcurrency);
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);
    }

    return results;
  }

  // Health check
  public async healthCheck() {
    const connectionStatus = await this.getConnectionStatus();
    const cacheSize = this.cache.size;
    
    return {
      status: connectionStatus,
      cache: {
        size: cacheSize,
        maxSize: 1000 // You can make this configurable
      },
      timestamp: new Date().toISOString()
    };
  }

  // Clear all caches
  public clearAllCaches(): void {
    this.clearCache();
    console.log('🧹 All caches cleared');
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const databaseService = new DatabaseService();

// Export individual helpers for backward compatibility
export {
  workspaceHelpers,
  ideaVaultHelpers,
  ideaForgeHelpers,
  mvpStudioHelpers,
  teamSpaceHelpers,
  docsDecksHelpers,
  onboardingHelpers,
  profileHelpers,
  adminHelpers,
  subscriptionHelpers,
  allHelpers
};

// Export the service as default
export default databaseService;
