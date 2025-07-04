-- =====================================================
-- DISABLE TRIGGER APPROACH
-- =====================================================
-- This completely disables the problematic trigger
-- and lets the application handle user profile creation

-- Drop the problematic trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_new_user_simple();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🔧 User creation trigger disabled';
    RAISE NOTICE '📝 Application will handle user profile creation';
    RAISE NOTICE '🧪 Test user creation now - should work without database errors';
END $$;
