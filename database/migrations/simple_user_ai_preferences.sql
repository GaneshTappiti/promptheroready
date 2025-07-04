-- Simple User AI Preferences Table Setup
-- This script safely creates or updates the user_ai_preferences table

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if it exists (for clean setup)
-- Comment out this line if you want to preserve existing data
-- DROP TABLE IF EXISTS user_ai_preferences;

-- Create the table with proper structure
CREATE TABLE IF NOT EXISTS user_ai_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    provider TEXT NOT NULL,
    api_key_encrypted TEXT,
    model_name TEXT,
    custom_endpoint TEXT,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2000,
    provider_settings JSONB DEFAULT '{}',
    connection_status TEXT DEFAULT 'untested' CHECK (connection_status IN ('untested', 'connected', 'error', 'quota_exceeded')),
    last_error TEXT,
    last_test_at TIMESTAMP WITH TIME ZONE,
    total_requests INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to auth.users if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_ai_preferences_user_id_fkey'
    ) THEN
        ALTER TABLE user_ai_preferences 
        ADD CONSTRAINT user_ai_preferences_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_user_id ON user_ai_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_provider ON user_ai_preferences(provider);
CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_connection_status ON user_ai_preferences(connection_status);
CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_last_used_at ON user_ai_preferences(last_used_at);

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_ai_preferences_updated_at ON user_ai_preferences;
CREATE TRIGGER update_user_ai_preferences_updated_at
    BEFORE UPDATE ON user_ai_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_ai_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own AI preferences" ON user_ai_preferences;
DROP POLICY IF EXISTS "Users can insert their own AI preferences" ON user_ai_preferences;
DROP POLICY IF EXISTS "Users can update their own AI preferences" ON user_ai_preferences;
DROP POLICY IF EXISTS "Users can delete their own AI preferences" ON user_ai_preferences;
DROP POLICY IF EXISTS "Users can manage their own AI preferences" ON user_ai_preferences;

-- Create comprehensive RLS policy
CREATE POLICY "Users can manage their own AI preferences" ON user_ai_preferences
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant table permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON user_ai_preferences TO authenticated;

-- Grant sequence permissions safely
DO $$
DECLARE
    seq_name TEXT;
BEGIN
    -- Get the actual sequence name
    SELECT pg_get_serial_sequence('user_ai_preferences', 'id') INTO seq_name;
    
    -- Grant permissions if sequence exists
    IF seq_name IS NOT NULL THEN
        EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO authenticated', seq_name);
    ELSE
        -- If no sequence found, try common naming patterns
        BEGIN
            GRANT USAGE, SELECT ON SEQUENCE user_ai_preferences_id_seq TO authenticated;
        EXCEPTION WHEN undefined_table THEN
            -- Sequence doesn't exist or has different name, that's okay
            NULL;
        END;
    END IF;
END $$;

-- Verify the table was created successfully
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_ai_preferences') THEN
        RAISE NOTICE 'SUCCESS: user_ai_preferences table is ready!';
    ELSE
        RAISE EXCEPTION 'FAILED: user_ai_preferences table was not created';
    END IF;
END $$;
