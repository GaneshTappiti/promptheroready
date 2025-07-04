/**
 * useApi Hook
 * React hook for API calls with loading, error, and caching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse } from '../types';

interface UseApiOptions<T> {
  immediate?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  retries?: number;
  retryDelay?: number;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

export function useApi<T = any>(
  apiFunction: (...args: unknown[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const {
    immediate = false,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    onSuccess,
    onError,
    retries = 0,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check cache
  const getCachedData = useCallback((key: string): T | null => {
    if (!cacheKey) return null;
    
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    
    // Remove expired cache
    if (cached) {
      cache.delete(key);
    }
    
    return null;
  }, [cacheKey]);

  // Set cache
  const setCachedData = useCallback((key: string, data: T) => {
    if (!cacheKey) return;
    
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: cacheTTL,
    });
  }, [cacheKey, cacheTTL]);

  // Execute API call with retry logic
  const executeWithRetry = useCallback(async (
    fn: () => Promise<ApiResponse<T>>,
    attempt: number = 0
  ): Promise<T | null> => {
    try {
      const response = await fn();
      
      if (!mountedRef.current) return null;
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'API call failed');
      }
    } catch (err) {
      if (!mountedRef.current) return null;
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Retry logic
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        return executeWithRetry(fn, attempt + 1);
      }
      
      throw new Error(errorMessage);
    }
  }, [retries, retryDelay]);

  // Main execute function
  const execute = useCallback(async (...args: unknown[]): Promise<T | null> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first
    if (cacheKey) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        setData(cached);
        setError(null);
        return cached;
      }
    }

    setLoading(true);
    setError(null);

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const result = await executeWithRetry(() => apiFunction(...args));
      
      if (!mountedRef.current) return null;

      setData(result);
      
      // Cache the result
      if (result && cacheKey) {
        setCachedData(cacheKey, result);
      }
      
      if (onSuccess && result) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      if (!mountedRef.current) return null;
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      return null;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction, cacheKey, getCachedData, setCachedData, executeWithRetry, onSuccess, onError]);

  // Reset function
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation<T = any, P = any>(
  mutationFunction: (params: P) => Promise<ApiResponse<T>>,
  options: Omit<UseApiOptions<T>, 'immediate'> = {}
): UseApiReturn<T> & { mutate: (params: P) => Promise<T | null> } {
  const { execute, ...rest } = useApi(mutationFunction, { ...options, immediate: false });
  
  const mutate = useCallback((params: P) => {
    return execute(params);
  }, [execute]);

  return {
    ...rest,
    execute,
    mutate,
  };
}

// Hook for queries with automatic refetching
export function useQuery<T = any>(
  queryKey: string,
  queryFunction: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> & { refetchInterval?: number } = {}
): UseApiReturn<T> & { refetch: () => Promise<T | null> } {
  const { refetchInterval, ...apiOptions } = options;
  const { execute, ...rest } = useApi(queryFunction, {
    ...apiOptions,
    cacheKey: queryKey,
    immediate: true,
  });

  // Auto refetch
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(() => {
        execute();
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, execute]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    ...rest,
    execute,
    refetch,
  };
}
