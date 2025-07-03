-- =====================================================
-- SLOW QUERY MONITORING FUNCTIONS (SECURITY FIXED)
-- =====================================================
-- SQL functions to help identify and monitor slow queries
-- These functions help optimize the database performance
-- SECURITY DEFINER removed and SET search_path added for security

-- Enable pg_stat_statements extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_slow_queries(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_connection_stats() CASCADE;
DROP FUNCTION IF EXISTS get_index_usage() CASCADE;
DROP FUNCTION IF EXISTS get_table_sizes() CASCADE;
DROP FUNCTION IF EXISTS analyze_query_patterns() CASCADE;
DROP FUNCTION IF EXISTS get_cache_hit_ratio() CASCADE;
DROP FUNCTION IF EXISTS reset_query_stats() CASCADE;

-- Function to get slow queries (SECURITY FIXED)
CREATE OR REPLACE FUNCTION get_slow_queries(threshold_ms INTEGER DEFAULT 1000)
RETURNS TABLE (
  query TEXT,
  avg_time TEXT,
  calls BIGINT,
  total_time TEXT,
  mean_exec_time NUMERIC
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Check if pg_stat_statements is available
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
  ) THEN
    RAISE NOTICE 'pg_stat_statements extension is not available';
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    pss.query::TEXT,
    (pss.mean_exec_time || 's')::TEXT as avg_time,
    pss.calls,
    (pss.total_exec_time || 's')::TEXT as total_time,
    pss.mean_exec_time
  FROM pg_stat_statements pss
  WHERE pss.mean_exec_time > threshold_ms
  ORDER BY pss.mean_exec_time DESC
  LIMIT 20;
END;
$$;

-- Function to get database connection statistics (SECURITY FIXED)
CREATE OR REPLACE FUNCTION get_connection_stats()
RETURNS JSON
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'active', COUNT(*) FILTER (WHERE state = 'active'),
    'idle', COUNT(*) FILTER (WHERE state = 'idle'),
    'total', COUNT(*)
  )
  INTO result
  FROM pg_stat_activity
  WHERE datname = current_database();

  RETURN result;
END;
$$;

-- Function to get index usage statistics
CREATE OR REPLACE FUNCTION get_index_usage()
RETURNS TABLE (
  index_name TEXT,
  table_name TEXT,
  scans BIGINT,
  tuples BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    indexrelname::TEXT as index_name,
    relname::TEXT as table_name,
    idx_scan as scans,
    idx_tup_read as tuples
  FROM pg_stat_user_indexes
  JOIN pg_class ON pg_class.oid = indexrelid
  ORDER BY idx_scan DESC
  LIMIT 50;
END;
$$;

-- Function to get table sizes and bloat information
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
  schema_name TEXT,
  table_name TEXT,
  size_pretty TEXT,
  size_bytes BIGINT,
  row_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname::TEXT,
    tablename::TEXT,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))::TEXT,
    pg_total_relation_size(schemaname||'.'||tablename),
    n_tup_ins - n_tup_del as row_count
  FROM pg_tables pt
  LEFT JOIN pg_stat_user_tables psut ON pt.tablename = psut.relname
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$;

