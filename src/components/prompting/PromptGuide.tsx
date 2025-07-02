import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIResponse from '@/components/ui/ai-response';

const PromptGuide: React.FC = () => {
  const promptExamples = {
    poor: `Write a business plan`,
    
    good: `I am a first-time entrepreneur launching a SaaS product. Write a comprehensive business plan for a project management tool targeting small businesses with 10-50 employees. Include market analysis, competitive landscape, revenue projections for the first 3 years, and go-to-market strategy. Format as a structured document with clear sections and bullet points where appropriate.`
  };

  const frameworkExample = `# Effective AI Prompt Framework

## Four Key Components

### 1. Persona
Define who you are and your role. This provides context for the AI to understand your perspective and needs.

**Example:** "I am a startup founder in the fintech space" or "I am a product manager at a B2B SaaS company"

### 2. Task
Clearly state what you want the AI to do. Be specific about the desired outcome.

**Example:** "Analyze the competitive landscape" or "Create a go-to-market strategy"

### 3. Context
Provide relevant background information, constraints, and specific details.

**Example:** "For a mobile payment app targeting millennials in urban areas with a budget of $50,000 for initial marketing"

### 4. Format
Specify how you want the response structured and delivered.

**Example:** "Present as a table with pros and cons" or "Write in bullet points under 500 words"

## Prompt Structure Template

**Persona:** I am [your role/position]
**Task:** [Specific action you want performed]
**Context:** [Relevant background, constraints, specifics]
**Format:** [How you want the response structured]

## Example Application

**Poor Prompt:**
"Help me with marketing"

**Improved Prompt:**
"I am a B2B SaaS founder launching an AI-powered customer service platform. Create a comprehensive marketing strategy targeting mid-market companies with 100-500 employees who currently use traditional helpdesk software. Focus on digital channels with a monthly budget of $10,000. Present the strategy as a 90-day action plan with specific tactics, timelines, and success metrics."`;

  const startupPrompts = `# Startup-Specific Prompt Templates

## Market Research
I am a [industry] entrepreneur validating a business idea. Analyze the market opportunity for [specific product/service] targeting [specific customer segment]. Research market size, growth trends, key players, and potential barriers to entry. Present findings in a structured report with data sources and actionable insights.

## Competitive Analysis
I am launching [product description] in the [industry] space. Conduct a comprehensive competitive analysis of [3-5 specific competitors]. Compare features, pricing, market positioning, strengths, and weaknesses. Identify market gaps and differentiation opportunities. Format as a comparison table with strategic recommendations.

## MVP Planning
I am a technical founder building [product description]. Help me define the minimum viable product scope for [target customer]. Prioritize features based on customer value and development complexity. Create a feature roadmap for the first 6 months with clear milestones and success criteria.

## Fundraising Strategy
I am a startup founder seeking [funding stage] investment for [business description]. Develop a fundraising strategy including investor targeting, pitch deck outline, financial projections, and timeline. Focus on [specific industry/stage] investors who invest in [company stage/size]. Present as an actionable 3-month plan.

## Go-to-Market Strategy
I am launching [product] for [target market]. Create a go-to-market strategy covering customer acquisition channels, pricing strategy, sales process, and marketing tactics. Budget is [amount] over [timeframe]. Include specific metrics and KPIs to track success.`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Prompting Guide for Startups</h1>
        <p className="text-muted-foreground">
          Learn to write effective prompts that generate better AI responses for your startup needs
        </p>
      </div>

      <Tabs defaultValue="framework" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="framework">Framework</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="tips">Best Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="framework" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>The Four-Component Framework</CardTitle>
            </CardHeader>
            <CardContent>
              <AIResponse 
                content={frameworkExample}
                variant="default"
                showCopyButton={true}
                className="border-0"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Ineffective Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded border border-red-200 dark:border-red-800">
                  <code className="text-sm">{promptExamples.poor}</code>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p><strong>Problems:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>No persona or context</li>
                    <li>Vague task description</li>
                    <li>No format specification</li>
                    <li>Too broad and unfocused</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Effective Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded border border-green-200 dark:border-green-800">
                  <code className="text-sm">{promptExamples.good}</code>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p><strong>Strengths:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Clear persona and experience level</li>
                    <li>Specific task and deliverable</li>
                    <li>Detailed context and constraints</li>
                    <li>Defined format and structure</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ready-to-Use Startup Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <AIResponse 
                content={startupPrompts}
                variant="default"
                showCopyButton={true}
                className="border-0"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Writing Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Use Natural Language</h4>
                  <p className="text-sm text-muted-foreground">
                    Write prompts as if you're having a conversation. Use everyday speech patterns and clear, direct language.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Be Specific</h4>
                  <p className="text-sm text-muted-foreground">
                    Provide clear, detailed instructions. Specify exactly what you want rather than leaving it open-ended.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Stay Concise</h4>
                  <p className="text-sm text-muted-foreground">
                    Include essential details but avoid unnecessary words. Long, rambling prompts can confuse AI tools.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Refinement Strategies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Iterate and Improve</h4>
                  <p className="text-sm text-muted-foreground">
                    If results aren't what you expected, refine your prompt. Add context, clarify instructions, or adjust the format.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Test Different Approaches</h4>
                  <p className="text-sm text-muted-foreground">
                    Try rephrasing your prompts in different ways to see what works best for your specific use case.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Build on Responses</h4>
                  <p className="text-sm text-muted-foreground">
                    Use AI responses as starting points. Ask follow-up questions or request specific improvements to refine the output.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromptGuide;
