-- =====================================================
-- AI TOOLS DIRECTORY POPULATION MIGRATION
-- =====================================================
-- This migration populates the ai_tools_directory table with predefined tools
-- from the static aiToolsDatabase.ts file

-- Create a temporary function to populate AI tools
CREATE OR REPLACE FUNCTION populate_ai_tools_directory()
RETURNS void AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the first super admin user ID, or create a system user
    SELECT id INTO admin_user_id 
    FROM user_profiles 
    WHERE role = 'super_admin' 
    LIMIT 1;
    
    -- If no admin user exists, use a system UUID
    IF admin_user_id IS NULL THEN
        admin_user_id := '00000000-0000-0000-0000-000000000000';
    END IF;

    -- Insert predefined AI tools (sample from aiToolsDatabase.ts)
    INSERT INTO ai_tools_directory (
        name, description, category, url, pricing_model, pricing_inr, 
        is_recommended, supported_platforms, input_types, tags,
        features, best_for, popularity_score, api_compatible,
        why_recommend, use_cases, pricing_details, created_by
    ) VALUES
    -- Chatbots & LLMs
    ('ChatGPT Pro', 'Advanced AI assistant with GPT-4o, vision, and web browsing capabilities', 
     'Chatbots', 'https://chat.openai.com', 'paid', '₹1,990/mo',
     true, ARRAY['web', 'api'], ARRAY['Text', 'Code'], ARRAY['AI Chat', 'GPT-4', 'Vision', 'Web Search'],
     ARRAY['GPT-4o access', 'Vision capabilities', 'Web browsing', 'Priority support'],
     ARRAY['Complex reasoning', 'Content creation', 'Code generation', 'Research'],
     95, true, 'Most versatile AI for MVP planning, content creation, and complex problem-solving',
     ARRAY['MVP ideation', 'Content writing', 'Code debugging', 'Market research'],
     'GPT-4o, Vision, Browsing, Priority access', admin_user_id),

    ('Google Gemini Pro', 'Google''s multimodal AI with advanced reasoning and integration capabilities',
     'Chatbots', 'https://aistudio.google.com', 'freemium', 'Free / ₹850 credits/mo',
     true, ARRAY['web', 'api'], ARRAY['Text', 'Code'], ARRAY['Multimodal', 'Google', 'Large Context', 'Free Tier'],
     ARRAY['Multimodal AI', 'Large context', 'Google integration', 'Real-time data'],
     ARRAY['Technical analysis', 'Data processing', 'Google Workspace integration'],
     85, true, 'Excellent for technical MVPs with Google ecosystem integration',
     ARRAY['Technical documentation', 'Data analysis', 'Google Sheets automation'],
     'Gemini 1.5 Pro, Vision, Large context window', admin_user_id),

    ('Claude.ai', 'Anthropic''s AI assistant focused on helpful, harmless, and honest interactions',
     'Chatbots', 'https://claude.ai', 'freemium', 'Free / ₹1,650/mo Pro',
     true, ARRAY['web', 'api'], ARRAY['Text', 'Code'], ARRAY['Safety', 'Long Context', 'Code', 'Analysis'],
     ARRAY['Long conversations', 'File analysis', 'Code generation', 'Safety focused'],
     ARRAY['Detailed analysis', 'Code review', 'Long-form content', 'Research'],
     80, true, 'Best for detailed MVP planning and thorough analysis',
     ARRAY['Business plan creation', 'Code review', 'Market analysis'],
     'Claude 3.5 Sonnet, Long conversations, File uploads', admin_user_id),

    -- UI/UX Tools
    ('Framer', 'AI-powered website builder with advanced design capabilities',
     'UI/UX Design', 'https://framer.com', 'freemium', 'Free / ₹1,650/mo',
     true, ARRAY['web'], ARRAY['Text', 'Design'], ARRAY['Website Builder', 'AI Design', 'No-Code'],
     ARRAY['AI design assistance', 'Responsive layouts', 'Component library', 'CMS integration'],
     ARRAY['Landing pages', 'Portfolio sites', 'Marketing websites', 'Prototyping'],
     90, false, 'Perfect for creating professional websites without coding',
     ARRAY['Startup landing pages', 'Product showcases', 'Portfolio creation'],
     'Free plan available, Pro features from ₹1,650/mo', admin_user_id),

    ('Figma', 'Collaborative design platform with AI-powered features',
     'UI/UX Design', 'https://figma.com', 'freemium', 'Free / ₹1,000/mo',
     true, ARRAY['web', 'desktop'], ARRAY['Design'], ARRAY['Design', 'Collaboration', 'Prototyping'],
     ARRAY['Real-time collaboration', 'Design systems', 'Prototyping', 'Developer handoff'],
     ARRAY['UI/UX design', 'Team collaboration', 'Design systems', 'Prototyping'],
     95, true, 'Industry standard for UI/UX design with excellent collaboration features',
     ARRAY['App design', 'Website mockups', 'Design systems', 'Team collaboration'],
     'Free for personal use, Professional plans from ₹1,000/mo', admin_user_id),

    -- App Builders
    ('FlutterFlow', 'Visual app development platform for creating native mobile apps',
     'App Builders', 'https://flutterflow.io', 'freemium', 'Free / ₹2,500/mo',
     true, ARRAY['web', 'mobile'], ARRAY['Visual'], ARRAY['No-Code', 'Mobile Apps', 'Flutter'],
     ARRAY['Visual development', 'Native performance', 'Firebase integration', 'Custom code support'],
     ARRAY['Mobile apps', 'Cross-platform development', 'Rapid prototyping'],
     85, true, 'Best for creating native mobile apps without extensive coding',
     ARRAY['Mobile MVP development', 'Cross-platform apps', 'Rapid prototyping'],
     'Free tier available, Pro plans from ₹2,500/mo', admin_user_id),

    ('Bubble', 'No-code platform for building web applications',
     'App Builders', 'https://bubble.io', 'freemium', 'Free / ₹2,000/mo',
     true, ARRAY['web'], ARRAY['Visual'], ARRAY['No-Code', 'Web Apps', 'Database'],
     ARRAY['Visual programming', 'Database management', 'User authentication', 'API integrations'],
     ARRAY['Web applications', 'SaaS products', 'Marketplaces', 'Social platforms'],
     80, true, 'Powerful no-code platform for complex web applications',
     ARRAY['SaaS MVP development', 'Web app prototyping', 'Database-driven apps'],
     'Free plan available, Paid plans from ₹2,000/mo', admin_user_id),

    -- Backend Services
    ('Supabase', 'Open source Firebase alternative with real-time database and auth',
     'Backend Services', 'https://supabase.com', 'freemium', 'Free / ₹1,650/mo',
     true, ARRAY['web', 'api'], ARRAY['Code'], ARRAY['Database', 'Backend', 'Auth', 'Realtime'],
     ARRAY['PostgreSQL database', 'Real-time subscriptions', 'Authentication', 'Storage'],
     ARRAY['Backend development', 'Database management', 'User authentication', 'Real-time features'],
     90, true, 'Complete backend solution with excellent developer experience',
     ARRAY['MVP backend', 'Database setup', 'User management', 'Real-time features'],
     'Free tier with generous limits, Pro from ₹1,650/mo', admin_user_id),

    ('Firebase', 'Google''s comprehensive app development platform',
     'Backend Services', 'https://firebase.google.com', 'freemium', 'Free / Pay-as-you-go',
     true, ARRAY['web', 'mobile', 'api'], ARRAY['Code'], ARRAY['Google', 'Backend', 'Database', 'Analytics'],
     ARRAY['Real-time database', 'Authentication', 'Cloud functions', 'Analytics'],
     ARRAY['Mobile backends', 'Web applications', 'Real-time apps', 'Analytics'],
     85, true, 'Comprehensive platform with excellent mobile integration',
     ARRAY['Mobile app backend', 'Real-time features', 'User analytics', 'Cloud functions'],
     'Free Spark plan, Pay-as-you-go Blaze plan', admin_user_id)

    ON CONFLICT (name) DO NOTHING;

    RAISE NOTICE 'AI Tools Directory populated successfully!';
END;
$$ LANGUAGE plpgsql;

-- Execute the population function
SELECT populate_ai_tools_directory();

-- Drop the temporary function
DROP FUNCTION populate_ai_tools_directory();

-- Update migration tracking
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('003_populate_ai_tools', CURRENT_TIMESTAMP)
ON CONFLICT (version) DO NOTHING;
