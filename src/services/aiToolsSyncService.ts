import { supabase } from '@/lib/supabase';
import { aiToolsDatabase, AITool } from '@/data/aiToolsDatabase';

// Database interface matching Supabase schema
export interface DatabaseAITool {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  pricing_model: 'free' | 'paid' | 'freemium';
  pricing_inr: string;
  is_recommended: boolean;
  supported_platforms: string[];
  input_types: string[];
  tags: string[];
  last_verified_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Additional fields for compatibility
  features?: string[];
  best_for?: string[];
  popularity_score?: number;
  logo_url?: string;
  metadata?: any;
}

// Category mapping between static data and database
const categoryMapping: Record<string, string> = {
  'chatbots': 'Chatbots',
  'ui-ux': 'UI/UX Design',
  'dev-ides': 'Development IDEs',
  'app-builders': 'App Builders',
  'backend': 'Backend Services',
  'local-tools': 'Local Tools',
  'workflow': 'Workflow Automation',
  'deployment': 'Deployment',
  'knowledge': 'Knowledge Management'
};

export class AIToolsSyncService {
  private static instance: AIToolsSyncService;
  private syncInProgress = false;

  static getInstance(): AIToolsSyncService {
    if (!AIToolsSyncService.instance) {
      AIToolsSyncService.instance = new AIToolsSyncService();
    }
    return AIToolsSyncService.instance;
  }

  /**
   * Convert static AITool to database format
   */
  private convertToDatabase(tool: AITool, createdBy: string): Omit<DatabaseAITool, 'id' | 'created_at' | 'updated_at'> {
    return {
      name: tool.name,
      description: tool.description,
      category: categoryMapping[tool.category] || tool.category,
      url: tool.officialUrl,
      pricing_model: tool.pricing.model,
      pricing_inr: tool.pricing.inr,
      is_recommended: tool.popularity >= 85, // Consider high popularity as recommended
      supported_platforms: tool.platforms,
      input_types: ['Text', 'Code'], // Default input types
      tags: tool.tags,
      last_verified_at: new Date().toISOString(),
      created_by: createdBy,
      features: tool.features,
      best_for: tool.bestFor,
      popularity_score: tool.popularity,
      logo_url: tool.logo,
      metadata: {
        whyRecommend: tool.whyRecommend,
        useCases: tool.useCases,
        apiCompatible: tool.apiCompatible,
        pricingDetails: tool.pricing.details
      }
    };
  }

  /**
   * Convert database tool to static format
   */
  private convertToStatic(dbTool: DatabaseAITool): AITool {
    const reverseCategory = Object.entries(categoryMapping).find(([_, value]) => value === dbTool.category)?.[0] || 'chatbots';
    
    return {
      id: dbTool.id,
      name: dbTool.name,
      category: reverseCategory,
      description: dbTool.description,
      pricing: {
        model: dbTool.pricing_model,
        inr: dbTool.pricing_inr,
        details: dbTool.metadata?.pricingDetails || ''
      },
      features: dbTool.features || [],
      bestFor: dbTool.best_for || [],
      officialUrl: dbTool.url,
      logo: dbTool.logo_url,
      tags: dbTool.tags,
      apiCompatible: dbTool.metadata?.apiCompatible || false,
      popularity: dbTool.popularity_score || 50,
      whyRecommend: dbTool.metadata?.whyRecommend || '',
      useCases: dbTool.metadata?.useCases || [],
      platforms: dbTool.supported_platforms as ('web' | 'mobile' | 'desktop' | 'api')[]
    };
  }

  /**
   * Sync all predefined tools to database
   */
  async syncPredefinedTools(adminUserId: string): Promise<{ success: boolean; message: string; synced: number }> {
    if (this.syncInProgress) {
      return { success: false, message: 'Sync already in progress', synced: 0 };
    }

    try {
      this.syncInProgress = true;
      
      // Get existing tools from database
      const { data: existingTools, error: fetchError } = await supabase
        .from('ai_tools_directory')
        .select('name, id');

      if (fetchError) throw fetchError;

      const existingNames = new Set(existingTools?.map(t => t.name) || []);
      const toolsToSync = aiToolsDatabase.filter(tool => !existingNames.has(tool.name));

      if (toolsToSync.length === 0) {
        return { success: true, message: 'All tools already synced', synced: 0 };
      }

      // Convert and insert new tools
      const dbTools = toolsToSync.map(tool => this.convertToDatabase(tool, adminUserId));
      
      const { data, error } = await supabase
        .from('ai_tools_directory')
        .insert(dbTools)
        .select();

      if (error) throw error;

      return {
        success: true,
        message: `Successfully synced ${data?.length || 0} tools`,
        synced: data?.length || 0
      };

    } catch (error) {
      console.error('Sync error:', error);
      return {
        success: false,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        synced: 0
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get all tools from database with fallback to static data
   */
  async getAllTools(): Promise<AITool[]> {
    try {
      const { data, error } = await supabase
        .from('ai_tools_directory')
        .select('*')
        .order('popularity_score', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map(tool => this.convertToStatic(tool));
      }
    } catch (error) {
      console.warn('Failed to fetch tools from database, using static data:', error);
    }

    // Fallback to static data
    return aiToolsDatabase;
  }

  /**
   * Get tools by category with database integration
   */
  async getToolsByCategory(categoryId: string): Promise<AITool[]> {
    const allTools = await this.getAllTools();
    return allTools.filter(tool => tool.category === categoryId);
  }

  /**
   * Search tools with database integration
   */
  async searchTools(query: string): Promise<AITool[]> {
    const allTools = await this.getAllTools();
    const lowercaseQuery = query.toLowerCase();
    
    return allTools.filter(tool => 
      tool.name.toLowerCase().includes(lowercaseQuery) ||
      tool.description.toLowerCase().includes(lowercaseQuery) ||
      tool.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      tool.bestFor.some(use => use.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Get recommended tools with database integration
   */
  async getRecommendedTools(
    appType: string, 
    platform: string[], 
    budget: 'free' | 'freemium' | 'paid' | 'any' = 'any'
  ): Promise<AITool[]> {
    const allTools = await this.getAllTools();
    let filtered = allTools;

    // Filter by budget
    if (budget !== 'any') {
      filtered = filtered.filter(tool => tool.pricing.model === budget);
    }

    // Filter by platform compatibility
    if (platform.length > 0) {
      filtered = filtered.filter(tool => 
        platform.some(p => tool.platforms.includes(p as any))
      );
    }

    // Sort by popularity and relevance
    return filtered
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 6);
  }

  /**
   * Force refresh tools from database
   */
  async refreshTools(): Promise<void> {
    // This method can be used to clear any caching if implemented
    // For now, it's a placeholder for future caching implementation
  }

  /**
   * Check sync status
   */
  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{ staticCount: number; databaseCount: number; lastSync?: string }> {
    try {
      const { data, error } = await supabase
        .from('ai_tools_directory')
        .select('id, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      return {
        staticCount: aiToolsDatabase.length,
        databaseCount: data?.length || 0,
        lastSync: data?.[0]?.updated_at
      };
    } catch (error) {
      return {
        staticCount: aiToolsDatabase.length,
        databaseCount: 0
      };
    }
  }
}

// Export singleton instance
export const aiToolsSyncService = AIToolsSyncService.getInstance();
