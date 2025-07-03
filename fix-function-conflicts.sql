-- =====================================================
-- FIX FUNCTION CONFLICTS AND SECURITY DEFINER ISSUES
-- =====================================================
-- This script specifically handles function signature conflicts
-- and removes all SECURITY DEFINER properties
-- =====================================================

BEGIN;

-- =====================================================
-- 1. MANUAL DROP OF CONFLICTING FUNCTIONS
-- =====================================================

-- Drop specific functions that are causing conflicts
DROP FUNCTION IF EXISTS public.get_connection_stats() CASCADE;
DROP FUNCTION IF EXISTS public.get_cache_hit_ratio() CASCADE;
DROP FUNCTION IF EXISTS public.get_slow_queries(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.get_index_usage() CASCADE;
DROP FUNCTION IF EXISTS public.get_table_sizes() CASCADE;
DROP FUNCTION IF EXISTS public.analyze_query_patterns() CASCADE;
DROP FUNCTION IF EXISTS public.reset_query_stats() CASCADE;
DROP FUNCTION IF EXISTS public.get_timezone_names() CASCADE;
DROP FUNCTION IF EXISTS public.refresh_materialized_views() CASCADE;
DROP FUNCTION IF EXISTS public.check_password_age() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_audit_logs() CASCADE;
DROP FUNCTION IF EXISTS public.set_connection_pool_settings() CASCADE;
DROP FUNCTION IF EXISTS public.log_security_event(UUID, TEXT, TEXT, TEXT, INET, TEXT, BOOLEAN, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.create_profiles_for_existing_users() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_security_recommendations() CASCADE;

-- Drop the problematic view
DROP VIEW IF EXISTS public.performance_overview CASCADE;

-- =====================================================
-- 2. RECREATE ONLY ESSENTIAL FUNCTIONS
-- =====================================================

-- Essential trigger function (used by triggers)
CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- User creation function (used by admin)
CREATE FUNCTION public.create_profiles_for_existing_users()
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
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

-- New user trigger function (used by auth trigger)
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
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

-- Security audit function (used by application)
CREATE FUNCTION public.log_security_event(
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
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
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

-- Cleanup function (used by maintenance)
CREATE FUNCTION public.cleanup_old_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.security_audit_log 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Security recommendations function (used by admin)
CREATE FUNCTION public.get_security_recommendations()
RETURNS TABLE(
    recommendation_type TEXT,
    description TEXT,
    action_required TEXT,
    priority TEXT
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
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
    );
END;
$$;

-- =====================================================
-- 3. CREATE SIMPLE PERFORMANCE VIEW
-- =====================================================

CREATE VIEW public.performance_overview AS
SELECT 
    'database_performance'::TEXT as metric_type,
    COUNT(*)::BIGINT as total_records,
    CURRENT_TIMESTAMP as last_updated
FROM public.user_profiles
UNION ALL
SELECT 
    'active_users'::TEXT as metric_type,
    COUNT(*)::BIGINT as total_records,
    CURRENT_TIMESTAMP as last_updated
FROM public.user_profiles 
WHERE last_login_at >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
    'total_ideas'::TEXT as metric_type,
    COUNT(*)::BIGINT as total_records,
    CURRENT_TIMESTAMP as last_updated
FROM public.ideas
UNION ALL
SELECT 
    'system_status'::TEXT as metric_type,
    1::BIGINT as total_records,
    CURRENT_TIMESTAMP as last_updated;

-- Set secure permissions
REVOKE ALL ON public.performance_overview FROM PUBLIC, anon;
GRANT SELECT ON public.performance_overview TO authenticated, service_role;

-- =====================================================
-- 4. FINAL VERIFICATION
-- =====================================================

DO $$
DECLARE
    definer_count INTEGER;
    view_exists BOOLEAN;
    function_count INTEGER;
BEGIN
    -- Check for remaining SECURITY DEFINER functions
    SELECT COUNT(*) INTO definer_count
    FROM pg_proc 
    WHERE pronamespace = 'public'::regnamespace 
    AND prosecdef = true;
    
    -- Check if view exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'performance_overview'
    ) INTO view_exists;
    
    -- Count recreated functions
    SELECT COUNT(*) INTO function_count
    FROM pg_proc 
    WHERE pronamespace = 'public'::regnamespace 
    AND proname IN (
        'update_updated_at_column',
        'create_profiles_for_existing_users',
        'handle_new_user',
        'log_security_event',
        'cleanup_old_audit_logs',
        'get_security_recommendations'
    );
    
    RAISE NOTICE '';
    RAISE NOTICE '🔒 FUNCTION CONFLICTS AND SECURITY ISSUES FIXED:';
    RAISE NOTICE '✅ Dropped all conflicting functions';
    RAISE NOTICE '✅ Recreated % essential functions with secure search_path', function_count;
    RAISE NOTICE '✅ Created secure performance_overview view: %', view_exists;
    RAISE NOTICE '📊 Remaining SECURITY DEFINER functions: %', definer_count;
    RAISE NOTICE '';
    
    IF definer_count = 0 THEN
        RAISE NOTICE '🎉 SUCCESS: All SECURITY DEFINER issues resolved!';
    ELSE
        RAISE NOTICE '⚠️ WARNING: % SECURITY DEFINER functions still exist', definer_count;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 MANUAL ACTIONS STILL REQUIRED:';
    RAISE NOTICE '1. Enable HaveIBeenPwned password checking in Supabase Dashboard';
    RAISE NOTICE '2. Enable additional MFA options (TOTP, SMS) in Authentication settings';
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ Test: SELECT * FROM get_security_recommendations();';
    RAISE NOTICE '🛡️ Test: SELECT * FROM performance_overview LIMIT 3;';
END $$;

COMMIT;
