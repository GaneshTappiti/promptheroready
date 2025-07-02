import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Palette, 
  Monitor, 
  Smartphone,
  Eye,
  Edit3,
  CheckCircle2,
  ArrowRight,
  Wand2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/services/mvpStudioAnalytics";
import { PagePrompt } from "@/types/ideaforge";
import { BuilderToolRecommendation } from "@/services/frameworkGenerator";

interface PagePromptGeneratorProps {
  pagePrompts: PagePrompt[];
  builderTools: BuilderToolRecommendation[];
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  onPromptUpdate: (index: number, prompt: string) => void;
  onComplete: () => void;
}

const PagePromptGenerator: React.FC<PagePromptGeneratorProps> = ({
  pagePrompts,
  builderTools,
  currentPageIndex,
  onPageChange,
  onPromptUpdate,
  onComplete
}) => {
  const { toast } = useToast();
  const analytics = useAnalytics();
  const [selectedBuilder, setSelectedBuilder] = useState(builderTools[0]?.tool.name || 'framer');
  const [customizations, setCustomizations] = useState({
    colorScheme: 'default',
    animation: 'subtle',
    spacing: 'comfortable',
    typography: 'modern'
  });

  const currentPage = pagePrompts[currentPageIndex];
  const isLastPage = currentPageIndex === pagePrompts.length - 1;

  // Safety checks
  if (!pagePrompts || pagePrompts.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No pages generated yet. Please generate the framework first.</p>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Loading page data...</p>
      </div>
    );
  }

  if (!builderTools || builderTools.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No builder tools available. Please try regenerating the framework.</p>
      </div>
    );
  }

  const copyPrompt = (prompt: string, pageName: string) => {
    navigator.clipboard.writeText(prompt);

    // Track page prompt generation
    analytics.trackPagePromptGeneration(
      pageName,
      selectedBuilder,
      prompt.length,
      true
    );

    toast({
      title: "Prompt Copied!",
      description: `${pageName} prompt copied to clipboard. Ready to paste into ${selectedBuilder}!`
    });
  };

  const openBuilder = (url: string, toolName: string) => {
    window.open(url, '_blank');
    toast({
      title: `Opening ${toolName}`,
      description: "Paste your copied prompt to start building!"
    });
  };

  const generateEnhancedPrompt = (basePrompt: string) => {
    const enhancements = {
      colorScheme: {
        'vibrant': 'Use vibrant, energetic colors with high contrast',
        'pastel': 'Use soft, pastel colors for a gentle, approachable feel',
        'monochrome': 'Use a sophisticated monochrome palette with accent colors',
        'default': 'Use a balanced color palette appropriate for the design style'
      },
      animation: {
        'none': 'No animations - focus on static, clean design',
        'subtle': 'Add subtle hover effects and smooth transitions',
        'dynamic': 'Include engaging animations and micro-interactions',
        'playful': 'Use fun, bouncy animations that delight users'
      },
      spacing: {
        'compact': 'Use tight spacing for information-dense layouts',
        'comfortable': 'Use comfortable spacing for easy reading and navigation',
        'spacious': 'Use generous whitespace for a premium, luxurious feel'
      },
      typography: {
        'modern': 'Use modern, clean sans-serif fonts',
        'classic': 'Use traditional, readable serif fonts',
        'playful': 'Use friendly, rounded fonts with personality',
        'technical': 'Use monospace or technical fonts for a developer feel'
      }
    };

    const enhancementText = Object.entries(customizations)
      .map(([key, value]) => enhancements[key as keyof typeof enhancements][value])
      .join('. ');

    return `${basePrompt}

## Enhanced Design Requirements
${enhancementText}

## Builder-Specific Instructions
${getBuilderInstructions(selectedBuilder)}

## Quality Checklist
- ✅ Responsive design for all screen sizes
- ✅ Accessibility compliance (WCAG 2.1)
- ✅ Fast loading and performance optimized
- ✅ Consistent with overall app design system
- ✅ User-friendly and intuitive interface`;
  };

  const getBuilderInstructions = (builder: string) => {
    const instructions: Record<string, string> = {
      'framer': `
**Framer Instructions:**
- Use Framer's component variants for different states
- Implement smooth page transitions and micro-interactions
- Utilize Framer's responsive breakpoint system
- Add hover effects and interactive elements
- Use Framer's built-in CMS for dynamic content`,
      
      'flutterflow': `
**FlutterFlow Instructions:**
- Design with mobile-first approach
- Use FlutterFlow's widget library and custom widgets
- Implement proper navigation and state management
- Add Firebase integration for backend functionality
- Ensure cross-platform compatibility (iOS/Android)`,
      
      'webflow': `
**Webflow Instructions:**
- Use Webflow's class-based styling system
- Implement responsive design with Webflow's grid
- Add Webflow CMS for dynamic content management
- Use Webflow's interaction system for animations
- Optimize for SEO with proper meta tags and structure`,
      
      'bubble': `
**Bubble Instructions:**
- Design with Bubble's responsive engine
- Use Bubble's database for data storage and management
- Implement workflows for user interactions and logic
- Add proper privacy rules for data security
- Utilize Bubble's plugin ecosystem for extended functionality`
    };
    
    return instructions[builder.toLowerCase()] || 'Follow platform-specific best practices for optimal results.';
  };

  const getBuilderSpecificPrompt = () => {
    if (!currentPage) {
      return 'Loading prompt...';
    }

    if (currentPage.builderSpecific && currentPage.builderSpecific[selectedBuilder.toLowerCase()]) {
      return currentPage.builderSpecific[selectedBuilder.toLowerCase()];
    }

    if (!currentPage.prompt) {
      return 'Prompt not yet generated. Please wait...';
    }

    return generateEnhancedPrompt(currentPage.prompt);
  };

  return (
    <div className="space-y-6">
      {/* Page Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Page-by-Page UI Generation</h3>
          <p className="text-muted-foreground">
            Generate optimized prompts for each page ({currentPageIndex + 1} of {pagePrompts.length})
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))}
            disabled={currentPageIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(pagePrompts.length - 1, currentPageIndex + 1))}
            disabled={isLastPage}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Page Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {pagePrompts.map((page, index) => (
          <Card 
            key={index}
            className={`cursor-pointer transition-all ${
              index === currentPageIndex 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onPageChange(index)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{page.pageName}</h4>
                {index <= currentPageIndex && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {page.components.slice(0, 3).map((component, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {component}
                  </Badge>
                ))}
                {page.components.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{page.components.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Page Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {currentPage.pageName} Page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Builder Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Choose Builder Tool</label>
              <Select value={selectedBuilder} onValueChange={setSelectedBuilder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {builderTools.map((tool) => (
                    <SelectItem key={tool.tool.id} value={tool.tool.name}>
                      <div className="flex items-center gap-2">
                        <span>{tool.tool.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {tool.estimatedTime}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              {builderTools.slice(0, 3).map((tool) => (
                <Button
                  key={tool.tool.id}
                  variant="outline"
                  size="sm"
                  onClick={() => openBuilder(tool.tool.officialUrl, tool.tool.name)}
                  className="flex-1"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {tool.tool.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Customization Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Color Scheme</label>
              <Select 
                value={customizations.colorScheme} 
                onValueChange={(value) => setCustomizations(prev => ({ ...prev, colorScheme: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="vibrant">Vibrant</SelectItem>
                  <SelectItem value="pastel">Pastel</SelectItem>
                  <SelectItem value="monochrome">Monochrome</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Animation</label>
              <Select 
                value={customizations.animation} 
                onValueChange={(value) => setCustomizations(prev => ({ ...prev, animation: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="subtle">Subtle</SelectItem>
                  <SelectItem value="dynamic">Dynamic</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Spacing</label>
              <Select 
                value={customizations.spacing} 
                onValueChange={(value) => setCustomizations(prev => ({ ...prev, spacing: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Typography</label>
              <Select 
                value={customizations.typography} 
                onValueChange={(value) => setCustomizations(prev => ({ ...prev, typography: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generated Prompt */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Generated Prompt</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyPrompt(getBuilderSpecificPrompt(), currentPage.pageName)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const selectedTool = builderTools.find(t => t.tool.name === selectedBuilder);
                    if (selectedTool) {
                      openBuilder(selectedTool.tool.officialUrl, selectedTool.tool.name);
                    }
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open {selectedBuilder}
                </Button>
              </div>
            </div>
            <Textarea
              value={getBuilderSpecificPrompt()}
              onChange={(e) => onPromptUpdate(currentPageIndex, e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Generated prompt will appear here..."
            />
          </div>

          {/* Page Components */}
          <div>
            <label className="text-sm font-medium mb-2 block">Page Components</label>
            <div className="flex flex-wrap gap-2">
              {currentPage.components.map((component, index) => (
                <Badge key={index} variant="secondary">
                  {component}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0}
              >
                Previous Page
              </Button>
            </div>
            <div className="flex gap-2">
              {!isLastPage ? (
                <Button
                  onClick={() => onPageChange(currentPageIndex + 1)}
                  className="flex items-center gap-2"
                >
                  Next Page
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={onComplete}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80"
                >
                  Generate Navigation
                  <Wand2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagePromptGenerator;
