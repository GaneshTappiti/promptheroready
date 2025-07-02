-- Migration: Add Workshop validation fields to ideas table
-- This migration adds fields to support AI-powered idea validation from Workshop

-- Add validation fields to ideas table
DO $$
BEGIN
    -- Add validation_score column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'validation_score') THEN
        ALTER TABLE ideas ADD COLUMN validation_score INTEGER;
        RAISE NOTICE 'Added validation_score column to ideas table';
    END IF;

    -- Add market_opportunity column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'market_opportunity') THEN
        ALTER TABLE ideas ADD COLUMN market_opportunity TEXT;
        RAISE NOTICE 'Added market_opportunity column to ideas table';
    END IF;

    -- Add risk_assessment column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'risk_assessment') THEN
        ALTER TABLE ideas ADD COLUMN risk_assessment TEXT;
        RAISE NOTICE 'Added risk_assessment column to ideas table';
    END IF;

    -- Add monetization_strategy column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'monetization_strategy') THEN
        ALTER TABLE ideas ADD COLUMN monetization_strategy TEXT;
        RAISE NOTICE 'Added monetization_strategy column to ideas table';
    END IF;

    -- Add key_features column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'key_features') THEN
        ALTER TABLE ideas ADD COLUMN key_features TEXT[];
        RAISE NOTICE 'Added key_features column to ideas table';
    END IF;

    -- Add next_steps column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'next_steps') THEN
        ALTER TABLE ideas ADD COLUMN next_steps TEXT[];
        RAISE NOTICE 'Added next_steps column to ideas table';
    END IF;

    -- Add competitor_analysis column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'competitor_analysis') THEN
        ALTER TABLE ideas ADD COLUMN competitor_analysis TEXT;
        RAISE NOTICE 'Added competitor_analysis column to ideas table';
    END IF;

    -- Add target_market column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'target_market') THEN
        ALTER TABLE ideas ADD COLUMN target_market TEXT;
        RAISE NOTICE 'Added target_market column to ideas table';
    END IF;

    -- Add problem_statement column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'problem_statement') THEN
        ALTER TABLE ideas ADD COLUMN problem_statement TEXT;
        RAISE NOTICE 'Added problem_statement column to ideas table';
    END IF;

    RAISE NOTICE 'Workshop validation fields migration completed successfully!';
END $$;

-- Create index for validation_score for better query performance
CREATE INDEX IF NOT EXISTS idx_ideas_validation_score ON ideas(validation_score);

-- Create index for status and category combination
CREATE INDEX IF NOT EXISTS idx_ideas_status_category ON ideas(status, category);

-- Update RLS policies to include new fields (if needed)
-- The existing policies should already cover these fields since they're part of the ideas table
