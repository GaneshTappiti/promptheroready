-- =====================================================
-- PROMPTHEROREADY - COMPLETE DATABASE SETUP
-- =====================================================
-- This file sets up the complete database schema for PromptHeroReady
-- including all tables, policies, functions, and initial data
--
-- Features included:
-- - User management and authentication
-- - Application core (ideas, MVPs, documents)
-- - Team collaboration and messaging
-- - Project management and tasks
-- - Business features (investors, funding, pitches)
-- - Admin panel and system management
-- - AI tools directory and recommendations
-- - Performance optimizations
-- - Security policies and audit logging
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- =====================================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (COALESCE(first_name || ' ' || last_name, first_name, last_name)) STORED,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    location TEXT,
    company TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User onboarding profiles
CREATE TABLE IF NOT EXISTS user_onboarding_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type TEXT NOT NULL,
    building_goal TEXT,
    experience_level TEXT,
    ai_provider TEXT,
    ai_configured BOOLEAN DEFAULT false,
    ui_style TEXT DEFAULT 'modern',
    theme TEXT DEFAULT 'system',
    output_format TEXT DEFAULT 'structured',
    discovery_source TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    completed_steps TEXT[] DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User AI preferences and API keys (encrypted)
CREATE TABLE IF NOT EXISTS user_ai_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    api_key_encrypted TEXT,
    model_preferences JSONB DEFAULT '{}',
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    usage_stats JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider)
);

-- User preferences (UI, notifications, etc.)
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    ui_preferences JSONB DEFAULT '{}',
    accessibility_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. SUBSCRIPTION & BILLING MANAGEMENT
-- =====================================================

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) DEFAULT 0,
    price_yearly DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    features JSONB DEFAULT '{}',
    limits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    trial_end TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usage tracking for subscription limits
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('month', CURRENT_TIMESTAMP),
    period_end TIMESTAMP WITH TIME ZONE DEFAULT (date_trunc('month', CURRENT_TIMESTAMP) + INTERVAL '1 month'),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, resource_type, period_start)
);

-- =====================================================
-- 3. APPLICATION CORE - IDEAS & CONTENT
-- =====================================================

-- Ideas table (core entity)
CREATE TABLE IF NOT EXISTS ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    validation_score INTEGER CHECK (validation_score >= 0 AND validation_score <= 100),
    market_opportunity TEXT,
    risk_assessment TEXT,
    monetization_strategy TEXT,
    key_features TEXT[] DEFAULT '{}',
    next_steps TEXT[] DEFAULT '{}',
    competitor_analysis TEXT,
    target_market TEXT,
    problem_statement TEXT,
    solution_overview TEXT,
    is_public BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wiki pages for ideas
CREATE TABLE IF NOT EXISTS wiki_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    content_type TEXT DEFAULT 'markdown' CHECK (content_type IN ('markdown', 'html', 'plain')),
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_page_id UUID REFERENCES wiki_pages(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Journey entries (timeline/diary)
CREATE TABLE IF NOT EXISTS journey_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    entry_type TEXT DEFAULT 'reflection' CHECK (entry_type IN ('milestone', 'reflection', 'challenge', 'insight', 'update')),
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    tags TEXT[] DEFAULT '{}',
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT false,
    attachments TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feedback items for validation
CREATE TABLE IF NOT EXISTS feedback_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    feedback_type TEXT DEFAULT 'general' CHECK (feedback_type IN ('validation', 'feature', 'market', 'technical', 'design', 'general')),        
    source TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'implemented', 'rejected')),
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. MVP STUDIO & PROMPT MANAGEMENT
-- =====================================================

-- MVPs table
CREATE TABLE IF NOT EXISTS mvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'development', 'testing', 'launched', 'paused')),
    tech_stack TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    app_type TEXT,
    target_platforms TEXT[] DEFAULT '{}',
    estimated_timeline TEXT,
    budget_range TEXT,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prompt history for AI interactions
