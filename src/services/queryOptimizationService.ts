/**
 * Query Optimization Service
 * Implements caching and performance optimizations for database queries
 */

import { supabase } from '@/lib/supabase';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface QueryPerformanceMetrics {
  queryId: string;
  executionTime: number;
  cacheHit: boolean;
  timestamp: number;
}

export class QueryOptimizationService {
  private static cache = new Map<string, CacheEntry>();
  private static performanceMetrics: QueryPerformanceMetrics[] = [];
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly TIMEZONE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly MAX_CACHE_SIZE = 1000;
  private static readonly MAX_METRICS_SIZE = 10000;

  /**
   * Get cached data or execute query with caching
   */
  static async getCachedQuery<T>(
    cacheKey: string,
    queryFn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const startTime = performance.now();

    // Check cache first
    const cached = this.getFromCache<T>(cacheKey);
    if (cached) {
      this.recordMetrics(cacheKey, performance.now() - startTime, true);
      return cached;
    }

    // Execute query
    const result = await queryFn();

    // Cache the result
    this.setCache(cacheKey, result, ttl);

    this.recordMetrics(cacheKey, performance.now() - startTime, false);
    return result;
  }

  /**
   * Optimized schema verification with extended caching
   * Use this for expensive schema introspection queries
   */
  static async getCachedSchemaQuery<T>(
    cacheKey: string,
    queryFn: () => Promise<T>,
    ttl: number = 10 * 60 * 1000 // 10 minutes default for schema queries
  ): Promise<T> {
    return this.getCachedQuery(cacheKey, queryFn, ttl);
  }

  /**
   * Get timezone data with optimized caching
   */
  static async getTimezones(): Promise<string[]> {
    return this.getCachedQuery(
      'pg_timezone_names',
      async () => {
        const { data, error } = await supabase.rpc('get_timezone_names');
        if (error) {
          console.error('Error fetching timezones:', error);
          // Fallback to common timezones
          return [
            'UTC',
            'America/New_York',
            'America/Los_Angeles',
            'Europe/London',
            'Europe/Paris',
            'Asia/Tokyo',
            'Asia/Shanghai',
            'Asia/Kolkata',
            'Australia/Sydney',
          ];
        }
        return data || [];
      },
      this.TIMEZONE_CACHE_TTL
    );
  }

  /**
   * Optimized realtime subscription with rate limiting
   */
  static createOptimizedRealtimeSubscription(
    table: string,
    callback: (payload: any) => void,
    options: {
      filter?: string;
      rateLimit?: number; // Max events per second
      batchSize?: number; // Batch multiple events
      batchDelay?: number; // Delay before processing batch
    } = {}
  ) {
    const {
      filter,
      rateLimit = 10,
      batchSize = 5,
      batchDelay = 100,
    } = options;

    const eventQueue: Record<string, unknown>[] = [];
    let lastProcessTime = 0;
    let batchTimeout: NodeJS.Timeout | null = null;

    const processEvents = () => {
      if (eventQueue.length === 0) return;

      const now = Date.now();
      const timeSinceLastProcess = now - lastProcessTime;
      const minInterval = 1000 / rateLimit;

      if (timeSinceLastProcess < minInterval) {
        // Rate limit exceeded, schedule for later
        setTimeout(processEvents, minInterval - timeSinceLastProcess);
        return;
      }

      // Process batched events
      const eventsToProcess = eventQueue.splice(0, batchSize);
      eventsToProcess.forEach(callback);
      lastProcessTime = now;

      // Continue processing if more events exist
      if (eventQueue.length > 0) {
        setTimeout(processEvents, minInterval);
      }
    };

    const queueEvent = (payload: any) => {
      eventQueue.push(payload);

      // Clear existing timeout
      if (batchTimeout) {
        clearTimeout(batchTimeout);
      }

      // Set new timeout for batch processing
      batchTimeout = setTimeout(() => {
        processEvents();
        batchTimeout = null;
      }, batchDelay);
    };

    // Create subscription
    const subscription = supabase
      .channel(`optimized_${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        queueEvent
      )
      .subscribe();

    return {
      subscription,
      unsubscribe: () => {
        if (batchTimeout) {
          clearTimeout(batchTimeout);
        }
        subscription.unsubscribe();
      },
    };
  }

  /**
   * Batch multiple queries for better performance
   */
  static async batchQueries<T extends Record<string, any>>(
    queries: Record<keyof T, () => Promise<any>>
  ): Promise<T> {
    const results = await Promise.allSettled(
      Object.entries(queries).map(async ([key, queryFn]) => {
        try {
          const result = await queryFn();
          return { key, result, success: true };
        } catch (error) {
          console.error(`Error in batch query ${key}:`, error);
          return { key, error, success: false };
        }
      })
    );

    const batchResult = {} as T;
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        batchResult[result.value.key as keyof T] = result.value.result;
      } else if (result.status === 'fulfilled') {
        batchResult[result.value.key as keyof T] = null;
      } else {
        // Handle rejected promises - we need to extract the key somehow
        // For now, we'll skip rejected promises
        console.error('Promise rejected in batch query:', result.reason);
      }
    });

    return batchResult;
  }

  /**
   * Optimized pagination with cursor-based approach
   */
  static async getPaginatedData<T>(
    table: string,
    options: {
      pageSize?: number;
      cursor?: string;
      orderBy?: string;
      ascending?: boolean;
      filters?: Record<string, any>;
    } = {}
  ): Promise<{
    data: T[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const {
      pageSize = 20,
      cursor,
      orderBy = 'created_at',
      ascending = false,
      filters = {},
    } = options;

    let query = supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending })
      .limit(pageSize + 1); // Fetch one extra to check if there are more

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    // Apply cursor for pagination
    if (cursor) {
      const operator = ascending ? 'gt' : 'lt';
      query = query[operator](orderBy, cursor);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Pagination query failed: ${error.message}`);
    }

