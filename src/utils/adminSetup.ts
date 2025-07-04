/**
 * Admin Setup Utility
 * 
 * This file contains utilities for setting up admin users and demo data.
 * In a production environment, this should be done through secure admin tools.
 */

import { supabase } from '@/lib/supabase';

export interface AdminSetupResult {
  success: boolean;
  message: string;
  data?: unknown;
}

/**
 * Create an admin user (for demo purposes)
 * In production, this should be done through secure backend processes
 */
export async function createAdminUser(
  userId: string, 
  role: 'admin' | 'super_admin' = 'admin'
): Promise<AdminSetupResult> {
  try {
    // Check if user already exists as admin
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingAdmin) {
      return {
        success: false,
        message: 'User is already an admin',
        data: existingAdmin
      };
    }

    // Create admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert([{
        user_id: userId,
        role: role,
        is_active: true,
        created_by: userId, // Self-created for demo
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `Admin user created successfully with role: ${role}`,
      data
    };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return {
      success: false,
      message: `Failed to create admin user: ${(error as Error).message}`
    };
  }
}

/**
 * Create demo prompt templates
 */
export async function createDemoPromptTemplates(adminUserId: string): Promise<AdminSetupResult> {
  try {
    const demoTemplates = [
      {
        title: 'Homepage UI Design',
        content: 'Create a modern, responsive homepage design for a [APP_TYPE] application. Include:\n\n1. Hero section with compelling headline\n2. Feature highlights (3-4 key features)\n3. Social proof section\n4. Call-to-action buttons\n5. Navigation menu\n\nStyle: [UI_STYLE]\nTarget audience: [TARGET_AUDIENCE]\nBrand colors: [BRAND_COLORS]',
        category: 'MVP Studio',
        tags: ['ui', 'homepage', 'design', 'landing'],
        use_case: 'Homepage design generation',
        output_type: 'UI Layout',
        status: 'published',
        created_by: adminUserId,
      },
      {
        title: 'Feature Breakdown Analysis',
        content: 'Analyze the following startup idea and break it down into core features:\n\nIdea: [STARTUP_IDEA]\n\nProvide:\n1. Core features (must-have)\n2. Secondary features (nice-to-have)\n3. Advanced features (future roadmap)\n4. Technical requirements for each feature\n5. Estimated development complexity (1-5 scale)\n\nFormat the response as a structured list with priorities.',
        category: 'IdeaForge',
        tags: ['analysis', 'features', 'planning'],
        use_case: 'Feature analysis and prioritization',
        output_type: 'Feature List',
        status: 'published',
        created_by: adminUserId,
      },
      {
        title: 'Tech Stack Recommendation',
        content: 'Recommend a suitable tech stack for the following project:\n\nProject type: [PROJECT_TYPE]\nTeam size: [TEAM_SIZE]\nBudget: [BUDGET_RANGE]\nTimeline: [TIMELINE]\nKey requirements: [REQUIREMENTS]\n\nProvide recommendations for:\n1. Frontend framework\n2. Backend technology\n3. Database solution\n4. Hosting/deployment\n5. Third-party services\n\nInclude pros/cons and learning curve for each recommendation.',
        category: 'MVP Studio',
        tags: ['tech-stack', 'recommendations', 'development'],
        use_case: 'Technology stack selection',
        output_type: 'Tech Stack',
        status: 'published',
        created_by: adminUserId,
      },
    ];

    const { data, error } = await supabase
      .from('prompt_templates')
      .insert(demoTemplates)
      .select();

    if (error) throw error;

    return {
      success: true,
      message: `Created ${data.length} demo prompt templates`,
      data
    };
  } catch (error) {
    console.error('Error creating demo templates:', error);
    return {
      success: false,
      message: `Failed to create demo templates: ${(error as Error).message}`
    };
  }
}

/**
 * Create demo AI tools
 */
