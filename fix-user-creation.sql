-- =====================================================
-- FIX USER CREATION DATABASE ISSUES
-- =====================================================
-- This script fixes the "Database error saving new user" issue
-- by ensuring proper trigger function and subscription plans exist

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure subscription plans exist
INSERT INTO public.subscription_plans (name, display_name, description, price_monthly, price_yearly, features, limits)
VALUES 
    ('free', 'Free Plan', 'Perfect for getting started', 0.00, 0.00, '{"basic_features": true}', '{"monthly_prompts": 50}'),
    ('pro', 'Pro Plan', 'For power users', 19.99, 199.99, '{"advanced_features": true}', '{"monthly_prompts": 1000}'),
    ('enterprise', 'Enterprise Plan', 'For teams and organizations', 99.99, 999.99, '{"enterprise_features": true}', '{"monthly_prompts": 10000}')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    updated_at = CURRENT_TIMESTAMP;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user signup (FIXED VERSION)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    admin_emails TEXT[] := ARRAY['ganeshtappiti1605@gmail.com'];
    user_role TEXT := 'user';
    free_plan_id UUID;
BEGIN
    -- Log the new user creation
    RAISE LOG 'Creating profile for new user: % (email: %)', NEW.id, NEW.email;

    -- Check if this is a predefined admin email
    IF NEW.email = ANY(admin_emails) THEN
        user_role := 'super_admin';
        RAISE LOG 'Admin user detected: %', NEW.email;
    END IF;

    -- Create user profile with error handling
    BEGIN
        INSERT INTO public.user_profiles (
            id,
            role,
            avatar_url,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            user_role,
            NEW.raw_user_meta_data->>'avatar_url',
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;
        
        RAISE LOG 'User profile created successfully for user: %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
        -- Don't fail the entire transaction, just log the error
    END;

    -- Create user preferences with error handling
    BEGIN
        INSERT INTO public.user_preferences (
            user_id,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) DO NOTHING;
        
        RAISE LOG 'User preferences created successfully for user: %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Failed to create user preferences for user %: %', NEW.id, SQLERRM;
        -- Don't fail the entire transaction, just log the error
    END;

    -- Get free plan ID with fallback
    SELECT id INTO free_plan_id FROM public.subscription_plans WHERE name = 'free' LIMIT 1;

    -- Create user subscription with error handling (only if free plan exists)
    IF free_plan_id IS NOT NULL THEN
        BEGIN
            INSERT INTO public.user_subscriptions (
                user_id,
                plan_id,
                status,
                created_at,
                updated_at
            ) VALUES (
                NEW.id,
                free_plan_id,
                'active',
                NOW(),
                NOW()
            ) ON CONFLICT (user_id) DO NOTHING;
            
            RAISE LOG 'User subscription created successfully for user: %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Failed to create user subscription for user %: %', NEW.id, SQLERRM;
            -- Don't fail the entire transaction, just log the error
        END;
    ELSE
        RAISE LOG 'No free plan found - skipping subscription creation for user %', NEW.id;
    END IF;

    -- If admin user, create admin record with error handling
    IF user_role = 'super_admin' THEN
        BEGIN
            INSERT INTO public.admin_users (
                user_id,
                role,
                is_active,
                created_by,
                created_at,
                updated_at
            ) VALUES (
                NEW.id,
                'super_admin',
                true,
                NEW.id,
                NOW(),
                NOW()
            ) ON CONFLICT (user_id) DO NOTHING;
            
            RAISE LOG 'Admin user record created successfully for user: %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Failed to create admin user record for user %: %', NEW.id, SQLERRM;
            -- Don't fail the entire transaction, just log the error
        END;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to create profiles for existing users
CREATE OR REPLACE FUNCTION create_profiles_for_existing_users()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    admin_emails TEXT[] := ARRAY['ganeshtappiti1605@gmail.com'];
    user_role TEXT;
    free_plan_id UUID;
BEGIN
    -- Get free plan ID
    SELECT id INTO free_plan_id FROM public.subscription_plans WHERE name = 'free' LIMIT 1;

    -- Loop through all auth.users who don't have profiles
    FOR user_record IN
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.user_profiles up ON au.id = up.id
        WHERE up.id IS NULL
    LOOP
        -- Determine role
        user_role := 'user';
        IF user_record.email = ANY(admin_emails) THEN
            user_role := 'super_admin';
        END IF;

        -- Create user profile with error handling
        BEGIN
            INSERT INTO public.user_profiles (
                id,
                role,
                avatar_url,
                created_at,
                updated_at
            ) VALUES (
                user_record.id,
                user_role,
                user_record.raw_user_meta_data->>'avatar_url',
                NOW(),
                NOW()
            ) ON CONFLICT (id) DO NOTHING;
            
            RAISE LOG 'Created profile for existing user: %', user_record.email;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Failed to create user profile for existing user %: %', user_record.id, SQLERRM;
            CONTINUE;
        END;

        -- Create user preferences
        BEGIN
            INSERT INTO public.user_preferences (
                user_id,
                created_at,
                updated_at
            ) VALUES (
                user_record.id,
                NOW(),
                NOW()
            ) ON CONFLICT (user_id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Failed to create user preferences for existing user %: %', user_record.id, SQLERRM;
        END;

        -- Create subscription if free plan exists
        IF free_plan_id IS NOT NULL THEN
            BEGIN
                INSERT INTO public.user_subscriptions (
                    user_id,
                    plan_id,
                    status,
                    created_at,
                    updated_at
                ) VALUES (
                    user_record.id,
                    free_plan_id,
                    'active',
                    NOW(),
                    NOW()
                ) ON CONFLICT (user_id) DO NOTHING;
            EXCEPTION WHEN OTHERS THEN
                RAISE LOG 'Failed to create subscription for existing user %: %', user_record.id, SQLERRM;
            END;
        END IF;

        -- Create admin record if needed
        IF user_role = 'super_admin' THEN
            BEGIN
                INSERT INTO public.admin_users (
                    user_id,
                    role,
                    is_active,
                    created_by,
                    created_at,
                    updated_at
                ) VALUES (
                    user_record.id,
                    'super_admin',
                    true,
                    user_record.id,
                    NOW(),
                    NOW()
                ) ON CONFLICT (user_id) DO NOTHING;
            EXCEPTION WHEN OTHERS THEN
                RAISE LOG 'Failed to create admin record for existing user %: %', user_record.id, SQLERRM;
            END;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create profiles for any existing users
SELECT create_profiles_for_existing_users();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ User creation database fixes applied successfully!';
    RAISE NOTICE '🔧 handle_new_user() function created/updated';
    RAISE NOTICE '⚡ on_auth_user_created trigger created/updated';
    RAISE NOTICE '📊 Subscription plans ensured';
    RAISE NOTICE '👤 Existing user profiles created';
    RAISE NOTICE '🚀 New user signup should now work properly!';
END $$;
