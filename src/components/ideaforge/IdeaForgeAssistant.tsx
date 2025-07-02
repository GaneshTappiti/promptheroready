
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import AIResponse from "@/components/ui/ai-response";
import { Brain, X, SendHorizontal, RefreshCw, Download } from "lucide-react";

interface IdeaForgeAssistantProps {
  onClose: () => void;
}

const IdeaForgeAssistant: React.FC<IdeaForgeAssistantProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState("");
  
  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Generate structured analysis using proper prompting framework
    setTimeout(() => {
      const structuredPrompt = `I am a startup business analyst with expertise in market research, competitive analysis, and business model development. Analyze the following startup idea: "${prompt}"

Context: This analysis is for an entrepreneur in the early validation stage who needs comprehensive insights to make informed decisions about pursuing this business opportunity.

Task: Provide a detailed business analysis covering:
1. Market opportunity and target audience assessment
2. Competitive landscape analysis with specific examples
3. Key differentiators and value proposition
4. Technical implementation recommendations
5. Business model and monetization strategy
6. Development timeline and cost estimates
7. Risk assessment and next steps

Format: Structure as a professional business analysis report with clear sections, data-driven insights, and actionable recommendations. Include specific examples and quantitative estimates where possible.`;

      // Simulate AI processing the structured prompt
      const response = `# Business Analysis Report

## Executive Summary

Based on the analysis of "${prompt}", this concept demonstrates strong market potential with clear differentiation opportunities in an established but evolving market segment.

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

      setResponse(response);
      setIsGenerating(false);
    }, 1500);
  };
  
  return (
    <div className="fixed bottom-8 right-8 w-96 shadow-xl animate-fade-in z-50">
      <Card className="overflow-hidden">
        <div className="bg-primary p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-primary-foreground">
            <Brain className="h-5 w-5" />
            <h3 className="font-semibold">IdeaForge AI Assistant</h3>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-primary/80"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto bg-muted/30">
          {response ? (
            <div className="mb-4">
              <AIResponse
                content={response}
                variant="default"
                showCopyButton={true}
                title="AI Analysis Results"
                className="bg-card/50 border-primary/20"
              />

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Regenerate
                </Button>
                <Button size="sm" variant="outline" className="gap-1">
                  <Download className="h-3 w-3" />
                  Save to Wiki
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-2 text-primary/50" />
              <h3 className="font-medium mb-1">How can I help you?</h3>
              <p className="text-sm text-muted-foreground">
                Ask me to brainstorm, analyze your idea, generate sections, or suggest improvements
              </p>
            </div>
          )}
        </div>
        
        <div className="p-3 border-t">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask me anything about your idea..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[60px] resize-none"
            />
            <Button 
              className="h-auto"
              disabled={!prompt.trim() || isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <SendHorizontal className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2">
            Suggestions: 
            <Button 
              variant="link" 
              className="text-xs h-auto p-0 px-1"
              onClick={() => setPrompt("Generate a business model for my idea")}
            >
              Business model
            </Button>
            <Button 
              variant="link" 
              className="text-xs h-auto p-0 px-1"
              onClick={() => setPrompt("Analyze market potential")}
            >
              Market analysis
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IdeaForgeAssistant;