export async function createDemoAITools(adminUserId: string): Promise<AdminSetupResult> {
  try {
    const demoTools = [
      {
        name: 'ChatGPT',
        description: 'Advanced AI chatbot for conversations, content creation, and problem-solving',
        category: 'Chatbots',
        url: 'https://chat.openai.com',
        pricing_model: 'freemium',
        pricing_inr: 'Free tier available, ₹1,600/month for Plus',
        is_recommended: true,
        supported_platforms: ['Web', 'Mobile', 'API'],
        input_types: ['Text', 'Image'],
        tags: ['ai', 'chatbot', 'content', 'coding'],
        created_by: adminUserId,
      },
      {
        name: 'Framer',
        description: 'Design and publish websites with AI-powered design tools',
        category: 'UI/UX Design',
        url: 'https://framer.com',
        pricing_model: 'freemium',
        pricing_inr: 'Free tier, ₹1,200/month for Pro',
        is_recommended: true,
        supported_platforms: ['Web', 'Desktop'],
        input_types: ['Text', 'Image', 'File Upload'],
        tags: ['design', 'website', 'prototyping', 'ai'],
        created_by: adminUserId,
      },
      {
        name: 'Cursor',
        description: 'AI-powered code editor built for productivity',
        category: 'Development IDEs',
        url: 'https://cursor.sh',
        pricing_model: 'freemium',
        pricing_inr: 'Free tier, ₹1,600/month for Pro',
        is_recommended: true,
        supported_platforms: ['Desktop'],
        input_types: ['Code', 'Text'],
        tags: ['coding', 'ide', 'ai', 'productivity'],
        created_by: adminUserId,
      },
      {
        name: 'Supabase',
        description: 'Open source Firebase alternative with real-time database and auth',
        category: 'Backend Services',
        url: 'https://supabase.com',
        pricing_model: 'freemium',
        pricing_inr: 'Free tier, ₹2,000/month for Pro',
        is_recommended: true,
        supported_platforms: ['Web', 'API', 'CLI'],
        input_types: ['Code', 'Text'],
        tags: ['database', 'backend', 'auth', 'realtime'],
        created_by: adminUserId,
      },
    ];

    const { data, error } = await supabase
      .from('ai_tools_directory')
      .insert(demoTools)
      .select();

    if (error) throw error;

    return {
      success: true,
      message: `Created ${data.length} demo AI tools`,
      data
    };
  } catch (error) {
    console.error('Error creating demo tools:', error);
    return {
      success: false,
      message: `Failed to create demo tools: ${(error as Error).message}`
    };
  }
}

/**
 * Create demo platform settings
 */
export async function createDemoPlatformSettings(adminUserId: string): Promise<AdminSetupResult> {
  try {
    const demoSettings = [
      {
        key: 'max_api_requests_per_hour',
        value: 1000,
        description: 'Maximum API requests allowed per hour per user',
        category: 'api',
        is_public: false,
        updated_by: adminUserId,
      },
      {
        key: 'enable_user_registration',
        value: true,
        description: 'Allow new users to register for accounts',
        category: 'security',
        is_public: true,
        updated_by: adminUserId,
      },
      {
        key: 'maintenance_mode',
        value: false,
        description: 'Enable maintenance mode to restrict access',
        category: 'general',
        is_public: true,
        updated_by: adminUserId,
      },
      {
        key: 'max_ideas_per_free_user',
        value: 5,
        description: 'Maximum number of ideas a free user can create',
        category: 'features',
        is_public: false,
        updated_by: adminUserId,
      },
      {
        key: 'enable_ai_tools_hub',
        value: true,
        description: 'Enable the AI Tools Hub feature for all users',
        category: 'features',
        is_public: false,
        updated_by: adminUserId,
      },
    ];

    const { data, error } = await supabase
      .from('platform_settings')
      .insert(demoSettings)
      .select();

    if (error) throw error;

    return {
      success: true,
      message: `Created ${data.length} demo platform settings`,
      data
    };
  } catch (error) {
    console.error('Error creating demo settings:', error);
    return {
      success: false,
      message: `Failed to create demo settings: ${(error as Error).message}`
    };
  }
}

/**
 * Complete admin setup with demo data
 */
export async function setupAdminDemo(
  userId: string, 
  role: 'admin' | 'super_admin' = 'super_admin'
): Promise<AdminSetupResult[]> {
  const results: AdminSetupResult[] = [];

  // Create admin user
  const adminResult = await createAdminUser(userId, role);
  results.push(adminResult);

  if (!adminResult.success) {
    return results;
  }

  // Create demo data
  const [templatesResult, toolsResult, settingsResult] = await Promise.all([
    createDemoPromptTemplates(userId),
    createDemoAITools(userId),
    createDemoPlatformSettings(userId),
  ]);

  results.push(templatesResult, toolsResult, settingsResult);
  return results;
}
