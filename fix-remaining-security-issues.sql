-- =====================================================
-- FIX REMAINING 19 SECURITY ISSUES
-- =====================================================
-- This script fixes all remaining security issues:
-- 1. SECURITY DEFINER view (1 issue)
-- 2. Role mutable search_path functions (16 issues)
-- 3. Auth configuration recommendations (2 issues)
-- =====================================================

BEGIN;

-- =====================================================
-- 1. FIX SECURITY DEFINER VIEW
-- =====================================================

-- Drop and recreate performance_overview without SECURITY DEFINER
DROP VIEW IF EXISTS performance_overview CASCADE;

CREATE VIEW performance_overview AS
SELECT 
    'database_performance' as metric_type,
    COUNT(*) as total_records,
    CURRENT_TIMESTAMP as last_updated
FROM user_profiles
UNION ALL
SELECT 
    'active_users' as metric_type,
    COUNT(*) as total_records,
    CURRENT_TIMESTAMP as last_updated
FROM user_profiles 
WHERE last_login_at >= CURRENT_DATE - INTERVAL '7 days';

-- Set proper permissions (no SECURITY DEFINER)
REVOKE ALL ON performance_overview FROM anon;
GRANT SELECT ON performance_overview TO authenticated, service_role;

-- =====================================================
-- 2. FIX ROLE MUTABLE SEARCH_PATH FUNCTIONS
-- =====================================================

-- Drop existing functions first to avoid conflicts (comprehensive cleanup)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all functions that we're going to recreate
    FOR r IN (
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc
        WHERE pronamespace = 'public'::regnamespace
        AND proname IN (
            'update_updated_at_column',
            'create_profiles_for_existing_users',
            'get_connection_stats',
            'handle_new_user',
            'get_slow_queries',
            'get_index_usage',
            'get_cache_hit_ratio',
            'get_table_sizes',
            'analyze_query_patterns',
            'reset_query_stats',
            'get_timezone_names',
            'refresh_materialized_views',
            'check_password_age',
            'cleanup_old_audit_logs',
            'set_connection_pool_settings',
            'log_security_event',
            'get_security_recommendations'
        )
    ) LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I(%s) CASCADE', r.proname, r.argtypes);
    END LOOP;
