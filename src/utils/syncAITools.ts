import { aiToolsSyncService } from '@/services/aiToolsSyncService';
import { supabase } from '@/lib/supabase';

/**
 * Utility functions for syncing AI tools between static data and database
 */

export interface SyncResult {
  success: boolean;
  message: string;
  synced: number;
  errors?: string[];
}

/**
 * Initialize AI tools sync for a new admin user
 */
export async function initializeAIToolsForAdmin(adminUserId: string): Promise<SyncResult> {
  try {
    console.log('Initializing AI tools sync for admin:', adminUserId);
    
    // Check if admin user exists
    const { data: adminUser, error: adminError } = await supabase
      .from('user_profiles')
      .select('id, role')
      .eq('id', adminUserId)
      .single();

    if (adminError || !adminUser) {
      return {
        success: false,
        message: 'Admin user not found',
        synced: 0,
        errors: [adminError?.message || 'User not found']
      };
    }

    if (!['admin', 'super_admin'].includes(adminUser.role)) {
      return {
        success: false,
        message: 'User does not have admin privileges',
        synced: 0,
        errors: ['Insufficient permissions']
      };
    }

    // Perform the sync
    const result = await aiToolsSyncService.syncPredefinedTools(adminUserId);
    
    console.log('Sync result:', result);
    return result;

  } catch (error) {
    console.error('Error initializing AI tools sync:', error);
    return {
      success: false,
      message: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      synced: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Check sync status and provide recommendations
 */
export async function checkSyncStatus(): Promise<{
  status: 'synced' | 'partial' | 'empty' | 'error';
  staticCount: number;
  databaseCount: number;
  recommendations: string[];
}> {
  try {
    const stats = await aiToolsSyncService.getSyncStats();
    
    let status: 'synced' | 'partial' | 'empty' | 'error';
    const recommendations: string[] = [];

    if (stats.databaseCount === 0) {
      status = 'empty';
      recommendations.push('Database is empty. Run initial sync to populate AI tools.');
    } else if (stats.databaseCount < stats.staticCount) {
      status = 'partial';
      recommendations.push(`Database has ${stats.databaseCount} tools but static data has ${stats.staticCount}. Consider syncing missing tools.`);
    } else {
      status = 'synced';
      recommendations.push('Database is up to date with static data.');
    }

    if (stats.lastSync) {
      const lastSyncDate = new Date(stats.lastSync);
      const daysSinceSync = Math.floor((Date.now() - lastSyncDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceSync > 30) {
        recommendations.push(`Last sync was ${daysSinceSync} days ago. Consider refreshing tools data.`);
      }
    }

    return {
      status,
      staticCount: stats.staticCount,
      databaseCount: stats.databaseCount,
      recommendations
    };

  } catch (error) {
    console.error('Error checking sync status:', error);
    return {
      status: 'error',
      staticCount: 0,
      databaseCount: 0,
      recommendations: ['Error checking sync status. Please check database connection.']
    };
  }
}

/**
 * Validate AI tools data integrity
 */
export async function validateAIToolsData(): Promise<{
  valid: boolean;
  issues: string[];
  suggestions: string[];
}> {
  try {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Get all tools from database
    const { data: dbTools, error } = await supabase
      .from('ai_tools_directory')
      .select('*');

    if (error) {
      issues.push(`Database error: ${error.message}`);
      return { valid: false, issues, suggestions };
    }

    if (!dbTools || dbTools.length === 0) {
      issues.push('No AI tools found in database');
      suggestions.push('Run initial sync to populate AI tools');
      return { valid: false, issues, suggestions };
    }

    // Check for required fields
    dbTools.forEach((tool, index) => {
      if (!tool.name) issues.push(`Tool ${index + 1}: Missing name`);
      if (!tool.description) issues.push(`Tool ${index + 1}: Missing description`);
      if (!tool.category) issues.push(`Tool ${index + 1}: Missing category`);
      if (!tool.url) issues.push(`Tool ${index + 1}: Missing URL`);
      if (!tool.pricing_model) issues.push(`Tool ${index + 1}: Missing pricing model`);
    });

    // Check for duplicates
    const names = dbTools.map(tool => tool.name);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      issues.push(`Duplicate tool names found: ${duplicates.join(', ')}`);
      suggestions.push('Remove or rename duplicate tools');
    }

    // Check category distribution
    const categories = dbTools.reduce((acc, tool) => {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const emptyCategoriesCount = Object.values(categories).filter(count => count === 0).length;
    if (emptyCategoriesCount > 0) {
      suggestions.push(`${emptyCategoriesCount} categories have no tools. Consider adding more tools or removing empty categories.`);
    }

    return {
      valid: issues.length === 0,
      issues,
      suggestions
    };

  } catch (error) {
    console.error('Error validating AI tools data:', error);
    return {
      valid: false,
      issues: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      suggestions: ['Check database connection and try again']
    };
  }
}

/**
 * Export current database tools to JSON (for backup)
 */
export async function exportAIToolsData(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('ai_tools_directory')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get sync service instance for direct access
 */
export function getAIToolsSyncService() {
  return aiToolsSyncService;
}
