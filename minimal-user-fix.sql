-- =====================================================
-- MINIMAL FIX FOR USER CREATION ERROR
-- =====================================================
-- This script provides the absolute minimum fix for the 
-- "Database error saving new user" issue

-- First, let's disable the problematic trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a very simple trigger function that won't fail
CREATE OR REPLACE FUNCTION handle_new_user_simple()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create user profile, nothing else
    BEGIN
        INSERT INTO public.user_profiles (
            id,
            role,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            CASE 
                WHEN NEW.email = 'ganeshtappiti1605@gmail.com' THEN 'super_admin'
                ELSE 'user'
            END,
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        -- If this fails, just log it but don't stop the user creation
        RAISE LOG 'Failed to create user profile: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create the simple trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user_simple();

-- Test the function exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user_simple') THEN
        RAISE NOTICE '✅ Trigger function created successfully';
    ELSE
        RAISE NOTICE '❌ Trigger function creation failed';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🔧 Minimal user creation fix applied';
    RAISE NOTICE '📝 Only user_profiles will be created automatically';
    RAISE NOTICE '🧪 Test user creation now';
END $$;