CREATE TABLE IF NOT EXISTS prompt_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    response_text TEXT,
    prompt_type TEXT,
    ai_provider TEXT,
    model_used TEXT,
    tokens_used INTEGER DEFAULT 0,
    cost_usd DECIMAL(10,4) DEFAULT 0,
    execution_time_ms INTEGER,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    mvp_id UUID REFERENCES mvps(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI tools directory (unified structure for admin panel and main app)
CREATE TABLE IF NOT EXISTS ai_tools_directory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    url TEXT,
    pricing_model TEXT CHECK (pricing_model IN ('free', 'paid', 'freemium')),
    pricing_inr TEXT,
    is_recommended BOOLEAN DEFAULT false,
    supported_platforms TEXT[] DEFAULT '{}',
    input_types TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    last_verified_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Additional fields for compatibility with static data
    features TEXT[] DEFAULT '{}',
    best_for TEXT[] DEFAULT '{}',
    popularity_score INTEGER DEFAULT 50,
    logo_url TEXT,
    api_compatible BOOLEAN DEFAULT false,
    why_recommend TEXT,
    use_cases TEXT[] DEFAULT '{}',
    pricing_details TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Legacy ai_tools table for backward compatibility (can be removed after migration)
CREATE TABLE IF NOT EXISTS ai_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    website_url TEXT,
    pricing_model TEXT,
    price_inr DECIMAL(10,2),
    price_usd DECIMAL(10,2),
    platforms TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    best_for TEXT[] DEFAULT '{}',
    popularity_score INTEGER DEFAULT 0,
    is_recommended BOOLEAN DEFAULT false,
    logo_url TEXT,
    screenshots TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    last_verified_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. DOCUMENTS & CONTENT MANAGEMENT
-- =====================================================

-- Documents for Docs & Decks
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    document_type TEXT NOT NULL CHECK (document_type IN ('pitch_deck', 'business_plan', 'technical_doc', 'marketing_doc', 'legal_doc', 'other')),
    format TEXT DEFAULT 'markdown' CHECK (format IN ('markdown', 'html', 'json', 'pdf', 'docx')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    template_id UUID,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1,
    file_url TEXT,
    file_size INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Document templates
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    document_type TEXT NOT NULL,
    template_content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. TEAM COLLABORATION
-- =====================================================

-- Teams
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    is_public BOOLEAN DEFAULT false,
    max_members INTEGER DEFAULT 10,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    invited_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(team_id, user_id)
);

-- Team tasks
CREATE TABLE IF NOT EXISTS team_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES auth.users(id),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team messages (chat)
CREATE TABLE IF NOT EXISTS team_messages (
    id BIGSERIAL PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) <= 2000),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    reply_to BIGINT REFERENCES team_messages(id),
    attachments TEXT[] DEFAULT '{}',
    reactions JSONB DEFAULT '{}',
    is_edited BOOLEAN DEFAULT false,
    is_system_message BOOLEAN DEFAULT false,
    avatar TEXT,
    country TEXT,
    is_authenticated BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Global messages (public chat)
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    text TEXT NOT NULL CHECK (char_length(text) <= 1000),
    country TEXT DEFAULT 'Unknown',
    is_authenticated BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    avatar TEXT,
    reactions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team meetings
CREATE TABLE IF NOT EXISTS team_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_url TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    attendees UUID[] DEFAULT '{}',
    agenda TEXT,
    notes TEXT,
    recording_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. PROJECT MANAGEMENT
-- =====================================================

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    currency TEXT DEFAULT 'USD',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks (project tasks)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id),
    parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    completed_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project phases
CREATE TABLE IF NOT EXISTS project_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    phase_order INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold')),
    deliverables TEXT[] DEFAULT '{}',
    success_criteria TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, phase_order)
);

-- Phase tasks (tasks within project phases)
CREATE TABLE IF NOT EXISTS phase_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    phase_id UUID REFERENCES project_phases(id) ON DELETE CASCADE,
    task_order INTEGER,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'cancelled')),
    assigned_to UUID REFERENCES auth.users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    dependencies UUID[] DEFAULT '{}',
    deliverables TEXT[] DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. BUSINESS & INVESTOR FEATURES
-- =====================================================

-- Investors directory
CREATE TABLE IF NOT EXISTS investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('angel', 'vc', 'corporate', 'government', 'crowdfunding', 'accelerator')),
    focus_areas TEXT[] DEFAULT '{}',
    investment_range_min DECIMAL(15,2),
    investment_range_max DECIMAL(15,2),
    currency TEXT DEFAULT 'USD',
    stage_focus TEXT[] DEFAULT '{}',
    geographic_focus TEXT[] DEFAULT '{}',
    website TEXT,
    linkedin_url TEXT,
    contact_info JSONB DEFAULT '{}',
    portfolio_companies TEXT[] DEFAULT '{}',
    investment_criteria TEXT,
    last_activity_date DATE,
    is_active BOOLEAN DEFAULT true,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Funding rounds
