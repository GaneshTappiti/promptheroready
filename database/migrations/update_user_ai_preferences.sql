-- Migration: Update user_ai_preferences table structure
-- This migration updates the table to match the application requirements

-- First, check if the table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS user_ai_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
    -- Add model_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_ai_preferences' AND column_name = 'model_name') THEN
        ALTER TABLE user_ai_preferences ADD COLUMN model_name TEXT;
    END IF;

    -- Add custom_endpoint column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_ai_preferences' AND column_name = 'custom_endpoint') THEN
        ALTER TABLE user_ai_preferences ADD COLUMN custom_endpoint TEXT;
    END IF;

    -- Add temperature column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_ai_preferences' AND column_name = 'temperature') THEN
        ALTER TABLE user_ai_preferences ADD COLUMN temperature DECIMAL(3,2) DEFAULT 0.7;
    END IF;

    -- Add max_tokens column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_ai_preferences' AND column_name = 'max_tokens') THEN
        ALTER TABLE user_ai_preferences ADD COLUMN max_tokens INTEGER DEFAULT 2000;
    END IF;

    -- Add provider_settings column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_ai_preferences' AND column_name = 'provider_settings') THEN
        ALTER TABLE user_ai_preferences ADD COLUMN provider_settings JSONB DEFAULT '{}';
    END IF;

    -- Add connection_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_ai_preferences' AND column_name = 'connection_status') THEN
        ALTER TABLE user_ai_preferences ADD COLUMN connection_status TEXT DEFAULT 'untested';
        ALTER TABLE user_ai_preferences ADD CONSTRAINT check_connection_status CHECK (connection_status IN ('untested', 'connected', 'error', 'quota_exceeded'));
    END IF;

    -- Add last_error column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_ai_preferences' AND column_name = 'last_error') THEN
        ALTER TABLE user_ai_preferences ADD COLUMN last_error TEXT;
    END IF;

    -- Add last_test_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_ai_preferences' AND column_name = 'last_test_at') THEN
        ALTER TABLE user_ai_preferences ADD COLUMN last_test_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add total_requests column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_ai_preferences' AND column_name = 'total_requests') THEN
        ALTER TABLE user_ai_preferences ADD COLUMN total_requests INTEGER DEFAULT 0;
    END IF;

    -- Add total_tokens_used column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_ai_preferences' AND column_name = 'total_tokens_used') THEN
        ALTER TABLE user_ai_preferences ADD COLUMN total_tokens_used INTEGER DEFAULT 0;
    END IF;

    -- Add last_used_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_ai_preferences' AND column_name = 'last_used_at') THEN
        ALTER TABLE user_ai_preferences ADD COLUMN last_used_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Ensure is_active column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_ai_preferences' AND column_name = 'is_active') THEN
        ALTER TABLE user_ai_preferences ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Update the unique constraint to be on user_id only (one provider per user for now)
DO $$
BEGIN
    -- Drop old constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_ai_preferences_user_id_provider_key') THEN
        ALTER TABLE user_ai_preferences DROP CONSTRAINT user_ai_preferences_user_id_provider_key;
    END IF;
    
    -- Add unique constraint on user_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_ai_preferences_user_id_key') THEN
        ALTER TABLE user_ai_preferences ADD CONSTRAINT user_ai_preferences_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_user_id ON user_ai_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_provider ON user_ai_preferences(provider);
CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_connection_status ON user_ai_preferences(connection_status);
CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_last_used_at ON user_ai_preferences(last_used_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_user_ai_preferences_updated_at ON user_ai_preferences;
CREATE TRIGGER update_user_ai_preferences_updated_at
    BEFORE UPDATE ON user_ai_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_ai_preferences TO authenticated;

-- Grant sequence permissions (handle different possible sequence names)
DO $$
DECLARE
    seq_name TEXT;
BEGIN
    -- Find the sequence name for the id column
    SELECT pg_get_serial_sequence('user_ai_preferences', 'id') INTO seq_name;

    -- If sequence exists, grant permissions
    IF seq_name IS NOT NULL THEN
        EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO authenticated', seq_name);
    END IF;
END $$;

-- Enable RLS (Row Level Security)
ALTER TABLE user_ai_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own AI preferences" ON user_ai_preferences;
CREATE POLICY "Users can view their own AI preferences" ON user_ai_preferences
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own AI preferences" ON user_ai_preferences;
CREATE POLICY "Users can insert their own AI preferences" ON user_ai_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own AI preferences" ON user_ai_preferences;
CREATE POLICY "Users can update their own AI preferences" ON user_ai_preferences
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own AI preferences" ON user_ai_preferences;
CREATE POLICY "Users can delete their own AI preferences" ON user_ai_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Migration complete
SELECT 'user_ai_preferences table migration completed successfully' AS status;