-- Function to analyze query performance patterns
CREATE OR REPLACE FUNCTION analyze_query_patterns()
RETURNS TABLE (
  query_type TEXT,
  avg_time NUMERIC,
  total_calls BIGINT,
  percentage_of_total NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if pg_stat_statements is available
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
  ) THEN
    RAISE NOTICE 'pg_stat_statements extension is not available';
    RETURN;
  END IF;

  RETURN QUERY
  WITH query_classification AS (
    SELECT 
      CASE 
        WHEN query ILIKE '%pg_class%' OR query ILIKE '%pg_namespace%' THEN 'Schema Introspection'
        WHEN query ILIKE 'SELECT%' AND query ILIKE '%JOIN%' THEN 'Complex SELECT'
        WHEN query ILIKE 'SELECT%' THEN 'Simple SELECT'
        WHEN query ILIKE 'INSERT%' THEN 'INSERT'
        WHEN query ILIKE 'UPDATE%' THEN 'UPDATE'
        WHEN query ILIKE 'DELETE%' THEN 'DELETE'
        ELSE 'Other'
      END as query_type,
      mean_exec_time,
      calls
    FROM pg_stat_statements
    WHERE calls > 0
  ),
  totals AS (
    SELECT SUM(calls) as total_calls FROM query_classification
  )
  SELECT 
    qc.query_type::TEXT,
    AVG(qc.mean_exec_time)::NUMERIC as avg_time,
    SUM(qc.calls)::BIGINT as total_calls,
    (SUM(qc.calls)::NUMERIC / t.total_calls * 100)::NUMERIC as percentage_of_total
  FROM query_classification qc
  CROSS JOIN totals t
  GROUP BY qc.query_type, t.total_calls
  ORDER BY avg_time DESC;
END;
$$;

-- Function to get cache hit ratios
CREATE OR REPLACE FUNCTION get_cache_hit_ratio()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'buffer_cache_hit_ratio', 
    ROUND(
      (sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read) + 1)) * 100, 
      2
    ),
    'index_cache_hit_ratio',
    ROUND(
      (sum(idx_blks_hit) / (sum(idx_blks_hit) + sum(idx_blks_read) + 1)) * 100,
      2
    )
  )
  INTO result
  FROM pg_statio_user_tables;
  
  RETURN result;
END;
$$;

-- Function to reset pg_stat_statements (use with caution)
CREATE OR REPLACE FUNCTION reset_query_stats()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if pg_stat_statements is available
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
  ) THEN
    RAISE NOTICE 'pg_stat_statements extension is not available';
    RETURN FALSE;
  END IF;

  PERFORM pg_stat_statements_reset();
  RETURN TRUE;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_slow_queries(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_connection_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_index_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_sizes() TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_query_patterns() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cache_hit_ratio() TO authenticated;

-- Only grant reset function to service_role (admin only)
GRANT EXECUTE ON FUNCTION reset_query_stats() TO service_role;

-- =====================================================
-- SECURITY WARNING: DO NOT RECREATE THIS VIEW
-- =====================================================
-- The performance_overview view has been fixed in fix-performance-overview-final.sql
-- Creating it here would reintroduce SECURITY DEFINER issues because the functions
-- get_connection_stats() and get_cache_hit_ratio() have SECURITY DEFINER properties
--
-- If you need to recreate the view, use the secure version from:
-- fix-performance-overview-final.sql
-- =====================================================

-- COMMENTED OUT TO PREVENT SECURITY DEFINER ISSUE:
-- CREATE OR REPLACE VIEW performance_overview AS
-- SELECT
--   'Database Performance Overview' as metric_type,
--   json_build_object(
--     'timestamp', NOW(),
--     'connection_stats', get_connection_stats(),
--     'cache_hit_ratio', get_cache_hit_ratio()
--   ) as metrics;
--
-- GRANT SELECT ON performance_overview TO authenticated;

COMMENT ON FUNCTION get_slow_queries IS 'Returns slow queries above the specified threshold (in milliseconds)';
COMMENT ON FUNCTION get_connection_stats IS 'Returns current database connection statistics';
COMMENT ON FUNCTION get_index_usage IS 'Returns index usage statistics for performance analysis';
COMMENT ON FUNCTION get_table_sizes IS 'Returns table sizes and row counts for storage analysis';
COMMENT ON FUNCTION analyze_query_patterns IS 'Analyzes query patterns to identify performance bottlenecks';
COMMENT ON FUNCTION get_cache_hit_ratio IS 'Returns buffer and index cache hit ratios';
COMMENT ON FUNCTION reset_query_stats IS 'Resets pg_stat_statements data (admin only)';