    const hasMore = data.length > pageSize;
    const results = hasMore ? data.slice(0, pageSize) : data;
    const nextCursor = hasMore ? results[results.length - 1][orderBy] : undefined;

    return {
      data: results,
      nextCursor,
      hasMore,
    };
  }

  /**
   * Database connection pooling optimization
   */
  static async optimizeConnectionPool() {
    try {
      // Set optimal connection pool settings
      const { error } = await supabase.rpc('set_connection_pool_settings', {
        max_connections: 20,
        idle_timeout: 30000,
        connection_timeout: 5000,
      });

      if (error) {
        console.warn('Could not optimize connection pool:', error);
      }
    } catch (error) {
      console.warn('Connection pool optimization not available:', error);
    }
  }

  /**
   * Cache management methods
   */
  private static getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private static setCache<T>(key: string, data: T, ttl: number): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear cache
   */
  static clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Record performance metrics
   */
  private static recordMetrics(queryId: string, executionTime: number, cacheHit: boolean): void {
    // Implement circular buffer for metrics
    if (this.performanceMetrics.length >= this.MAX_METRICS_SIZE) {
      this.performanceMetrics.shift();
    }

    this.performanceMetrics.push({
      queryId,
      executionTime,
      cacheHit,
      timestamp: Date.now(),
    });
  }

  /**
   * Get performance statistics
   */
  static getPerformanceStats(): {
    totalQueries: number;
    cacheHitRate: number;
    averageExecutionTime: number;
    slowestQueries: QueryPerformanceMetrics[];
  } {
    const metrics = this.performanceMetrics;
    const totalQueries = metrics.length;
    const cacheHits = metrics.filter(m => m.cacheHit).length;
    const cacheHitRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0;
    
    const totalExecutionTime = metrics.reduce((sum, m) => sum + m.executionTime, 0);
    const averageExecutionTime = totalQueries > 0 ? totalExecutionTime / totalQueries : 0;
    
    const slowestQueries = metrics
      .filter(m => !m.cacheHit)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    return {
      totalQueries,
      cacheHitRate,
      averageExecutionTime,
      slowestQueries,
    };
  }

  /**
   * Preload commonly used data
   */
  static async preloadCommonData(): Promise<void> {
    try {
      // Preload timezones
      await this.getTimezones();
      
      // Preload other commonly accessed data
      await Promise.all([
        this.getCachedQuery('user_preferences', async () => {
          const { data } = await supabase.from('user_preferences').select('*').limit(100);
          return data || [];
        }),
        this.getCachedQuery('app_settings', async () => {
          const { data } = await supabase.from('app_settings').select('*');
          return data || [];
        }),
      ]);

      console.log('Common data preloaded successfully');
    } catch (error) {
      console.warn('Error preloading common data:', error);
    }
  }

  /**
   * Initialize optimization service
   */
  static async initialize(): Promise<void> {
    try {
      await this.optimizeConnectionPool();
      await this.preloadCommonData();
      
      // Set up periodic cache cleanup
      setInterval(() => {
        this.cleanupExpiredCache();
      }, 5 * 60 * 1000); // Every 5 minutes

      console.log('Query optimization service initialized');
    } catch (error) {
      console.error('Error initializing query optimization service:', error);
    }
  }

  /**
   * Clean up expired cache entries
   */
  private static cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}