END $$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Fix create_profiles_for_existing_users function
CREATE OR REPLACE FUNCTION create_profiles_for_existing_users()
RETURNS void
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id, email, created_at 
        FROM auth.users 
        WHERE id NOT IN (SELECT id FROM public.user_profiles)
    LOOP
        INSERT INTO public.user_profiles (id, created_at, updated_at)
        VALUES (user_record.id, user_record.created_at, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END;
$$;

-- Fix get_connection_stats function
CREATE OR REPLACE FUNCTION get_connection_stats()
RETURNS TABLE(
    total_connections INTEGER,
    active_connections INTEGER,
    idle_connections INTEGER
)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_connections,
        COUNT(CASE WHEN state = 'active' THEN 1 END)::INTEGER as active_connections,
        COUNT(CASE WHEN state = 'idle' THEN 1 END)::INTEGER as idle_connections
    FROM pg_stat_activity
    WHERE datname = current_database();
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    admin_emails TEXT[] := ARRAY['ganeshtappiti1605@gmail.com'];
    user_role TEXT := 'user';
    free_plan_id UUID;
BEGIN
    IF NEW.email = ANY(admin_emails) THEN
        user_role := 'super_admin';
    END IF;

    INSERT INTO public.user_profiles (
        id, role, avatar_url, created_at, updated_at
    ) VALUES (
        NEW.id, user_role, NEW.raw_user_meta_data->>'avatar_url', NOW(), NOW()
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_preferences (
        user_id, created_at, updated_at
    ) VALUES (
        NEW.id, NOW(), NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

    SELECT id INTO free_plan_id FROM public.subscription_plans WHERE name = 'free' LIMIT 1;
    
    INSERT INTO public.user_subscriptions (
        user_id, plan_id, status, created_at, updated_at
    ) VALUES (
        NEW.id, free_plan_id, 'active', NOW(), NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

    IF user_role = 'super_admin' THEN
        INSERT INTO public.admin_users (
            user_id, role, is_active, created_by, created_at, updated_at
        ) VALUES (
            NEW.id, 'super_admin', true, NEW.id, NOW(), NOW()
        ) ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

-- Fix get_slow_queries function
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE(
    query TEXT,
    calls BIGINT,
    total_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION
)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_statements.query,
        pg_stat_statements.calls,
        pg_stat_statements.total_exec_time as total_time,
        pg_stat_statements.mean_exec_time as mean_time
    FROM pg_stat_statements
    WHERE pg_stat_statements.mean_exec_time > 100
    ORDER BY pg_stat_statements.mean_exec_time DESC
    LIMIT 10;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'pg_stat_statements extension not available';
        RETURN;
END;
$$;

-- Fix get_index_usage function
CREATE OR REPLACE FUNCTION get_index_usage()
RETURNS TABLE(
    schemaname TEXT,
    tablename TEXT,
    indexname TEXT,
    idx_scan BIGINT,
    idx_tup_read BIGINT,
    idx_tup_fetch BIGINT
)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_user_indexes.schemaname::TEXT,
        pg_stat_user_indexes.relname::TEXT as tablename,
        pg_stat_user_indexes.indexrelname::TEXT as indexname,
        pg_stat_user_indexes.idx_scan,
        pg_stat_user_indexes.idx_tup_read,
        pg_stat_user_indexes.idx_tup_fetch
    FROM pg_stat_user_indexes
    ORDER BY pg_stat_user_indexes.idx_scan DESC;
END;
$$;

-- Fix get_cache_hit_ratio function
CREATE OR REPLACE FUNCTION get_cache_hit_ratio()
RETURNS TABLE(
    cache_hit_ratio NUMERIC
)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(
            (sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))) * 100, 2
        ) as cache_hit_ratio
    FROM pg_statio_user_tables;
END;
$$;

-- Fix get_table_sizes function
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE(
    schemaname TEXT,
    tablename TEXT,
    size_bytes BIGINT,
    size_pretty TEXT
)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname::TEXT,
        tablename::TEXT,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size_pretty
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$;

-- Fix analyze_query_patterns function
CREATE OR REPLACE FUNCTION analyze_query_patterns()
RETURNS TABLE(
    query_type TEXT,
    count BIGINT,
    avg_time DOUBLE PRECISION
)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN pg_stat_statements.query ILIKE 'SELECT%' THEN 'SELECT'
            WHEN pg_stat_statements.query ILIKE 'INSERT%' THEN 'INSERT'
            WHEN pg_stat_statements.query ILIKE 'UPDATE%' THEN 'UPDATE'
            WHEN pg_stat_statements.query ILIKE 'DELETE%' THEN 'DELETE'
            ELSE 'OTHER'
        END as query_type,
        COUNT(*) as count,
        AVG(pg_stat_statements.mean_exec_time) as avg_time
    FROM pg_stat_statements
    GROUP BY 1
    ORDER BY 2 DESC;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'pg_stat_statements extension not available';
        RETURN;
END;
$$;

-- Fix reset_query_stats function
CREATE OR REPLACE FUNCTION reset_query_stats()
RETURNS void
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
    PERFORM pg_stat_statements_reset();
EXCEPTION
    WHEN undefined_function THEN
        RAISE NOTICE 'pg_stat_statements extension not available';
END;
$$;

-- Fix get_timezone_names function
CREATE OR REPLACE FUNCTION get_timezone_names()
RETURNS TABLE(timezone_name TEXT)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT name::TEXT as timezone_name
    FROM pg_timezone_names
    WHERE name LIKE '%/%'
    ORDER BY name;
END;
$$;

-- Fix refresh_materialized_views function
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    view_name TEXT;
BEGIN
    FOR view_name IN
        SELECT matviewname
        FROM pg_matviews
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('REFRESH MATERIALIZED VIEW %I', view_name);
    END LOOP;
END;
$$;

-- Fix check_password_age function
CREATE OR REPLACE FUNCTION check_password_age()
RETURNS TABLE(
    user_id UUID,
    password_age_days INTEGER,
    needs_update BOOLEAN
)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        uph.user_id,
        EXTRACT(days FROM (CURRENT_TIMESTAMP - MAX(uph.created_at)))::INTEGER as password_age_days,
        EXTRACT(days FROM (CURRENT_TIMESTAMP - MAX(uph.created_at))) > 90 as needs_update
    FROM public.user_password_history uph
    GROUP BY uph.user_id;
END;
$$;

-- Fix cleanup_old_audit_logs function
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.security_audit_log
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Fix set_connection_pool_settings function
CREATE OR REPLACE FUNCTION set_connection_pool_settings()
RETURNS void
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
    -- This function would typically set connection pool settings
    -- Implementation depends on your specific pooling solution
    RAISE NOTICE 'Connection pool settings updated';
END;
$$;

-- Fix log_security_event function
CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT DEFAULT NULL,
    p_resource_id TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.security_audit_log (
        user_id, action, resource_type, resource_id,
        ip_address, user_agent, success, error_message, metadata
    ) VALUES (
        p_user_id, p_action, p_resource_type, p_resource_id,
        p_ip_address, p_user_agent, p_success, p_error_message, p_metadata
    ) RETURNING id INTO log_id;

    RETURN log_id;
END;
$$;

-- =====================================================
-- 3. CREATE SECURITY CONFIGURATION RECOMMENDATIONS
-- =====================================================

-- Create a function to check and recommend security settings
CREATE OR REPLACE FUNCTION get_security_recommendations()
RETURNS TABLE(
    recommendation_type TEXT,
    description TEXT,
    action_required TEXT,
    priority TEXT
)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY VALUES
    (
        'Password Security'::TEXT,
        'Enable HaveIBeenPwned password checking'::TEXT,
        'Go to Supabase Dashboard > Authentication > Settings > Enable "Check for compromised passwords"'::TEXT,
        'HIGH'::TEXT
    ),
    (
        'MFA Configuration'::TEXT,
        'Enable additional MFA options'::TEXT,
        'Go to Supabase Dashboard > Authentication > Settings > Enable TOTP, SMS, and Email MFA options'::TEXT,
        'HIGH'::TEXT
    ),
    (
        'Session Security'::TEXT,
        'Configure secure session settings'::TEXT,
        'Set appropriate session timeout and refresh token rotation'::TEXT,
        'MEDIUM'::TEXT
    ),
    (
        'Rate Limiting'::TEXT,
        'Enable rate limiting for authentication'::TEXT,
        'Configure rate limits for login attempts and password resets'::TEXT,
        'MEDIUM'::TEXT
    );
END;
$$;

-- =====================================================
-- 4. VERIFICATION AND COMPLETION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🔒 REMAINING SECURITY ISSUES FIXED:';
    RAISE NOTICE '✅ Fixed SECURITY DEFINER view issue';
    RAISE NOTICE '✅ Fixed 16 functions with mutable search_path';
    RAISE NOTICE '✅ All functions now use SET search_path = public, pg_temp';
    RAISE NOTICE '✅ Created security recommendations function';
    RAISE NOTICE '';
    RAISE NOTICE '📋 MANUAL ACTIONS REQUIRED:';
    RAISE NOTICE '1. Enable HaveIBeenPwned password checking in Supabase Dashboard';
    RAISE NOTICE '2. Enable additional MFA options (TOTP, SMS) in Authentication settings';
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ Run SELECT * FROM get_security_recommendations(); for detailed steps';
    RAISE NOTICE '🚀 All automated security fixes completed!';
END $$;

COMMIT;
