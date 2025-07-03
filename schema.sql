-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft',
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Workshop validation fields
    validation_score INTEGER,
    market_opportunity TEXT,
    risk_assessment TEXT,
    monetization_strategy TEXT,
    key_features TEXT[],
    next_steps TEXT[],
    competitor_analysis TEXT,
    target_market TEXT,
    problem_statement TEXT
);

-- Prompt history table for storing AI-generated prompts
CREATE TABLE IF NOT EXISTS prompt_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    section TEXT NOT NULL, -- 'ideaforge' or 'mvpStudio'
    section_key TEXT NOT NULL, -- specific section like 'target-user', 'homepage', etc.
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    metadata JSONB, -- Additional data like tools, app_type, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- User settings and subscription info
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    ai_provider TEXT DEFAULT 'gemini',
    api_key TEXT,
    preferred_tools TEXT[],
    budget TEXT DEFAULT 'free',
    skill_level TEXT DEFAULT 'beginner',
    app_type TEXT DEFAULT 'web',
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    settings JSONB, -- Additional settings as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planning',
    tech_stack TEXT[],
    features TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    permissions TEXT[],
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    focus_areas TEXT[],
    investment_range TEXT,
    website TEXT,
    contact_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wiki_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- User AI Preferences Table
CREATE TABLE IF NOT EXISTS user_ai_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

    -- Provider Configuration
    provider TEXT NOT NULL DEFAULT 'gemini' CHECK (provider IN ('openai', 'gemini', 'deepseek', 'claude', 'mistral', 'custom')),
    api_key_encrypted TEXT, -- Encrypted API key
    model_name TEXT, -- Specific model (e.g., 'gpt-4', 'gemini-2.0-flash', 'claude-3-sonnet')
    custom_endpoint TEXT, -- For custom providers

    -- Usage Preferences
    temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
    max_tokens INTEGER DEFAULT 2000 CHECK (max_tokens > 0),

    -- Provider-specific settings (JSON for flexibility)
    provider_settings JSONB DEFAULT '{}',

    -- Usage Tracking
    total_requests INTEGER DEFAULT 0,
    total_tokens_used BIGINT DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,

    -- Status & Health
    connection_status TEXT DEFAULT 'untested' CHECK (connection_status IN ('untested', 'connected', 'error', 'quota_exceeded')),
    last_error TEXT,
    last_test_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teams Table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Team Messages Table (Enhanced for real-time chat)
CREATE TABLE team_messages (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id),
    sender_name VARCHAR NOT NULL,
    content TEXT NOT NULL,
    avatar VARCHAR,
    country VARCHAR DEFAULT 'US',
    is_authenticated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    team_id UUID REFERENCES teams(id),
    is_system_message BOOLEAN DEFAULT FALSE
);

-- Global Messages Table (for the real-time chat feature)
CREATE TABLE messages (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  username VARCHAR NOT NULL,
  text TEXT NOT NULL,
  country VARCHAR,
  is_authenticated BOOLEAN DEFAULT FALSE,
  timestamp timestamp default now() NOT NULL
);

-- Enable real-time for team_messages
ALTER PUBLICATION supabase_realtime ADD TABLE team_messages;

-- Create index for faster message retrieval
CREATE INDEX idx_team_messages_team_id ON team_messages(team_id);
CREATE INDEX idx_team_messages_created_at ON team_messages(created_at);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'trial', 'expired', 'cancelled')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Usage Statistics Table
CREATE TABLE IF NOT EXISTS user_usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    ideas_created INTEGER DEFAULT 0,
    prompts_generated INTEGER DEFAULT 0,
    ai_calls_made INTEGER DEFAULT 0,
    storage_used BIGINT DEFAULT 0, -- in bytes
    reset_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Events Log (for audit trail)
CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment History Table
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    stripe_payment_intent_id TEXT,
    invoice_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_mvps_user_id ON mvps(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_investors_user_id ON investors(user_id);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_user_id ON wiki_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_user_id ON user_ai_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_provider ON user_ai_preferences(provider);
CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_status ON user_ai_preferences(connection_status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ideas_updated_at
    BEFORE UPDATE ON ideas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mvps_updated_at
    BEFORE UPDATE ON mvps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investors_updated_at
    BEFORE UPDATE ON investors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wiki_pages_updated_at
    BEFORE UPDATE ON wiki_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ai_preferences_updated_at
    BEFORE UPDATE ON user_ai_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_preferences ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- Ideas policies
CREATE POLICY "Users can view their own ideas"
    ON ideas FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ideas"
    ON ideas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas"
    ON ideas FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas"
    ON ideas FOR DELETE
    USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view their own tasks"
    ON tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
    ON tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON tasks FOR DELETE
    USING (auth.uid() = user_id);

-- MVPs policies
CREATE POLICY "Users can view their own MVPs"
    ON mvps FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MVPs"
    ON mvps FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MVPs"
    ON mvps FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MVPs"
    ON mvps FOR DELETE
    USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can view their own documents"
    ON documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
    ON documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
    ON documents FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
    ON documents FOR DELETE
    USING (auth.uid() = user_id);

-- Team members policies
CREATE POLICY "Users can view team members"
    ON team_members FOR SELECT
    USING (true);

CREATE POLICY "Users can insert team members"
    ON team_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update team members"
    ON team_members FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete team members"
    ON team_members FOR DELETE
    USING (auth.uid() = user_id);

-- Investors policies
CREATE POLICY "Users can view their own investors"
    ON investors FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investors"
    ON investors FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investors"
    ON investors FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investors"
    ON investors FOR DELETE
    USING (auth.uid() = user_id);

-- Wiki pages policies
CREATE POLICY "Users can view their own wiki pages"
    ON wiki_pages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wiki pages"
    ON wiki_pages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wiki pages"
    ON wiki_pages FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wiki pages"
    ON wiki_pages FOR DELETE
    USING (auth.uid() = user_id);

-- User AI Preferences policies
CREATE POLICY "Users can view their own AI preferences"
    ON user_ai_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI preferences"
    ON user_ai_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI preferences"
    ON user_ai_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI preferences"
    ON user_ai_preferences FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ideas_validation_score ON ideas(validation_score);
CREATE INDEX IF NOT EXISTS idx_ideas_status_category ON ideas(status, category);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);

-- Prompt history indexes
CREATE INDEX IF NOT EXISTS idx_prompt_history_idea_id ON prompt_history(idea_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_user_id ON prompt_history(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_section ON prompt_history(section, section_key);

-- User settings indexes
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_subscription ON user_settings(subscription_tier, subscription_status);

-- Subscription system indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_user_usage_stats_user_id ON user_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

-- Function to increment user usage
CREATE OR REPLACE FUNCTION increment_user_usage(
    user_id UUID,
    action_type TEXT,
    increment_amount INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_usage_stats (user_id, ideas_created, prompts_generated, ai_calls_made)
    VALUES (
        user_id,
        CASE WHEN action_type = 'create_idea' THEN increment_amount ELSE 0 END,
        CASE WHEN action_type = 'generate_prompt' THEN increment_amount ELSE 0 END,
        CASE WHEN action_type = 'make_ai_call' THEN increment_amount ELSE 0 END
    )
    ON CONFLICT (user_id) DO UPDATE SET
        ideas_created = user_usage_stats.ideas_created +
            CASE WHEN action_type = 'create_idea' THEN increment_amount ELSE 0 END,
        prompts_generated = user_usage_stats.prompts_generated +
            CASE WHEN action_type = 'generate_prompt' THEN increment_amount ELSE 0 END,
        ai_calls_made = user_usage_stats.ai_calls_made +
            CASE WHEN action_type = 'make_ai_call' THEN increment_amount ELSE 0 END,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage() RETURNS VOID AS $$
BEGIN
    UPDATE user_usage_stats
    SET
        prompts_generated = 0,
        ai_calls_made = 0,
        reset_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE reset_date < DATE_TRUNC('month', CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check subscription status
CREATE OR REPLACE FUNCTION check_subscription_limits(
    user_id UUID,
    action_type TEXT
) RETURNS JSONB AS $$
DECLARE
    subscription_record user_subscriptions%ROWTYPE;
    usage_record user_usage_stats%ROWTYPE;
    result JSONB;
BEGIN
    -- Get user subscription
    SELECT * INTO subscription_record
    FROM user_subscriptions
    WHERE user_subscriptions.user_id = check_subscription_limits.user_id;

    -- Get user usage
    SELECT * INTO usage_record
    FROM user_usage_stats
    WHERE user_usage_stats.user_id = check_subscription_limits.user_id;

    -- Default to free tier if no subscription
    IF subscription_record IS NULL THEN
        subscription_record.tier := 'free';
        subscription_record.status := 'active';
    END IF;

    -- Check limits based on tier and action
    IF subscription_record.tier = 'free' THEN
        CASE action_type
            WHEN 'create_idea' THEN
                IF COALESCE(usage_record.ideas_created, 0) >= 1 THEN
                    result := jsonb_build_object(
                        'allowed', false,
                        'reason', 'Free tier allows only 1 idea',
                        'upgrade_required', true
                    );
                ELSE
                    result := jsonb_build_object('allowed', true);
                END IF;
            WHEN 'generate_prompt' THEN
                IF COALESCE(usage_record.prompts_generated, 0) >= 10 THEN
                    result := jsonb_build_object(
                        'allowed', false,
                        'reason', 'Free tier allows only 10 prompts per month',
                        'upgrade_required', true
                    );
                ELSE
                    result := jsonb_build_object('allowed', true);
                END IF;
            WHEN 'make_ai_call' THEN
                IF COALESCE(usage_record.ai_calls_made, 0) >= 50 THEN
                    result := jsonb_build_object(
                        'allowed', false,
                        'reason', 'Free tier allows only 50 AI calls per month',
                        'upgrade_required', true
                    );
                ELSE
                    result := jsonb_build_object('allowed', true);
                END IF;
            ELSE
                result := jsonb_build_object('allowed', true);
        END CASE;
    ELSE
        -- Pro and Enterprise tiers have unlimited access
        result := jsonb_build_object('allowed', true);
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS for new tables
ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prompt_history
CREATE POLICY "Users can view their own prompt history"
    ON prompt_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prompt history"
    ON prompt_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompt history"
    ON prompt_history FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompt history"
    ON prompt_history FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
    ON user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
    ON user_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
    ON user_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for user_usage_stats
CREATE POLICY "Users can view their own usage stats"
    ON user_usage_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage stats"
    ON user_usage_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage stats"
    ON user_usage_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for subscription_events
CREATE POLICY "Users can view their own subscription events"
    ON subscription_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription events"
    ON subscription_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payment_history
CREATE POLICY "Users can view their own payment history"
    ON payment_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment history"
    ON payment_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Extended schema for full user journey support

-- Idea Relationships Table (linking ideas to different stages)
CREATE TABLE IF NOT EXISTS idea_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    target_idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('derived_from', 'merged_with', 'split_into', 'inspired_by')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_idea_id, target_idea_id, relationship_type)
);

-- IdeaForge Sessions (tracking user sessions in IdeaForge)
CREATE TABLE IF NOT EXISTS ideaforge_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL CHECK (session_type IN ('wiki', 'blueprint', 'journey', 'feedback')),
    session_data JSONB,
    duration_minutes INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MVP Studio Projects (linking ideas to MVP development)
CREATE TABLE IF NOT EXISTS mvp_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    app_type TEXT CHECK (app_type IN ('web', 'mobile', 'saas', 'desktop', 'api')),
    tech_stack JSONB,
    features JSONB,
    pages JSONB,
    styling JSONB,
    generated_prompts JSONB,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'development', 'testing', 'deployed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Prompt Templates (reusable prompt templates)
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    template_content TEXT NOT NULL,
    variables JSONB, -- Template variables and their types
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Journey Tracking (analytics and progress tracking)
CREATE TABLE IF NOT EXISTS user_journey_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB,
    page_path TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feature Usage Analytics
CREATE TABLE IF NOT EXISTS feature_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, feature_name)
);

-- User Onboarding Progress
CREATE TABLE IF NOT EXISTS user_onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    completed_steps JSONB DEFAULT '[]',
    current_step TEXT,
    onboarding_data JSONB,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Feedback and Support
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feedback_type TEXT CHECK (feedback_type IN ('bug_report', 'feature_request', 'general', 'support')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Collaboration and Sharing
CREATE TABLE IF NOT EXISTS shared_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_level TEXT DEFAULT 'view' CHECK (permission_level IN ('view', 'comment', 'edit')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notification System
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_idea_relationships_source ON idea_relationships(source_idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_relationships_target ON idea_relationships(target_idea_id);
CREATE INDEX IF NOT EXISTS idx_ideaforge_sessions_user_idea ON ideaforge_sessions(user_id, idea_id);
CREATE INDEX IF NOT EXISTS idx_ideaforge_sessions_type ON ideaforge_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_mvp_projects_user_id ON mvp_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_mvp_projects_idea_id ON mvp_projects(idea_id);
CREATE INDEX IF NOT EXISTS idx_mvp_projects_status ON mvp_projects(status);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_user_id ON ai_prompt_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_category ON ai_prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_public ON ai_prompt_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_user_id ON user_journey_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_type ON user_journey_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_created_at ON user_journey_events(created_at);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_name ON feature_usage(feature_name);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_shared_ideas_idea_id ON shared_ideas(idea_id);
CREATE INDEX IF NOT EXISTS idx_shared_ideas_shared_with ON shared_ideas(shared_with);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(read);

-- Enable RLS for new tables
ALTER TABLE idea_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideaforge_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables

-- Idea Relationships policies
CREATE POLICY "Users can view idea relationships for their ideas"
    ON idea_relationships FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM ideas WHERE id = source_idea_id AND user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM ideas WHERE id = target_idea_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can create idea relationships for their ideas"
    ON idea_relationships FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM ideas WHERE id = source_idea_id AND user_id = auth.uid()) AND
        EXISTS (SELECT 1 FROM ideas WHERE id = target_idea_id AND user_id = auth.uid())
    );

-- IdeaForge Sessions policies
CREATE POLICY "Users can view their own ideaforge sessions"
    ON ideaforge_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ideaforge sessions"
    ON ideaforge_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideaforge sessions"
    ON ideaforge_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- MVP Projects policies
CREATE POLICY "Users can view their own mvp projects"
    ON mvp_projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mvp projects"
    ON mvp_projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mvp projects"
    ON mvp_projects FOR UPDATE
    USING (auth.uid() = user_id);

-- AI Prompt Templates policies
CREATE POLICY "Users can view their own and public prompt templates"
    ON ai_prompt_templates FOR SELECT
    USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own prompt templates"
    ON ai_prompt_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompt templates"
    ON ai_prompt_templates FOR UPDATE
    USING (auth.uid() = user_id);

-- User Journey Events policies
CREATE POLICY "Users can view their own journey events"
    ON user_journey_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journey events"
    ON user_journey_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Feature Usage policies
CREATE POLICY "Users can view their own feature usage"
    ON feature_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feature usage"
    ON feature_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feature usage"
    ON feature_usage FOR UPDATE
    USING (auth.uid() = user_id);

-- User Onboarding policies
CREATE POLICY "Users can view their own onboarding"
    ON user_onboarding FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding"
    ON user_onboarding FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding"
    ON user_onboarding FOR UPDATE
    USING (auth.uid() = user_id);

-- User Feedback policies
CREATE POLICY "Users can view their own feedback"
    ON user_feedback FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
    ON user_feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
    ON user_feedback FOR UPDATE
    USING (auth.uid() = user_id);

-- Shared Ideas policies
CREATE POLICY "Users can view ideas shared with them"
    ON shared_ideas FOR SELECT
    USING (auth.uid() = shared_with OR auth.uid() = shared_by);

CREATE POLICY "Users can share their own ideas"
    ON shared_ideas FOR INSERT
    WITH CHECK (
        auth.uid() = shared_by AND
        EXISTS (SELECT 1 FROM ideas WHERE id = idea_id AND user_id = auth.uid())
    );

-- User Notifications policies
CREATE POLICY "Users can view their own notifications"
    ON user_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON user_notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
    ON user_settings FOR DELETE
    USING (auth.uid() = user_id);