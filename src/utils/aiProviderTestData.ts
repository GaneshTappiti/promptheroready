/**
 * AI Provider Test Data and Mock Configurations
 * Used for testing AI integrations without requiring real API keys
 */

import { AIProvider, AIProviderConfig, AIRequest, AIResponse } from '@/types/aiProvider';

export interface MockAIResponse {
  provider: AIProvider;
  content: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  model: string;
  duration: number;
}

export const mockProviderConfigs: Record<AIProvider, Partial<AIProviderConfig>> = {
  openai: {
    provider: 'openai',
    modelName: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000
  },
  gemini: {
    provider: 'gemini',
    modelName: 'gemini-2.0-flash',
    temperature: 0.7,
    maxTokens: 2000
  },
  claude: {
    provider: 'claude',
    modelName: 'claude-3-sonnet',
    temperature: 0.7,
    maxTokens: 2000
  },
  deepseek: {
    provider: 'deepseek',
    modelName: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 2000
  },
  mistral: {
    provider: 'mistral',
    modelName: 'mistral-large',
    temperature: 0.7,
    maxTokens: 2000
  },
  custom: {
    provider: 'custom',
    customEndpoint: 'https://api.example.com/v1/chat/completions',
    temperature: 0.7,
    maxTokens: 2000
  },
  none: {
    provider: 'none'
  }
};

export const testPrompts = {
  simple: "What is artificial intelligence?",
  startup: "Analyze this startup idea: A mobile app that helps people find and book local fitness classes",
  mvp: "Create an MVP plan for a food delivery app targeting college students",
  presentation: "Generate an outline for a 10-slide investor pitch about an AI-powered fitness app",
  creative: "Write a creative story about a robot learning to paint",
  technical: "Explain how to implement user authentication in a React application",
  business: "What are the key metrics for a SaaS business?",
  complex: "Provide a comprehensive market analysis for the electric vehicle industry including TAM, SAM, SOM, key players, trends, and growth projections"
};

export const expectedResponsePatterns = {
  startup: [
    'market opportunity',
    'target audience',
    'monetization',
    'competition',
    'validation',
    'features'
  ],
  mvp: [
    'core features',
    'timeline',
    'technology stack',
    'user stories',
    'priorities'
  ],
  presentation: [
    'slide',
    'outline',
    'introduction',
    'conclusion',
    'agenda'
  ]
};

export const mockResponses: Record<string, MockAIResponse> = {
  simple: {
    provider: 'gemini',
    content: "Artificial Intelligence (AI) is a branch of computer science that aims to create machines capable of performing tasks that typically require human intelligence. This includes learning, reasoning, problem-solving, perception, and language understanding.",
    tokensUsed: { input: 15, output: 45, total: 60 },
    model: 'gemini-2.0-flash',
    duration: 1200
  },
  startup: {
    provider: 'openai',
    content: `# Startup Analysis: Local Fitness Class Booking App

## Market Opportunity
The fitness app market is valued at $4.4 billion and growing at 14.7% CAGR. Local fitness has seen increased demand post-pandemic.

## Target Audience
- Health-conscious individuals aged 25-45
- Busy professionals seeking convenient fitness options
- People preferring variety in workout routines

## Key Features
1. Class discovery and booking
2. Instructor profiles and reviews
3. Payment processing
4. Calendar integration
5. Social features and community

## Monetization Strategy
- Commission from bookings (15-20%)
- Premium subscriptions for users
- Advertising from fitness brands
- Corporate wellness partnerships

## Validation Score: 78/100
Strong market demand with clear monetization paths.`,
    tokensUsed: { input: 25, output: 180, total: 205 },
    model: 'gpt-4',
    duration: 3500
  },
  mvp: {
    provider: 'claude',
    content: `# MVP Plan: College Food Delivery App

## Core Features (Phase 1)
1. **User Registration & Profiles**
   - Student verification
   - Dietary preferences
   - Payment methods

2. **Restaurant Discovery**
   - Campus-area restaurants
   - Menu browsing
   - Ratings and reviews

3. **Ordering System**
   - Cart management
   - Order customization
   - Real-time tracking

4. **Payment Processing**
   - Student-friendly payment options
   - Split billing for groups
   - Campus meal plan integration

## Technology Stack
- Frontend: React Native (mobile-first)
- Backend: Node.js with Express
- Database: PostgreSQL
- Payments: Stripe
- Maps: Google Maps API

## Timeline: 12-16 weeks
- Weeks 1-4: Core infrastructure
- Weeks 5-8: User features
- Weeks 9-12: Restaurant features
- Weeks 13-16: Testing and launch`,
    tokensUsed: { input: 30, output: 220, total: 250 },
    model: 'claude-3-sonnet',
    duration: 4200
  }
};

