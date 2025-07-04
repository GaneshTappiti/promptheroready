-- =====================================================
-- PROMPTHEROREADY DATABASE SETUP VERIFICATION
-- =====================================================
-- Run this script after setting up your database to verify everything works
-- Copy and paste this into your Supabase SQL Editor and click "Run"

-- Test 1: Check if all essential tables exist
DO $$
DECLARE
    missing_tables TEXT[] := '{}';
    essential_tables TEXT[] := ARRAY[
        'user_profiles',
        'user_onboarding_profiles',
        'user_ai_preferences',
        'ideas',
        'mvps',
        'prompt_history',
        'ai_tools_directory',
        'ai_tools',
        'documents',
        'teams',
        'team_members',
        'messages',
        'projects',
        'tasks',
        'admin_users',
        'admin_roles'
    ];
    current_table TEXT;
    table_exists BOOLEAN;
BEGIN
    RAISE NOTICE '🔍 Testing Database Setup...';
    RAISE NOTICE '';

    -- Check each essential table
    FOREACH current_table IN ARRAY essential_tables
    LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = current_table
        ) INTO table_exists;

        IF NOT table_exists THEN
            missing_tables := array_append(missing_tables, current_table);
        END IF;
    END LOOP;

    -- Report results
    IF array_length(missing_tables, 1) IS NULL THEN
        RAISE NOTICE '✅ All essential tables exist (%)', array_length(essential_tables, 1);
    ELSE
        RAISE NOTICE '❌ Missing tables: %', array_to_string(missing_tables, ', ');
    END IF;
END $$;

-- Test 2: Check AI tools directory
DO $$
DECLARE
    tools_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tools_count FROM ai_tools_directory;
    
    IF tools_count > 0 THEN
        RAISE NOTICE '✅ AI Tools Directory populated (% tools)', tools_count;
    ELSE
        RAISE NOTICE '❌ AI Tools Directory is empty';
    END IF;
END $$;

-- Test 3: Check admin system
DO $$
DECLARE
    admin_count INTEGER;
    roles_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM admin_users;
    SELECT COUNT(*) INTO roles_count FROM admin_roles;
    
    RAISE NOTICE '✅ Admin system ready (% users, % roles)', admin_count, roles_count;
END $$;

-- Test 4: Check RLS policies
DO $$
DECLARE
    policies_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policies_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    IF policies_count > 0 THEN
        RAISE NOTICE '✅ Row Level Security policies active (% policies)', policies_count;
    ELSE
        RAISE NOTICE '⚠️  No RLS policies found';
    END IF;
END $$;

-- Test 5: Check indexes
DO $$
DECLARE
    indexes_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO indexes_count 
    FROM pg_indexes 
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';
    
    IF indexes_count > 0 THEN
        RAISE NOTICE '✅ Performance indexes created (% indexes)', indexes_count;
    ELSE
        RAISE NOTICE '⚠️  No performance indexes found';
    END IF;
END $$;

-- Test 6: Check functions
DO $$
DECLARE
    functions_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO functions_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION';
    
    IF functions_count > 0 THEN
        RAISE NOTICE '✅ Helper functions created (% functions)', functions_count;
    ELSE
        RAISE NOTICE '⚠️  No helper functions found';
    END IF;
END $$;

-- Final summary
DO $$
DECLARE
    total_tables INTEGER;
    total_functions INTEGER;
    total_policies INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tables
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    SELECT COUNT(*) INTO total_functions
    FROM information_schema.routines 
    WHERE routine_schema = 'public';
    
    SELECT COUNT(*) INTO total_policies
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 Database Setup Summary:';
    RAISE NOTICE '   • Tables: %', total_tables;
    RAISE NOTICE '   • Functions: %', total_functions;
    RAISE NOTICE '   • Security Policies: %', total_policies;
    RAISE NOTICE '';
    
    IF total_tables >= 40 AND total_functions >= 5 AND total_policies >= 10 THEN
        RAISE NOTICE '🎉 Database setup is COMPLETE and ready!';
        RAISE NOTICE '';
        RAISE NOTICE '✅ Next Steps:';
        RAISE NOTICE '   1. Set up your admin user: SELECT setup_admin_user(''your-email@domain.com'');';
        RAISE NOTICE '   2. Test your application connection';
        RAISE NOTICE '   3. Visit /admin to access the admin panel';
    ELSE
        RAISE NOTICE '⚠️  Database setup may be incomplete';
        RAISE NOTICE '   Please ensure you ran both clean_schema.sql and complete-setup.sql';
    END IF;
    
    RAISE NOTICE '';
END $$;