CREATE TABLE IF NOT EXISTS funding_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    round_type TEXT NOT NULL CHECK (round_type IN ('pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'bridge', 'ipo')),
    target_amount DECIMAL(15,2) NOT NULL,
    raised_amount DECIMAL(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    valuation_pre DECIMAL(15,2),
    valuation_post DECIMAL(15,2),
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'closed', 'cancelled')),
    start_date DATE,
    close_date DATE,
    lead_investor_id UUID REFERENCES investors(id),
    participating_investors UUID[] DEFAULT '{}',
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pitch_deck_id UUID REFERENCES documents(id),
    terms_sheet TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pitch scripts
CREATE TABLE IF NOT EXISTS pitch_scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    script_type TEXT DEFAULT 'elevator' CHECK (script_type IN ('elevator', 'demo', 'investor', 'customer', 'product', 'competition')),
    duration_minutes INTEGER,
    target_audience TEXT,
    key_points TEXT[] DEFAULT '{}',
    call_to_action TEXT,
    version INTEGER DEFAULT 1,
    is_template BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pitch decks
CREATE TABLE IF NOT EXISTS pitch_decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    deck_type TEXT DEFAULT 'investor' CHECK (deck_type IN ('investor', 'customer', 'demo', 'competition', 'internal')),
    slides_content JSONB NOT NULL,
    template_id UUID,
    total_slides INTEGER DEFAULT 0,
    presentation_duration INTEGER,
    file_url TEXT,
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pitch videos
CREATE TABLE IF NOT EXISTS pitch_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    video_type TEXT DEFAULT 'pitch' CHECK (video_type IN ('pitch', 'demo', 'testimonial', 'explainer')),
    quality TEXT DEFAULT 'hd' CHECK (quality IN ('sd', 'hd', '4k')),
    file_size_mb DECIMAL(10,2),
    transcript TEXT,
    is_public BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 9. SYSTEM & ADMIN FEATURES
-- =====================================================

-- Admin roles
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table (for application compatibility)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- User admin roles (junction table)
CREATE TABLE IF NOT EXISTS user_admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES admin_roles(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, role_id)
);

-- System announcements
CREATE TABLE IF NOT EXISTS system_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    announcement_type TEXT DEFAULT 'info' CHECK (announcement_type IN ('info', 'warning', 'success', 'error', 'maintenance')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'free_users', 'paid_users', 'admins')),
    is_active BOOLEAN DEFAULT true,
    show_until TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prompt templates (system-wide)
CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    tags TEXT[] DEFAULT '{}',
    use_case TEXT,
    output_type TEXT,
    variables JSONB DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 10. SYSTEM MONITORING & ANALYTICS
-- =====================================================

-- Security audit log
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User activity tracking
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System metrics
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_type TEXT DEFAULT 'counter' CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
    tags JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI provider usage tracking
CREATE TABLE IF NOT EXISTS ai_provider_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    model TEXT,
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    cost_usd DECIMAL(10,4) DEFAULT 0,
    request_type TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT DEFAULT 'info' CHECK (notification_type IN ('info', 'success', 'warning', 'error')),
    category TEXT,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    action_text TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- File attachments
CREATE TABLE IF NOT EXISTS file_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    file_hash TEXT,
    upload_type TEXT DEFAULT 'user' CHECK (upload_type IN ('user', 'system', 'temp')),
    resource_type TEXT,
    resource_id UUID,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 11. INDEXES FOR PERFORMANCE
-- =====================================================

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_type ON user_onboarding_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_provider ON user_ai_preferences(provider);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_resource ON usage_tracking(user_id, resource_type, period_start);

-- Ideas and content indexes
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_tags ON ideas USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_idea_id ON wiki_pages(idea_id);
CREATE INDEX IF NOT EXISTS idx_journey_entries_idea_id ON journey_entries(idea_id);
CREATE INDEX IF NOT EXISTS idx_feedback_items_idea_id ON feedback_items(idea_id);
CREATE INDEX IF NOT EXISTS idx_feedback_items_status ON feedback_items(status);

