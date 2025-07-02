import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIResponse from '@/components/ui/ai-response';
import PromptViewer from '@/components/ui/prompt-viewer';
import { Sparkles, Code, Palette, Monitor } from 'lucide-react';

const AIResponseDemo: React.FC = () => {
  const poorPrompt = "Write a business plan";

  const goodPrompt = "I am a first-time entrepreneur launching a SaaS product. Write a comprehensive business plan for a project management tool targeting small businesses with 10-50 employees. Include market analysis, competitive landscape, revenue projections for the first 3 years, and go-to-market strategy. Format as a structured document with clear sections and bullet points where appropriate.";

  const sampleMarkdown = `# Business Analysis Report

## Executive Summary

Based on the analysis of your AI-powered grocery management app concept, this idea demonstrates strong market potential with clear differentiation opportunities in an established but evolving market segment.

## Market Opportunity Assessment

### Target Market Analysis
- **Primary Segment**: Urban professionals and families aged 25-45 with household income above $50,000
- **Market Size**: Estimated $2.3 billion addressable market with 12% annual growth
- **Geographic Focus**: Major metropolitan areas with high smartphone penetration
- **Pain Points**: Food waste reduction, meal planning efficiency, inventory management complexity

### Market Validation Indicators
- Growing consumer awareness of food waste environmental impact
- Increased adoption of AI-powered household management tools
- Rising grocery costs driving demand for optimization solutions
- Post-pandemic shift toward home cooking and meal planning

## Competitive Landscape

| Competitor | Market Position | Key Strengths | Notable Weaknesses |
|------------|----------------|---------------|-------------------|
| Fridgely | Market leader (15% share) | Simple interface, established user base | Limited AI capabilities, basic features |
| NoWaste | Niche player (8% share) | Strong tracking features | Poor user experience, limited recipes |
| FoodKeeper | Government-backed (5% share) | Authoritative data source | Outdated interface, poor mobile experience |

### Competitive Gaps Identified
- Limited AI-powered food recognition capabilities
- Poor integration between inventory tracking and meal planning
- Lack of personalized recommendations based on consumption patterns
- Minimal focus on environmental impact tracking

## Value Proposition and Differentiators

### Core Differentiators
1. **AI-Powered Recognition**: Camera-based food identification and automatic inventory updates
2. **Predictive Analytics**: Machine learning algorithms for expiry prediction and consumption patterns
3. **Personalized Recommendations**: Recipe suggestions based on available ingredients and dietary preferences
4. **Environmental Impact**: Waste reduction tracking with sustainability metrics

### Unique Value Proposition
"The only food management app that learns your consumption patterns to reduce waste, save money, and simplify meal planning through AI-powered automation."

## Technical Implementation Strategy

### Recommended Technology Stack
\`\`\`
Frontend: React Native with Expo
Backend: Node.js with Express, PostgreSQL database
Cloud Infrastructure: AWS or Google Cloud Platform
AI/ML: TensorFlow Lite for on-device processing
Image Recognition: Google Vision API or AWS Rekognition
Authentication: Firebase Auth or Auth0
\`\`\`

### Development Phases
1. **Phase 1**: Core inventory tracking and manual entry (8-10 weeks)
2. **Phase 2**: AI image recognition integration (6-8 weeks)
3. **Phase 3**: Recipe recommendations and meal planning (4-6 weeks)
4. **Phase 4**: Analytics and environmental tracking (4-6 weeks)

## Business Model and Monetization

### Revenue Strategy
- **Freemium Model**: Basic tracking features available free
- **Premium Subscription**: $4.99/month for AI features, advanced analytics, meal planning
- **Family Plan**: $9.99/month for multi-user support and shared shopping lists
- **Enterprise**: B2B partnerships with grocery retailers and meal kit services

### Financial Projections
- **Year 1**: 10,000 users, $50,000 revenue
- **Year 2**: 100,000 users, $600,000 revenue
- **Year 3**: 500,000 users, $3.5 million revenue

## Development Investment and Timeline

### Cost Estimates
- **MVP Development**: $35,000 - $50,000
- **Full Feature Set**: $75,000 - $100,000
- **Marketing and Launch**: $25,000 - $40,000
- **Total Initial Investment**: $135,000 - $190,000

### Timeline to Market
- **MVP Launch**: 4-5 months
- **Full Product Launch**: 8-10 months
- **Market Expansion**: 12-18 months

## Risk Assessment and Mitigation

### Primary Risks
1. **Technical Risk**: AI accuracy for food recognition
2. **Market Risk**: User adoption and retention challenges
3. **Competitive Risk**: Large tech companies entering the space
4. **Regulatory Risk**: Food safety and data privacy compliance

### Mitigation Strategies
- Start with manual entry and gradually introduce AI features
- Focus on user experience and retention metrics from day one
- Build strong brand and community before major competitors react
- Implement privacy-by-design and comply with relevant regulations

## Recommended Next Steps

1. **Validate Assumptions**: Conduct 20-30 customer interviews with target demographic
2. **Build MVP**: Focus on core inventory tracking with simple, intuitive interface
3. **Test Market Fit**: Launch beta with 100-200 users to validate core value proposition
4. **Secure Funding**: Prepare pitch deck and financial model for seed funding round
5. **Build Team**: Recruit mobile developer and AI/ML specialist

## Conclusion

This concept addresses a real market need with clear differentiation potential. The combination of AI technology and environmental consciousness aligns with current consumer trends. Success will depend on execution quality, user experience design, and effective customer acquisition strategy.

Would you like me to elaborate on any specific aspect of this analysis or help you develop a detailed implementation plan?`;

  const promptSections = [
    {
      id: 'framework',
      title: 'App Framework & Structure',
      icon: <Monitor className="h-4 w-4" />,
      content: `# Mobile App Framework

Create a modern grocery management app with the following structure:

## Core Pages
- **Onboarding**: Welcome screens with feature highlights
- **Dashboard**: Overview of inventory and expiry alerts
- **Camera Scan**: AI-powered food recognition
- **Inventory**: Detailed food item management
- **Recipes**: Personalized recipe suggestions
- **Analytics**: Waste tracking and insights

## Design System
- **Theme**: Clean, modern with green accent colors
- **Typography**: Inter font family for readability
- **Components**: Card-based layouts, floating action buttons
- **Navigation**: Bottom tab navigation with 5 main sections

## Key Features
- Real-time inventory tracking
- Smart notifications for expiring items
- Recipe recommendations based on available ingredients
- Waste reduction analytics and tips`,
      type: 'prompt' as const,
      toolSpecific: {
        framer: 'Create a mobile app prototype with smooth animations and interactive components. Focus on micro-interactions and gesture-based navigation.',
        flutterflow: 'Build a cross-platform Flutter app with native performance. Implement camera integration and local database storage.',
        uizard: 'Design clean wireframes with intuitive user flow. Prioritize mobile-first design and accessibility.'
      }
    },
    {
      id: 'dashboard',
      title: 'Dashboard Page Design',
      icon: <Palette className="h-4 w-4" />,
      content: `# Dashboard Page

Design the main dashboard with these key elements:

## Layout Structure
- **Header**: Welcome message and notification bell
- **Quick Stats**: Cards showing total items, expiring soon, recipes available
- **Expiry Alerts**: List of items expiring in next 3 days
- **Quick Actions**: Scan new item, add manually, view recipes
- **Recent Activity**: Last scanned items and actions

## Visual Design
- Use card-based layout for easy scanning
- Implement color-coded alerts (red for urgent, yellow for warning)
- Add progress indicators for inventory levels
- Include empty states with helpful illustrations

## Interactions
- Pull-to-refresh for updating data
- Swipe actions on list items
- Floating action button for quick scan
- Smooth transitions between sections`,
      type: 'component' as const,
      toolSpecific: {
        framer: 'Create interactive dashboard with animated cards and smooth transitions. Add hover states and loading animations.',
        flutterflow: 'Implement dashboard with real-time data updates and native widgets. Use StreamBuilder for live updates.',
        uizard: 'Focus on clear information hierarchy and intuitive layout. Use consistent spacing and visual elements.'
      }
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Response Formatting Demo
        </h1>
        <p className="text-muted-foreground">
          See how AI responses are now beautifully formatted with rich markdown, syntax highlighting, and interactive elements. Compare the old plain text approach with the new professional formatting system.
        </p>
      </div>

      <Tabs defaultValue="before-after" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prompting">Effective Prompting</TabsTrigger>
          <TabsTrigger value="before-after">Before vs After</TabsTrigger>
          <TabsTrigger value="ai-response">AI Response Component</TabsTrigger>
          <TabsTrigger value="prompt-viewer">Prompt Viewer</TabsTrigger>
        </TabsList>

        <TabsContent value="prompting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-500">Ineffective Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded border border-red-200 dark:border-red-800">
                  <code className="text-sm">{poorPrompt}</code>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p><strong>Problems:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>No persona or context provided</li>
                    <li>Vague and overly broad task</li>
                    <li>No specific requirements or constraints</li>
                    <li>No format specification</li>
                    <li>Likely to produce generic, unhelpful results</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-500">Effective Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded border border-green-200 dark:border-green-800">
                  <code className="text-sm">{goodPrompt}</code>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p><strong>Strengths:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Clear persona: "first-time entrepreneur"</li>
                    <li>Specific task: "comprehensive business plan"</li>
                    <li>Detailed context: target market and product type</li>
                    <li>Defined format: "structured document with sections"</li>
                    <li>Will produce focused, actionable results</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Four-Component Framework</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">1. Persona</h4>
                  <p className="text-sm text-muted-foreground">Define who you are and your role</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">2. Task</h4>
                  <p className="text-sm text-muted-foreground">Clearly state what you want done</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">3. Context</h4>
                  <p className="text-sm text-muted-foreground">Provide relevant background and constraints</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">4. Format</h4>
                  <p className="text-sm text-muted-foreground">Specify how you want the response</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="before-after" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-500">Before: Plain Text Display</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded border text-sm font-mono max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{sampleMarkdown}</pre>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p><strong>Issues with plain text:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Poor readability and visual hierarchy</li>
                    <li>No syntax highlighting for code blocks</li>
                    <li>Tables displayed as raw markdown</li>
                    <li>No interactive elements or copy functionality</li>
                    <li>Unprofessional appearance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-500">After: Rich Formatting</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  <AIResponse
                    content={sampleMarkdown}
                    variant="compact"
                    showCopyButton={true}
                    className="border-0 rounded-none"
                  />
                </div>
                <div className="p-4 text-sm text-muted-foreground border-t">
                  <p><strong>Improvements with rich formatting:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Clear visual hierarchy with styled headings</li>
                    <li>Properly formatted tables and lists</li>
                    <li>Syntax-highlighted code blocks</li>
                    <li>Interactive copy functionality</li>
                    <li>Professional, readable presentation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-response" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                AIResponse Component Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIResponse 
                content={sampleMarkdown}
                variant="default"
                showCopyButton={true}
                title="Sample AI Analysis"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompt-viewer" className="space-y-6">
          <PromptViewer
            title="Mobile App Development Prompts"
            description="Ready-to-use prompts for building your grocery management app with AI builders. Each section includes tool-specific variations for Framer, FlutterFlow, and Uizard."
            appType="mobile"
            uiStyle="Modern Clean"
            sections={promptSections}
            showToolButtons={true}
          />

          <Card>
            <CardHeader>
              <CardTitle>Key Features of PromptViewer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Structured Sections</h4>
                  <p className="text-sm text-muted-foreground">Organized prompts with collapsible sections for easy navigation</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Tool-Specific Prompts</h4>
                  <p className="text-sm text-muted-foreground">Optimized versions for Framer, FlutterFlow, and Uizard</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">One-Click Copy</h4>
                  <p className="text-sm text-muted-foreground">Copy individual sections or tool-specific variations instantly</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIResponseDemo;