export const performanceThresholds = {
  responseTime: {
    fast: 2000,      // < 2 seconds
    acceptable: 5000, // < 5 seconds
    slow: 10000      // < 10 seconds
  },
  tokenUsage: {
    efficient: 100,   // < 100 tokens
    normal: 500,      // < 500 tokens
    heavy: 1000       // < 1000 tokens
  },
  successRate: {
    excellent: 95,    // > 95%
    good: 85,         // > 85%
    acceptable: 75    // > 75%
  }
};

export const testScenarios = [
  {
    name: "Basic AI Response",
    prompt: testPrompts.simple,
    expectedPatterns: ['artificial intelligence', 'machine', 'human'],
    maxTokens: 200,
    timeout: 5000
  },
  {
    name: "Startup Idea Analysis",
    prompt: testPrompts.startup,
    expectedPatterns: expectedResponsePatterns.startup,
    maxTokens: 1000,
    timeout: 15000
  },
  {
    name: "MVP Planning",
    prompt: testPrompts.mvp,
    expectedPatterns: expectedResponsePatterns.mvp,
    maxTokens: 1500,
    timeout: 20000
  },
  {
    name: "Presentation Generation",
    prompt: testPrompts.presentation,
    expectedPatterns: expectedResponsePatterns.presentation,
    maxTokens: 800,
    timeout: 12000
  },
  {
    name: "Complex Analysis",
    prompt: testPrompts.complex,
    expectedPatterns: ['market', 'analysis', 'growth', 'industry'],
    maxTokens: 2000,
    timeout: 30000
  }
];

export const providerCapabilities = {
  openai: {
    strengths: ['General purpose', 'Code generation', 'Reasoning'],
    weaknesses: ['Cost', 'Rate limits'],
    bestFor: ['Complex analysis', 'Creative writing', 'Code generation']
  },
  gemini: {
    strengths: ['Fast responses', 'Multimodal', 'Free tier'],
    weaknesses: ['Newer model', 'Less training data'],
    bestFor: ['Quick responses', 'General queries', 'Cost-effective usage']
  },
  claude: {
    strengths: ['Long context', 'Safety', 'Reasoning'],
    weaknesses: ['Cost', 'Availability'],
    bestFor: ['Long documents', 'Analysis', 'Safety-critical applications']
  },
  deepseek: {
    strengths: ['Low cost', 'Coding', 'Efficiency'],
    weaknesses: ['Newer provider', 'Limited models'],
    bestFor: ['Cost-sensitive applications', 'Code generation', 'Simple tasks']
  },
  mistral: {
    strengths: ['European provider', 'Multilingual', 'Open source'],
    weaknesses: ['Smaller ecosystem', 'Limited availability'],
    bestFor: ['European compliance', 'Multilingual content', 'Open source projects']
  }
};

/**
 * Generate mock AI response for testing
 */
export function generateMockResponse(
  prompt: string, 
  provider: AIProvider = 'gemini'
): MockAIResponse {
  const baseResponse = mockResponses.simple;
  
  // Find matching test scenario
  const scenario = testScenarios.find(s => s.prompt === prompt);
  if (scenario) {
    const mockKey = Object.keys(testPrompts).find(key => testPrompts[key as keyof typeof testPrompts] === prompt);
    if (mockKey && mockResponses[mockKey]) {
      return { ...mockResponses[mockKey], provider };
    }
  }

  // Generate generic response
  return {
    provider,
    content: `Mock AI response for prompt: "${prompt.substring(0, 50)}..." Generated by ${provider} provider.`,
    tokensUsed: {
      input: Math.floor(prompt.length / 4),
      output: 50,
      total: Math.floor(prompt.length / 4) + 50
    },
    model: mockProviderConfigs[provider].modelName || 'default-model',
    duration: Math.random() * 3000 + 1000 // 1-4 seconds
  };
}

/**
 * Validate AI response quality
 */
export function validateResponse(
  response: string,
  expectedPatterns: string[],
  minLength: number = 50
): { isValid: boolean; score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;

  // Check minimum length
  if (response.length < minLength) {
    issues.push(`Response too short (${response.length} < ${minLength} characters)`);
    score -= 30;
  }

  // Check for expected patterns
  const foundPatterns = expectedPatterns.filter(pattern => 
    response.toLowerCase().includes(pattern.toLowerCase())
  );
  
  const patternScore = (foundPatterns.length / expectedPatterns.length) * 40;
  score = Math.max(0, score - 40 + patternScore);

  if (foundPatterns.length < expectedPatterns.length / 2) {
    issues.push(`Missing key content patterns (found ${foundPatterns.length}/${expectedPatterns.length})`);
  }

  // Check for common AI response issues
  if (response.includes('I cannot') || response.includes('I am unable')) {
    issues.push('AI declined to provide response');
    score -= 20;
  }

  if (response.includes('error') || response.includes('Error')) {
    issues.push('Response contains error messages');
    score -= 15;
  }

  return {
    isValid: score >= 60 && issues.length === 0,
    score: Math.max(0, Math.min(100, score)),
    issues
  };
}