-- MVP and prompts indexes
CREATE INDEX IF NOT EXISTS idx_mvps_idea_id ON mvps(idea_id);
CREATE INDEX IF NOT EXISTS idx_mvps_status ON mvps(status);
CREATE INDEX IF NOT EXISTS idx_prompt_history_user_id ON prompt_history(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_mvp_id ON prompt_history(mvp_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_created_at ON prompt_history(created_at DESC);
-- AI Tools Directory indexes
CREATE INDEX IF NOT EXISTS idx_ai_tools_directory_category ON ai_tools_directory(category);
CREATE INDEX IF NOT EXISTS idx_ai_tools_directory_pricing_model ON ai_tools_directory(pricing_model);
CREATE INDEX IF NOT EXISTS idx_ai_tools_directory_recommended ON ai_tools_directory(is_recommended);
CREATE INDEX IF NOT EXISTS idx_ai_tools_directory_popularity ON ai_tools_directory(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tools_directory_created_by ON ai_tools_directory(created_by);

-- Legacy ai_tools indexes (for backward compatibility)
CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_ai_tools_pricing_model ON ai_tools(pricing_model);

-- Team and collaboration indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_tasks_team_id ON team_tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_team_tasks_assigned_to ON team_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_team_messages_team_id ON team_messages(team_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_created_at ON team_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Project management indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_project_phases_project_id ON project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_phase_tasks_phase_id ON phase_tasks(phase_id);

-- Business features indexes
CREATE INDEX IF NOT EXISTS idx_investors_type ON investors(type);
CREATE INDEX IF NOT EXISTS idx_investors_user_id ON investors(user_id);
CREATE INDEX IF NOT EXISTS idx_funding_rounds_idea_id ON funding_rounds(idea_id);
CREATE INDEX IF NOT EXISTS idx_funding_rounds_status ON funding_rounds(status);
CREATE INDEX IF NOT EXISTS idx_pitch_scripts_user_id ON pitch_scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_user_id ON pitch_decks(user_id);

-- System and monitoring indexes
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_file_attachments_user_id ON file_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_resource ON file_attachments(resource_type, resource_id);

-- Admin indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all user-specific tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- AI Tools Directory - Public read access, admin write access
ALTER TABLE ai_tools_directory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can insert their own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can update their own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can delete their own ideas" ON ideas;
DROP POLICY IF EXISTS "Team members can view team data" ON team_messages;
DROP POLICY IF EXISTS "Team members can insert team messages" ON team_messages;
DROP POLICY IF EXISTS "Admins can manage prompt templates" ON prompt_templates;
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can view their own admin record" ON admin_users;
DROP POLICY IF EXISTS "Users can update their own admin record" ON admin_users;
DROP POLICY IF EXISTS "Allow admin record creation" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;
DROP POLICY IF EXISTS "Anyone can view AI tools" ON ai_tools_directory;
DROP POLICY IF EXISTS "Admins can manage AI tools" ON ai_tools_directory;
DROP POLICY IF EXISTS "Admins can insert AI tools" ON ai_tools_directory;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (true);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (true);

-- User subscriptions policies
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" ON user_subscriptions
    FOR INSERT WITH CHECK (true);

-- Ideas policies
CREATE POLICY "Users can view their own ideas" ON ideas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ideas" ON ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" ON ideas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas" ON ideas
    FOR DELETE USING (auth.uid() = user_id);

-- Team-based policies
CREATE POLICY "Team members can view team data" ON team_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_id = team_messages.team_id
            AND user_id = auth.uid()
            AND is_active = true
        )
    );

CREATE POLICY "Team members can insert team messages" ON team_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_id = team_messages.team_id
            AND user_id = auth.uid()
            AND is_active = true
        )
    );

-- Admin policies for system tables
CREATE POLICY "Admins can manage prompt templates" ON prompt_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admin users policies (avoid infinite recursion)
CREATE POLICY "Users can view their own admin record" ON admin_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own admin record" ON admin_users
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow admin record creation" ON admin_users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all admin users" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'super_admin'
        )
    );

-- AI Tools Directory policies
CREATE POLICY "Anyone can view AI tools" ON ai_tools_directory
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage AI tools" ON ai_tools_directory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can insert AI tools" ON ai_tools_directory
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- 13. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    admin_emails TEXT[] := ARRAY['ganeshtappiti1605@gmail.com'];
    user_role TEXT := 'user';
    free_plan_id UUID;
BEGIN
    -- Check if this is a predefined admin email
    IF NEW.email = ANY(admin_emails) THEN
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
            NEW.id,
            user_role,
            NEW.raw_user_meta_data->>'avatar_url',
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
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
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Failed to create user preferences for user %: %', NEW.id, SQLERRM;
    END;

    -- Get free plan ID with fallback
    SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'free' LIMIT 1;

    -- Create user subscription with error handling
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
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Failed to create user subscription for user %: %', NEW.id, SQLERRM;
    END;

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
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Failed to create admin user record for user %: %', NEW.id, SQLERRM;
        END;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_ideas_updated_at ON ideas;
