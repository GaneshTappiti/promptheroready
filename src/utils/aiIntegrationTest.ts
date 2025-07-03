/**
 * AI Integration Testing Utility
 * Comprehensive testing for all AI-powered features
 */

import { aiProviderService } from '@/services/aiProviderService';
import { AIEngine } from '@/services/aiEngine';
import { presentationAIService } from '@/services/presentationAIService';
import { AIProvider, AIRequest, ConnectionStatus } from '@/types/aiProvider';
import { OutlineGenerationRequest } from '@/types/presentation';

export interface AITestCase {
  name: string;
  description: string;
  testFunction: () => Promise<AITestResult>;
  category: 'provider' | 'feature' | 'integration';
  priority: 'high' | 'medium' | 'low';
}

export interface AITestResult {
  success: boolean;
  message: string;
  duration: number;
  data?: any;
  error?: string;
}

export interface AITestSuite {
  name: string;
  tests: AITestCase[];
}

export class AIIntegrationTester {
  private testUserId: string;
  private testResults: Map<string, AITestResult> = new Map();

  constructor(userId: string) {
    this.testUserId = userId;
  }

  /**
   * Test AI Provider Connections
   */
  async testProviderConnections(): Promise<AITestResult[]> {
    const providers: AIProvider[] = ['openai', 'gemini', 'claude', 'deepseek', 'mistral'];
    const results: AITestResult[] = [];

    for (const provider of providers) {
      const startTime = Date.now();
      try {
        // Check if user has configured this provider
        const userPrefs = await aiProviderService.getUserPreferences(this.testUserId);

        if (userPrefs && userPrefs.provider === provider && userPrefs.apiKeyEncrypted) {
          // Test with user's actual configuration
          const connectionResult = await aiProviderService.testConnection(this.testUserId);

          results.push({
            success: connectionResult.success,
            message: connectionResult.success ? `${provider} connection successful (user configured)` : connectionResult.error || 'Connection failed',
            duration: Date.now() - startTime,
            data: connectionResult
          });
        } else {
          // Provider not configured by user
          results.push({
            success: false,
            message: `${provider} not configured by user`,
            duration: Date.now() - startTime,
            data: { configured: false }
          });
        }
      } catch (error) {
        results.push({
          success: false,
          message: `${provider} connection test failed`,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Test Startup Idea Analysis
   */
  async testStartupIdeaAnalysis(): Promise<AITestResult> {
    const startTime = Date.now();
    try {
      const aiEngine = new AIEngine(this.testUserId);
      const testIdea = "A mobile app that helps people find and book local fitness classes";
      
      const analysis = await aiEngine.analyzeStartupIdea(testIdea);
      
      // Validate analysis structure
      const requiredFields = ['analysis', 'tools', 'roadmap', 'launchPath', 'estimatedTimeline', 'totalCost'];
      const missingFields = requiredFields.filter(field => !analysis[field as keyof typeof analysis]);
      
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          duration: Date.now() - startTime
        };
      }

      return {
        success: true,
        message: 'Startup idea analysis completed successfully',
        duration: Date.now() - startTime,
        data: {
          analysisKeys: Object.keys(analysis),
          confidenceScore: analysis.confidenceScore,
          toolsCount: analysis.tools?.length || 0,
          roadmapSteps: analysis.roadmap?.length || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Startup idea analysis failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test Presentation Generation
   */
  async testPresentationGeneration(): Promise<AITestResult> {
    const startTime = Date.now();
    try {
      const request: OutlineGenerationRequest = {
        topic: "AI-Powered Fitness App Pitch",
        numSlides: 5,
        language: "en",
        style: "business",
        targetAudience: "Investors",
        objectives: ["Showcase market opportunity", "Demonstrate product features"],
        duration: 10
      };

      const outline = await presentationAIService.generateOutline(this.testUserId, request);
      
      // Validate outline structure
      if (!outline.slides || outline.slides.length === 0) {
        return {
          success: false,
          message: 'No slides generated in outline',
          duration: Date.now() - startTime
        };
      }

      return {
        success: true,
        message: `Presentation outline generated with ${outline.slides.length} slides`,
        duration: Date.now() - startTime,
        data: {
          slideCount: outline.slides.length,
          title: outline.title,
          hasIntroduction: outline.slides.some(s => s.type === 'title'),
          hasConclusion: outline.slides.some(s => s.type === 'conclusion')
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Presentation generation failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test AI Provider Service Direct Calls
   */
  async testDirectAICall(): Promise<AITestResult> {
    const startTime = Date.now();
    try {
      const request: AIRequest = {
        prompt: "Generate a brief description of a mobile fitness app",
        systemPrompt: "You are a helpful assistant that creates concise app descriptions.",
        temperature: 0.7,
        maxTokens: 150
      };

      const response = await aiProviderService.generateResponse(this.testUserId, request);
      
      if (!response.content || response.content.length < 10) {
        return {
          success: false,
          message: 'AI response too short or empty',
          duration: Date.now() - startTime
        };
      }

      return {
        success: true,
        message: 'Direct AI call successful',
        duration: Date.now() - startTime,
        data: {
          contentLength: response.content.length,
          tokensUsed: response.tokensUsed,
          provider: response.provider,
          model: response.model
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Direct AI call failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test AI Provider Capabilities
   */
  async testProviderCapabilities(): Promise<AITestResult> {
    const startTime = Date.now();
    try {
      const providers: AIProvider[] = ['openai', 'gemini', 'claude', 'deepseek', 'mistral'];
      const capabilities = [];

      for (const provider of providers) {
        try {
          const caps = await aiProviderService.getProviderCapabilities(provider);
          capabilities.push({
            provider,
            name: caps.name,
            modelCount: caps.models.length,
            features: caps.features.length
          });
        } catch (error) {
          capabilities.push({
            provider,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return {
        success: true,
        message: `Retrieved capabilities for ${capabilities.length} providers`,
        duration: Date.now() - startTime,
        data: capabilities
      };
    } catch (error) {
      return {
        success: false,
        message: 'Provider capabilities test failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Run all AI integration tests
   */
  async runAllTests(): Promise<{ results: Map<string, AITestResult>; summary: any }> {
    console.log('🤖 Starting AI Integration Tests...');
    
    const tests = [
      { name: 'Provider Connections', test: () => this.testProviderConnections() },
      { name: 'Direct AI Call', test: () => this.testDirectAICall() },
      { name: 'Startup Idea Analysis', test: () => this.testStartupIdeaAnalysis() },
      { name: 'Presentation Generation', test: () => this.testPresentationGeneration() },
      { name: 'Provider Capabilities', test: () => this.testProviderCapabilities() }
    ];

    for (const { name, test } of tests) {
      console.log(`Testing: ${name}...`);
      try {
        const result = await test();
        if (Array.isArray(result)) {
          // Handle multiple results (like provider connections)
          result.forEach((r, index) => {
            this.testResults.set(`${name} - ${index}`, r);
          });
        } else {
          this.testResults.set(name, result);
        }
      } catch (error) {
        this.testResults.set(name, {
          success: false,
          message: 'Test execution failed',
          duration: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const summary = this.generateTestSummary();
    console.log('🎯 AI Integration Tests Complete:', summary);
    
    return { results: this.testResults, summary };
  }

  private generateTestSummary() {
    const total = this.testResults.size;
    const passed = Array.from(this.testResults.values()).filter(r => r.success).length;
    const failed = total - passed;
    const avgDuration = Array.from(this.testResults.values())
      .reduce((sum, r) => sum + r.duration, 0) / total;

    return {
      total,
      passed,
      failed,
      successRate: ((passed / total) * 100).toFixed(1) + '%',
      avgDuration: Math.round(avgDuration) + 'ms'
    };
  }

  private getDefaultModel(provider: AIProvider): string {
    const models = {
      openai: 'gpt-4',
      gemini: 'gemini-2.0-flash',
      claude: 'claude-3-sonnet',
      deepseek: 'deepseek-chat',
      mistral: 'mistral-large'
    };
    return models[provider] || 'default';
  }
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).aiIntegrationTest = {
    AIIntegrationTester,
    runTests: async (userId: string) => {
      const tester = new AIIntegrationTester(userId);
      return await tester.runAllTests();
    }
  };
}
