/**
 * Health check utilities for the admin system
 */

import { supabase } from '@/lib/supabase';

export interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
}

/**
 * Check if Supabase connection is working
 */
export async function checkSupabaseConnection(): Promise<HealthCheckResult> {
  try {
    const { data, error } = await supabase.from('admin_users').select('count').limit(1);
    
    if (error) {
      return {
        component: 'Supabase Connection',
        status: 'error',
        message: `Database connection failed: ${error.message}`,
        details: error
      };
    }

    return {
      component: 'Supabase Connection',
      status: 'healthy',
      message: 'Database connection successful'
    };
  } catch (error: any) {
    return {
      component: 'Supabase Connection',
      status: 'error',
      message: `Connection error: ${error.message}`,
      details: error
    };
  }
}

/**
 * Check if admin tables exist
 */
export async function checkAdminTables(): Promise<HealthCheckResult> {
  try {
    const tables = ['admin_users', 'prompt_templates', 'ai_tools_directory', 'platform_settings'];
    const results = [];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        results.push({ table, error: error.message });
      }
    }

    if (results.length > 0) {
      return {
        component: 'Admin Tables',
        status: 'error',
        message: `Missing or inaccessible tables: ${results.map(r => r.table).join(', ')}`,
        details: results
      };
    }

    return {
      component: 'Admin Tables',
      status: 'healthy',
      message: 'All admin tables accessible'
    };
  } catch (error: any) {
    return {
      component: 'Admin Tables',
      status: 'error',
      message: `Table check failed: ${error.message}`,
      details: error
    };
  }
}

/**
 * Check if the predefined admin email can be set up
 */
export async function checkPredefinedAdminSetup(): Promise<HealthCheckResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        component: 'Admin Setup',
        status: 'warning',
        message: 'No user logged in - cannot check admin setup'
      };
    }

    const predefinedEmail = 'ganeshtappiti1605@gmail.com';
    
    if (user.email?.toLowerCase() === predefinedEmail.toLowerCase()) {
      // Check if already admin
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        return {
          component: 'Admin Setup',
          status: 'error',
          message: `Error checking admin status: ${error.message}`,
          details: error
        };
      }

      if (adminData) {
        return {
          component: 'Admin Setup',
          status: 'healthy',
          message: `Admin access already configured for ${user.email} with role: ${adminData.role}`
        };
      } else {
        return {
          component: 'Admin Setup',
          status: 'warning',
          message: `Predefined admin email ${user.email} is logged in but admin access not yet configured`
        };
      }
    } else {
      return {
        component: 'Admin Setup',
        status: 'healthy',
        message: `Current user (${user.email}) is not the predefined admin email`
      };
    }
  } catch (error: any) {
    return {
      component: 'Admin Setup',
      status: 'error',
      message: `Admin setup check failed: ${error.message}`,
      details: error
    };
  }
}

/**
 * Run comprehensive health check
 */
export async function runHealthCheck(): Promise<HealthCheckResult[]> {
  const checks = [
    checkSupabaseConnection(),
    checkAdminTables(),
    checkPredefinedAdminSetup()
  ];

  return Promise.all(checks);
}

/**
 * Get overall health status
 */
export function getOverallHealth(results: HealthCheckResult[]): 'healthy' | 'warning' | 'error' {
  if (results.some(r => r.status === 'error')) {
    return 'error';
  }
  if (results.some(r => r.status === 'warning')) {
    return 'warning';
  }
  return 'healthy';
}