DROP TRIGGER IF EXISTS update_mvps_updated_at ON mvps;
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mvps_updated_at BEFORE UPDATE ON mvps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for new user signup (creates profile and related records)
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
    SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'free' LIMIT 1;

    -- Loop through all auth.users who don't have profiles
    FOR user_record IN
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN user_profiles up ON au.id = up.id
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
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Failed to create user profile for existing user %: %', user_record.id, SQLERRM;
            CONTINUE;
        END;

        -- Create user preferences with error handling
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

        -- Create user subscription with error handling
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
            RAISE LOG 'Failed to create user subscription for existing user %: %', user_record.id, SQLERRM;
        END;

        -- If admin user, create admin record
        IF user_role = 'super_admin' THEN
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
        END IF;
    END LOOP;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- =====================================================
-- 14. REAL-TIME SUBSCRIPTIONS
-- =====================================================

-- Enable real-time for collaborative features (ignore errors if already added)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE team_messages;
    EXCEPTION WHEN duplicate_object THEN
        NULL; -- Table already in publication
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    EXCEPTION WHEN duplicate_object THEN
        NULL; -- Table already in publication
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    EXCEPTION WHEN duplicate_object THEN
        NULL; -- Table already in publication
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE user_activity;
    EXCEPTION WHEN duplicate_object THEN
        NULL; -- Table already in publication
    END;
END $$;

-- =====================================================
-- 15. INITIAL DATA SETUP
-- =====================================================

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, limits) VALUES
('free', 'Free Plan', 'Perfect for getting started with your entrepreneurial journey', 0.00, 0.00,
 '{"unlimited_ideas": true, "basic_ai_tools": true, "community_support": true, "workspace_access": true}',
 '{"monthly_prompts": 50, "ai_tools_access": "basic", "team_members": 1, "storage_gb": 1}'),
('pro', 'Pro Plan', 'For serious entrepreneurs ready to scale', 29.99, 299.99,
 '{"unlimited_everything": true, "advanced_ai_tools": true, "priority_support": true, "export_features": true, "team_collaboration": true}',
 '{"monthly_prompts": -1, "ai_tools_access": "full", "team_members": 10, "storage_gb": 50}'),
('enterprise', 'Enterprise Plan', 'For teams and organizations', 99.99, 999.99,
 '{"everything_in_pro": true, "custom_integrations": true, "dedicated_support": true, "sso": true, "advanced_analytics": true}',
 '{"monthly_prompts": -1, "ai_tools_access": "full", "team_members": -1, "storage_gb": 500}')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin roles
INSERT INTO admin_roles (name, description, permissions, is_system_role) VALUES
('super_admin', 'Super Administrator with full system access',
 '{"users": "full", "content": "full", "system": "full", "billing": "full", "analytics": "full"}', true),
('admin', 'Administrator with limited system access',
 '{"users": "read", "content": "moderate", "system": "read", "billing": "read", "analytics": "read"}', true),
('moderator', 'Content moderator',
 '{"users": "read", "content": "moderate", "system": "none", "billing": "none", "analytics": "read"}', true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- PERFORMANCE OPTIMIZATIONS
-- =====================================================

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_username ON messages(username);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mvps_user_id ON mvps(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_user_id ON prompt_history(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

-- Create materialized view for user statistics (privacy-safe)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_stats AS
SELECT
    COUNT(*) as total_users,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_30d,
    COUNT(CASE WHEN last_login_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as active_users_7d
FROM user_profiles;

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_user_stats;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error refreshing materialized views: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- Create function for timezone management
CREATE OR REPLACE FUNCTION get_timezone_names()
RETURNS TEXT[]
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    timezone_array TEXT[];
BEGIN
    SELECT ARRAY(
        SELECT name
        FROM pg_timezone_names
        WHERE name NOT LIKE '%/%/%'
        ORDER BY name
    ) INTO timezone_array;

    RETURN timezone_array;
END;
$$;

-- =====================================================
-- SCHEMA DEPLOYMENT COMPLETE
-- =====================================================

-- Create profiles for any existing users
SELECT create_profiles_for_existing_users();

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '🎉 PromptHeroReady Complete Database Setup deployed successfully!';
    RAISE NOTICE '📊 Total tables created: 43';
    RAISE NOTICE '🔒 Row Level Security enabled on all user tables';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🔄 Real-time subscriptions enabled';
    RAISE NOTICE '🔄 Auto-profile creation enabled for new signups';
    RAISE NOTICE '👤 Existing user profiles created';
    RAISE NOTICE '🚀 Ready for application integration!';
END $$;


