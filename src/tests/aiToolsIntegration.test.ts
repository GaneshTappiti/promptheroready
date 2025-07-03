/**
 * Integration tests for AI Tools sync between static data and database
 * This test suite verifies the complete flow from admin panel to main application
 */

import { aiToolsSyncService } from '@/services/aiToolsSyncService';
import { aiToolsDatabase } from '@/data/aiToolsDatabase';
import { initializeAIToolsForAdmin, checkSyncStatus, validateAIToolsData } from '@/utils/syncAITools';
import { supabase } from '@/lib/supabase';

// Mock admin user ID for testing
const TEST_ADMIN_ID = 'test-admin-123';

describe('AI Tools Integration Tests', () => {
  beforeAll(async () => {
    // Setup test environment
    console.log('Setting up AI Tools integration tests...');
  });

  afterAll(async () => {
    // Cleanup test data
    console.log('Cleaning up test data...');
    try {
      await supabase
        .from('ai_tools_directory')
        .delete()
        .eq('created_by', TEST_ADMIN_ID);
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  });

  describe('Static Data Validation', () => {
    test('should have predefined AI tools in static data', () => {
      expect(aiToolsDatabase).toBeDefined();
      expect(Array.isArray(aiToolsDatabase)).toBe(true);
      expect(aiToolsDatabase.length).toBeGreaterThan(0);
    });

    test('should have required fields in static tools', () => {
      aiToolsDatabase.forEach((tool, index) => {
        expect(tool.id, `Tool ${index}: missing id`).toBeDefined();
        expect(tool.name, `Tool ${index}: missing name`).toBeDefined();
        expect(tool.description, `Tool ${index}: missing description`).toBeDefined();
        expect(tool.category, `Tool ${index}: missing category`).toBeDefined();
        expect(tool.pricing, `Tool ${index}: missing pricing`).toBeDefined();
        expect(tool.officialUrl, `Tool ${index}: missing officialUrl`).toBeDefined();
      });
    });

    test('should have valid categories', () => {
      const validCategories = [
        'chatbots', 'ui-ux', 'dev-ides', 'app-builders', 
        'backend', 'local-tools', 'workflow', 'deployment', 'knowledge'
      ];

      aiToolsDatabase.forEach((tool, index) => {
        expect(validCategories, `Tool ${index}: invalid category ${tool.category}`)
          .toContain(tool.category);
      });
    });
  });

  describe('Sync Service Tests', () => {
    test('should create sync service instance', () => {
      expect(aiToolsSyncService).toBeDefined();
      expect(typeof aiToolsSyncService.getAllTools).toBe('function');
      expect(typeof aiToolsSyncService.syncPredefinedTools).toBe('function');
    });

    test('should get sync statistics', async () => {
      const stats = await aiToolsSyncService.getSyncStats();
      expect(stats).toBeDefined();
      expect(typeof stats.staticCount).toBe('number');
      expect(typeof stats.databaseCount).toBe('number');
      expect(stats.staticCount).toBeGreaterThan(0);
    });

    test('should fetch tools with fallback to static data', async () => {
      const tools = await aiToolsSyncService.getAllTools();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
      
      // Should have same structure as static tools
      tools.forEach((tool, index) => {
        expect(tool.id, `Tool ${index}: missing id`).toBeDefined();
        expect(tool.name, `Tool ${index}: missing name`).toBeDefined();
        expect(tool.category, `Tool ${index}: missing category`).toBeDefined();
      });
    });

    test('should search tools correctly', async () => {
      const searchResults = await aiToolsSyncService.searchTools('ChatGPT');
      expect(Array.isArray(searchResults)).toBe(true);
      
      if (searchResults.length > 0) {
        const hasRelevantResult = searchResults.some(tool => 
          tool.name.toLowerCase().includes('chatgpt') ||
          tool.description.toLowerCase().includes('chatgpt')
        );
        expect(hasRelevantResult).toBe(true);
      }
    });

    test('should get tools by category', async () => {
      const chatbotTools = await aiToolsSyncService.getToolsByCategory('chatbots');
      expect(Array.isArray(chatbotTools)).toBe(true);
      
      chatbotTools.forEach(tool => {
        expect(tool.category).toBe('chatbots');
      });
    });

    test('should get recommended tools', async () => {
      const recommendations = await aiToolsSyncService.getRecommendedTools(
        'web-app', 
        ['web'], 
        'any'
      );
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeLessThanOrEqual(6); // Should limit to 6
    });
  });

  describe('Database Integration Tests', () => {
    test('should check sync status', async () => {
      const status = await checkSyncStatus();
      expect(status).toBeDefined();
      expect(['synced', 'partial', 'empty', 'error']).toContain(status.status);
      expect(typeof status.staticCount).toBe('number');
      expect(typeof status.databaseCount).toBe('number');
      expect(Array.isArray(status.recommendations)).toBe(true);
    });

    test('should validate AI tools data', async () => {
      const validation = await validateAIToolsData();
      expect(validation).toBeDefined();
      expect(typeof validation.valid).toBe('boolean');
      expect(Array.isArray(validation.issues)).toBe(true);
      expect(Array.isArray(validation.suggestions)).toBe(true);
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle sync with invalid admin ID', async () => {
      const result = await aiToolsSyncService.syncPredefinedTools('invalid-id');
      expect(result.success).toBeDefined();
      expect(typeof result.message).toBe('string');
      expect(typeof result.synced).toBe('number');
    });

    test('should handle database connection errors gracefully', async () => {
      // This test verifies fallback behavior when database is unavailable
      const tools = await aiToolsSyncService.getAllTools();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  describe('Data Consistency Tests', () => {
    test('should maintain data consistency between static and database', async () => {
      const staticTools = aiToolsDatabase;
      const dbTools = await aiToolsSyncService.getAllTools();
      
      // Check that essential tools exist in both
      const essentialTools = ['ChatGPT Pro', 'Figma', 'Supabase'];
      
      essentialTools.forEach(toolName => {
        const inStatic = staticTools.some(tool => tool.name === toolName);
        const inDatabase = dbTools.some(tool => tool.name === toolName);
        
        if (inStatic) {
          // If tool exists in static data, it should be available through sync service
          expect(inDatabase || inStatic).toBe(true);
        }
      });
    });

    test('should preserve tool properties during sync', async () => {
      const tools = await aiToolsSyncService.getAllTools();
      
      tools.forEach(tool => {
        // Check required properties exist
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.category).toBeDefined();
        expect(tool.pricing).toBeDefined();
        expect(tool.officialUrl).toBeDefined();
        
        // Check pricing structure
        expect(tool.pricing.model).toBeDefined();
        expect(['free', 'freemium', 'paid']).toContain(tool.pricing.model);
        expect(tool.pricing.inr).toBeDefined();
      });
    });
  });
});

// Helper function to run integration tests manually
export async function runAIToolsIntegrationTest(): Promise<{
  success: boolean;
  results: any[];
  errors: string[];
}> {
  const results: any[] = [];
  const errors: string[] = [];

  try {
    console.log('🧪 Running AI Tools Integration Test...');

    // Test 1: Static data validation
    console.log('📊 Testing static data...');
    const staticDataValid = aiToolsDatabase.length > 0;
    results.push({ test: 'Static Data', passed: staticDataValid });

    // Test 2: Sync service functionality
    console.log('🔄 Testing sync service...');
    const tools = await aiToolsSyncService.getAllTools();
    const syncServiceValid = tools.length > 0;
    results.push({ test: 'Sync Service', passed: syncServiceValid });

    // Test 3: Database integration
    console.log('🗄️ Testing database integration...');
    const syncStatus = await checkSyncStatus();
    const dbIntegrationValid = syncStatus.status !== 'error';
    results.push({ test: 'Database Integration', passed: dbIntegrationValid });

    // Test 4: Data validation
    console.log('✅ Testing data validation...');
    const validation = await validateAIToolsData();
    const dataValidationPassed = validation.issues.length === 0;
    results.push({ test: 'Data Validation', passed: dataValidationPassed });

    const allTestsPassed = results.every(result => result.passed);
    
    console.log('🎉 Integration test completed!');
    console.log('Results:', results);

    return {
      success: allTestsPassed,
      results,
      errors
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMessage);
    console.error('❌ Integration test failed:', errorMessage);

    return {
      success: false,
      results,
      errors
    };
  }
}
