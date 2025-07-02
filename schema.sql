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

-- Enable RLS for new tables
ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can delete their own settings"
    ON user_settings FOR DELETE
    USING (auth.uid() = user_id);