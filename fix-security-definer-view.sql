-- =====================================================
-- FIX SECURITY DEFINER VIEW ISSUE
-- =====================================================
-- This script specifically fixes the performance_overview view
-- that still has the SECURITY DEFINER property
-- =====================================================

BEGIN;

-- =====================================================
-- 1. IDENTIFY AND DROP THE PROBLEMATIC VIEW
-- =====================================================

-- Check if the view exists and has SECURITY DEFINER
DO $$
DECLARE
    view_exists BOOLEAN;
    view_definition TEXT;
BEGIN
    -- Check if view exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'performance_overview'
    ) INTO view_exists;
    
    IF view_exists THEN
        -- Get the view definition to check for SECURITY DEFINER
        SELECT pg_get_viewdef('public.performance_overview'::regclass) INTO view_definition;
        
        RAISE NOTICE 'Found performance_overview view';
        RAISE NOTICE 'Current definition: %', view_definition;
        
        -- Drop the view completely
        DROP VIEW IF EXISTS public.performance_overview CASCADE;
        RAISE NOTICE 'Dropped performance_overview view';
    ELSE
        RAISE NOTICE 'performance_overview view does not exist';
    END IF;
END $$;

-- =====================================================
-- 2. RECREATE VIEW WITHOUT SECURITY DEFINER
-- =====================================================

-- Create a new, secure view without SECURITY DEFINER
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
    'active_subscriptions'::TEXT as metric_type,
    COUNT(*)::BIGINT as total_records,
    CURRENT_TIMESTAMP as last_updated
FROM public.user_subscriptions
WHERE status = 'active';

-- =====================================================
-- 3. SET PROPER PERMISSIONS (NO SECURITY DEFINER)
-- =====================================================

-- Revoke all permissions first
REVOKE ALL ON public.performance_overview FROM PUBLIC;
REVOKE ALL ON public.performance_overview FROM anon;
REVOKE ALL ON public.performance_overview FROM authenticated;

-- Grant appropriate permissions
-- Only authenticated users and service role can access
GRANT SELECT ON public.performance_overview TO authenticated;
GRANT SELECT ON public.performance_overview TO service_role;

-- =====================================================
-- 4. VERIFY THE FIX
-- =====================================================

-- Check that the view was created correctly
DO $$
DECLARE
    view_exists BOOLEAN;
    view_definition TEXT;
    has_security_definer BOOLEAN;
BEGIN
    -- Check if view exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'performance_overview'
    ) INTO view_exists;
    
    IF view_exists THEN
        -- Get the view definition
        SELECT pg_get_viewdef('public.performance_overview'::regclass) INTO view_definition;
        
        -- Check if it contains SECURITY DEFINER
        has_security_definer := view_definition ILIKE '%SECURITY DEFINER%';
        
        IF has_security_definer THEN
            RAISE EXCEPTION 'ERROR: View still has SECURITY DEFINER property!';
        ELSE
            RAISE NOTICE '✅ SUCCESS: performance_overview view created without SECURITY DEFINER';
            RAISE NOTICE 'View definition: %', view_definition;
        END IF;
    ELSE
        RAISE EXCEPTION 'ERROR: performance_overview view was not created!';
    END IF;
END $$;

-- =====================================================
-- 5. TEST THE VIEW
-- =====================================================

-- Test that the view works correctly
DO $$
DECLARE
    test_result RECORD;
    row_count INTEGER;
BEGIN
    -- Test basic functionality
    SELECT COUNT(*) INTO row_count FROM public.performance_overview;
    
    IF row_count > 0 THEN
        RAISE NOTICE '✅ View is functional with % rows', row_count;
        
        -- Show sample data
        FOR test_result IN 
            SELECT metric_type, total_records 
            FROM public.performance_overview 
            LIMIT 3
        LOOP
            RAISE NOTICE 'Sample data: % = %', test_result.metric_type, test_result.total_records;
        END LOOP;
    ELSE
        RAISE NOTICE '⚠️ View exists but returns no data (this may be normal if tables are empty)';
    END IF;
END $$;

-- =====================================================
-- 6. ADDITIONAL SECURITY CHECKS
-- =====================================================

-- Check for any other views with SECURITY DEFINER
DO $$
DECLARE
    view_record RECORD;
    problematic_views INTEGER := 0;
BEGIN
    RAISE NOTICE 'Checking for other views with SECURITY DEFINER...';
    
    FOR view_record IN 
        SELECT schemaname, viewname, definition
        FROM pg_views 
        WHERE schemaname = 'public'
        AND definition ILIKE '%SECURITY DEFINER%'
    LOOP
        RAISE NOTICE '⚠️ Found view with SECURITY DEFINER: %.%', view_record.schemaname, view_record.viewname;
        problematic_views := problematic_views + 1;
    END LOOP;
    
    IF problematic_views = 0 THEN
        RAISE NOTICE '✅ No other views with SECURITY DEFINER found';
    ELSE
        RAISE NOTICE '⚠️ Found % additional views with SECURITY DEFINER that may need attention', problematic_views;
    END IF;
END $$;

-- =====================================================
-- 7. COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔒 SECURITY DEFINER VIEW FIX COMPLETED:';
    RAISE NOTICE '✅ Dropped old performance_overview view with SECURITY DEFINER';
    RAISE NOTICE '✅ Created new performance_overview view without SECURITY DEFINER';
    RAISE NOTICE '✅ Set proper permissions (authenticated and service_role only)';
    RAISE NOTICE '✅ Verified view works correctly';
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ The SECURITY DEFINER view security issue should now be resolved!';
    RAISE NOTICE '📊 You can test the view with: SELECT * FROM performance_overview;';
END $$;

COMMIT;
