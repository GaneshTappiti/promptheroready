/**
 * Database Performance Monitoring and Optimization Utilities
 * Helps identify and resolve slow database queries
 */

import { supabase } from '@/lib/supabase';

export interface SlowQuery {
  query: string;
  avgTime: string;
  calls: number;
  totalTime?: string;
}

export interface PerformanceMetrics {
  slowQueries: SlowQuery[];
  connectionCount: number;
  cacheHitRatio: number;
  indexUsage: Array<{
    indexName: string;
    tableName: string;
    scans: number;
    tuples: number;
  }>;
}

/**
 * Database Performance Monitor
 */
export class DatabasePerformanceMonitor {
  private static readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second

  /**
   * Get slow queries from pg_stat_statements (if available)
   * Note: This requires pg_stat_statements extension to be enabled
   */
  static async getSlowQueries(): Promise<SlowQuery[]> {
    try {
      const { data, error } = await supabase.rpc('get_slow_queries', {
        threshold_ms: this.SLOW_QUERY_THRESHOLD
      });

      if (error) {
        console.warn('Could not fetch slow queries (pg_stat_statements may not be enabled):', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Error fetching slow queries:', error);
      return [];
    }
  }

  /**
   * Get database connection statistics
   */
  static async getConnectionStats(): Promise<{
    active: number;
    idle: number;
    total: number;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_connection_stats');

      if (error) {
        console.warn('Could not fetch connection stats:', error);
        return { active: 0, idle: 0, total: 0 };
      }

      return data || { active: 0, idle: 0, total: 0 };
    } catch (error) {
      console.warn('Error fetching connection stats:', error);
      return { active: 0, idle: 0, total: 0 };
    }
  }

  /**
   * Get index usage statistics
   */
  static async getIndexUsage(): Promise<Array<{
    indexName: string;
    tableName: string;
    scans: number;
    tuples: number;
  }>> {
    try {
      const { data, error } = await supabase.rpc('get_index_usage');

      if (error) {
        console.warn('Could not fetch index usage:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Error fetching index usage:', error);
      return [];
    }
  }

  /**
   * Get comprehensive performance metrics
   */
  static async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const [slowQueries, connectionStats, indexUsage] = await Promise.all([
      this.getSlowQueries(),
      this.getConnectionStats(),
      this.getIndexUsage()
    ]);

    return {
      slowQueries,
      connectionCount: connectionStats.total,
      cacheHitRatio: 0, // Would need additional query to calculate
      indexUsage
    };
  }

  /**
   * Analyze and provide recommendations for slow queries
   */
  static analyzeSlowQueries(slowQueries: SlowQuery[]): Array<{
    query: string;
    issue: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const recommendations = [];

    for (const query of slowQueries) {
      const avgTimeMs = parseFloat(query.avgTime.replace('s', '')) * 1000;
      
      if (avgTimeMs > 5000) { // > 5 seconds
        recommendations.push({
          query: query.query.substring(0, 100) + '...',
          issue: `Very slow query (${query.avgTime} avg)`,
          recommendation: 'Consider adding indexes, optimizing joins, or caching results',
          priority: 'high' as const
        });
      } else if (avgTimeMs > 2000) { // > 2 seconds
        recommendations.push({
          query: query.query.substring(0, 100) + '...',
          issue: `Slow query (${query.avgTime} avg)`,
          recommendation: 'Review query execution plan and consider optimization',
          priority: 'medium' as const
        });
      }

      // Check for schema introspection queries
      if (query.query.includes('pg_class') || query.query.includes('pg_namespace') || 
          query.query.includes('pg_get_tabledef') || query.query.includes('pg_get_viewdef')) {
        recommendations.push({
          query: query.query.substring(0, 100) + '...',
          issue: 'Expensive schema introspection query',
          recommendation: 'Cache schema information or reduce frequency of schema queries',
          priority: 'high' as const
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate performance report
   */
  static async generatePerformanceReport(): Promise<{
    metrics: PerformanceMetrics;
    recommendations: Array<{
      query: string;
      issue: string;
      recommendation: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    summary: {
      totalSlowQueries: number;
      highPriorityIssues: number;
      avgQueryTime: number;
    };
  }> {
    const metrics = await this.getPerformanceMetrics();
    const recommendations = this.analyzeSlowQueries(metrics.slowQueries);
    
    const avgQueryTime = metrics.slowQueries.length > 0
      ? metrics.slowQueries.reduce((sum, q) => sum + parseFloat(q.avgTime.replace('s', '')), 0) / metrics.slowQueries.length
      : 0;

    return {
      metrics,
      recommendations,
      summary: {
        totalSlowQueries: metrics.slowQueries.length,
        highPriorityIssues: recommendations.filter(r => r.priority === 'high').length,
        avgQueryTime
      }
    };
  }
}

/**
 * Query optimization helpers
 */
export const queryOptimizationHelpers = {
  /**
   * Debounce database testing to prevent excessive queries
   */
  debounceTest: (() => {
    let timeout: NodeJS.Timeout;
    return (fn: () => void, delay: number = 2000) => {
      clearTimeout(timeout);
      timeout = setTimeout(fn, delay);
    };
  })(),

  /**
   * Check if schema queries should be cached
   */
  shouldCacheSchemaQuery: (queryType: string): boolean => {
    const cacheableQueries = [
      'table_verification',
      'schema_integrity',
      'database_structure'
    ];
    return cacheableQueries.includes(queryType);
  },

  /**
   * Get cache TTL for different query types
   */
  getCacheTTL: (queryType: string): number => {
    const ttlMap: Record<string, number> = {
      'schema_verification': 10 * 60 * 1000, // 10 minutes
      'table_structure': 15 * 60 * 1000,     // 15 minutes
      'database_stats': 5 * 60 * 1000,       // 5 minutes
      'performance_metrics': 2 * 60 * 1000   // 2 minutes
    };
    return ttlMap[queryType] || 5 * 60 * 1000; // Default 5 minutes
  }
};
