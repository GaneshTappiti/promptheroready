import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Copy,
  ExternalLink,
  Download,
  Layers,
  Palette,
  Zap,
  CheckCircle2,
  Star,
  Clock,
  DollarSign,
  Users,
  Smartphone,
  Globe,
  Chrome,
  Brain,
  Monitor,
  Link,
  Sparkles,
  ChevronDown,
  FileText,
  Code,
  Share
} from "lucide-react";
import { MVPAnalysisResult } from "@/types/ideaforge";
import { aiToolsDatabase, getRecommendedTools, AITool } from "@/data/aiToolsDatabase";

interface MVPResultsDisplayProps {
  result: MVPAnalysisResult;
  onClose: () => void;
}

const MVPResultsDisplay: React.FC<MVPResultsDisplayProps> = ({ result, onClose }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("prompts");
  const [enhancedTools, setEnhancedTools] = useState<AITool[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get enhanced tool recommendations on component mount
  React.useEffect(() => {
    // Determine app type and platforms for better recommendations
    const appType = result.pages.some(p => p.name.toLowerCase().includes('dashboard')) ? 'saas' : 'web';
    const platforms = ['web']; // Could be derived from result data

    const recommendations = getRecommendedTools(appType, platforms, 'any');
    setEnhancedTools(recommendations);
  }, [result]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`
    });
  };

  const openInBuilder = (tool: AITool, prompt?: string) => {
    // Open the tool's official URL
    window.open(tool.officialUrl, '_blank');

    // If there's a prompt, copy it to clipboard for easy pasting
    if (prompt) {
      copyToClipboard(prompt, `${tool.name} prompt`);
      toast({
        title: `Opening ${tool.name}`,
        description: "Prompt copied to clipboard - paste it to get started!"
      });
    } else {
      toast({
        title: `Opening ${tool.name}`,
        description: "Ready to start building your MVP!"
      });
    }
  };

  const getToolIcon = (tool: AITool) => {
    switch (tool.category) {
      case 'app-builders': return <Zap className="h-5 w-5" />;
      case 'ui-ux': return <Palette className="h-5 w-5" />;
      case 'dev-ides': return <Monitor className="h-5 w-5" />;
      case 'chatbots': return <Brain className="h-5 w-5" />;
      case 'backend': return <Globe className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  const getPricingColorEnhanced = (pricing: string) => {
    switch (pricing) {
      case 'free': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'freemium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'paid': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };



  const exportToMarkdown = () => {
    const markdown = generateMarkdownExport(result);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mvp-blueprint.md';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "MVP blueprint downloaded as Markdown"
    });
  };

  const exportToJSON = () => {
    const jsonData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        type: "MVP Blueprint"
      },
      blueprint: result,
      prompts: {
        framework: result.frameworkPrompt,
        pages: result.pagePrompts,
        linking: result.linkingPrompt
      }
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mvp-blueprint.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "MVP blueprint downloaded as JSON"
    });
  };

  const exportToNotion = () => {
    const notionFormat = generateNotionExport(result);
    copyToClipboard(notionFormat, "Notion-formatted blueprint");
    toast({
      title: "Copied for Notion!",
      description: "Paste this into your Notion page"
    });
  };

  const shareBlueprint = () => {
    const shareData = {
      title: 'My MVP Blueprint',
      text: `Check out my MVP blueprint: ${result.pages.length} pages, ${result.recommendedTools.length} tool recommendations`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      copyToClipboard(shareData.text + '\n' + shareData.url, "Share link");
    }
  };

  const generateMarkdownExport = (result: MVPAnalysisResult): string => {
    return `# MVP Blueprint

## Pages Structure
${result.pages.map(page => `
### ${page.name}
${page.description}

**Components:** ${page.components.join(', ')}
**Layout:** ${page.layout}
`).join('')}

## Navigation Flow
**Type:** ${result.navigation.type}
**Structure:**
${result.navigation.structure.map(item => `- ${item.name}`).join('\n')}

## Styling Guide
- **Theme:** ${result.styling.theme}
- **Design Style:** ${result.styling.designStyle}
- **Typography:** ${result.styling.typography}
- **Color Scheme:** ${result.styling.colorScheme.join(', ')}

## Recommended Tools
${result.recommendedTools.map(tool => `
### ${tool.name}
${tool.description}

**Best For:** ${tool.bestFor.join(', ')}
**Pricing:** ${tool.pricing}
**URL:** ${tool.url}

**Pros:**
${tool.pros.map(pro => `- ${pro}`).join('\n')}

**Cons:**
${tool.cons.map(con => `- ${con}`).join('\n')}
`).join('')}

## UI Prompt
\`\`\`
${result.uiPrompt}
\`\`\`

## Launch Path
${result.launchPath.map(step => `
### Step ${step.step}: ${step.title}
${step.description}
**Estimated Time:** ${step.estimatedTime}
**Tools:** ${step.tools.join(', ')}
`).join('')}
`;
  };

  const generateNotionExport = (result: MVPAnalysisResult): string => {
    return `# 🚀 MVP Blueprint

## 📋 Project Overview
**Pages:** ${result.pages.length} | **Components:** ${result.components.length} | **Navigation:** ${result.navigation.type}
**Generated:** ${new Date().toLocaleDateString()}

---

## 📄 Pages
${result.pages.map(page => `
### ${page.name}
${page.description}
**Components:** ${page.components.join(', ')}
**Layout:** ${page.layout}
`).join('\n')}

---

## 🧭 Navigation Flow
**Type:** ${result.navigation.type}
**Structure:**
${result.navigation.structure.map(item => `- ${item.name}`).join('\n')}

---

## 🎨 Design System
- **Theme:** ${result.styling.theme}
- **Style:** ${result.styling.designStyle}
- **Typography:** ${result.styling.typography}
- **Colors:** ${result.styling.colorScheme.join(', ')}

---

## 🛠️ Recommended Tools
${result.recommendedTools.map(tool => `
### ${tool.name}
${tool.description}
**Best For:** ${tool.bestFor.join(', ')}
**Pricing:** ${tool.pricing}
`).join('\n')}

---

## 📝 AI Prompts

### Framework Prompt
\`\`\`
${result.frameworkPrompt || result.uiPrompt}
\`\`\`

### Page Prompts
${result.pagePrompts?.map(p => `
#### ${p.pageName}
\`\`\`
${p.prompt}
\`\`\`
`).join('\n') || ''}

### Navigation Prompt
\`\`\`
${result.linkingPrompt || 'Not generated yet'}
\`\`\`
`;
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'free': return 'bg-green-500/20 text-green-400';
      case 'freemium': return 'bg-blue-500/20 text-blue-400';
      case 'paid': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your MVP Blueprint</h1>
          <p className="text-muted-foreground">
            AI-generated structure and recommendations for your project
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToMarkdown}>
            <Download className="h-4 w-4 mr-2" />
            Export MD
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="prompts">Ready Prompts</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">Builder Tools</TabsTrigger>
          <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          <TabsTrigger value="enhance">Enhance</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
        </TabsList>

        {/* Ready Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          <div className="space-y-6">
            {/* Framework Prompt */}
            {result.frameworkPrompt && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Step 1: Framework Prompt
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.frameworkPrompt!, "Framework prompt")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
                    {result.frameworkPrompt}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Page Prompts */}
            {result.pagePrompts && result.pagePrompts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Step 2: Page UI Prompts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.pagePrompts.map((pagePrompt, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{pagePrompt.pageName} Page</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(pagePrompt.prompt, `${pagePrompt.pageName} page prompt`)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-muted/50 p-3 rounded text-sm font-mono max-h-32 overflow-y-auto">
                        {pagePrompt.prompt}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Linking Prompt */}
            {result.linkingPrompt && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Step 3: Navigation & Linking Prompt
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.linkingPrompt!, "Linking prompt")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
                    {result.linkingPrompt}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Usage Instructions */}
            <Card className="bg-gradient-to-r from-primary/10 to-green-500/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  How to Use These Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Step-by-Step Process:</h4>
                    <ol className="space-y-3 text-sm">
                      <li className="flex items-start gap-3">
                        <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0">1</span>
                        <div>
                          <div className="font-medium">Choose Your Builder</div>
                          <div className="text-muted-foreground">Select from our AI Tools recommendations</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0">2</span>
                        <div>
                          <div className="font-medium">Start with Framework</div>
                          <div className="text-muted-foreground">Copy and paste the Framework Prompt first</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0">3</span>
                        <div>
                          <div className="font-medium">Design Each Page</div>
                          <div className="text-muted-foreground">Use individual page prompts for detailed UI</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0">4</span>
                        <div>
                          <div className="font-medium">Connect & Launch</div>
                          <div className="text-muted-foreground">Apply navigation prompt and test your MVP</div>
                        </div>
                      </li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Pro Tips:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Start with one page to test the workflow</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Customize prompts based on your specific needs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Use the AI Tools tab for direct builder access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Export this blueprint for future reference</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(
                      `${result.frameworkPrompt}\n\n---\n\n${result.pagePrompts?.map(p => p.prompt).join('\n\n---\n\n') || ''}\n\n---\n\n${result.linkingPrompt || ''}`,
                      "All prompts"
                    )}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All Prompts
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('ai-tools')}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    View AI Tools
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Blueprint
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={exportToMarkdown}>
                        <FileText className="h-4 w-4 mr-2" />
                        Markdown (.md)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportToJSON}>
                        <Code className="h-4 w-4 mr-2" />
                        JSON (.json)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportToNotion}>
                        <FileText className="h-4 w-4 mr-2" />
                        Copy for Notion
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={shareBlueprint}>
                        <Share className="h-4 w-4 mr-2" />
                        Share Blueprint
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pages Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Pages ({result.pages.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.pages.map((page, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium">{page.name}</h4>
                    <p className="text-sm text-muted-foreground">{page.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {page.components.map((component, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Styling Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Styling Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Theme</Label>
                    <p className="text-sm capitalize">{result.styling.theme}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Style</Label>
                    <p className="text-sm capitalize">{result.styling.designStyle}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Typography</Label>
                  <p className="text-sm">{result.styling.typography}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Color Scheme</Label>
                  <div className="flex gap-2 mt-1">
                    {result.styling.colorScheme.map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* UI Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                UI Prompt
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.uiPrompt, "UI Prompt")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm">
                {result.uiPrompt}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Structure Tab */}
        <TabsContent value="structure" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Navigation Flow */}
            <Card>
              <CardHeader>
                <CardTitle>Navigation Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Type: <span className="font-medium capitalize">{result.navigation.type}</span>
                  </p>
                  <div className="space-y-2">
                    {result.navigation.structure.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        {item.name}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Components */}
            <Card>
              <CardHeader>
                <CardTitle>Components</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.components.map((component, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-medium">{component.name}</h4>
                      <Badge variant="outline" className="text-xs mb-2">
                        {component.type}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{component.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhanced AI Tools Tab */}
        <TabsContent value="ai-tools" className="space-y-6">
          <div className="space-y-6">
            {/* Header with category filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">AI Tools Recommendations</h2>
                <p className="text-muted-foreground">Curated tools to accelerate your MVP development</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All Tools
                </Button>
                <Button
                  variant={selectedCategory === 'app-builders' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('app-builders')}
                >
                  App Builders
                </Button>
                <Button
                  variant={selectedCategory === 'ui-ux' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('ui-ux')}
                >
                  UI/UX
                </Button>
              </div>
            </div>

            {/* Enhanced tools grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enhancedTools
                .filter(tool => selectedCategory === 'all' || tool.category === selectedCategory)
                .map((tool, index) => (
                <Card key={tool.id} className="relative hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          {getToolIcon(tool)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
                        </div>
                      </div>
                      {tool.popularity >= 85 && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={getPricingColorEnhanced(tool.pricing.model)}>
                        <DollarSign className="h-3 w-3 mr-1" />
                        {tool.pricing.inr}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Popularity: {tool.popularity}%
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Best For:</h4>
                      <div className="flex flex-wrap gap-1">
                        {tool.bestFor.slice(0, 3).map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {tool.bestFor.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tool.bestFor.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Why Recommended:</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{tool.whyRecommend}</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(tool.officialUrl, '_blank')}
                        className="flex-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openInBuilder(tool, result.frameworkPrompt)}
                        className="flex-1"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start Building
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick start guide */}
            <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Start Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h4 className="font-medium mb-2">Choose Your Tool</h4>
                    <p className="text-sm text-muted-foreground">Select the AI tool that best fits your project needs and budget</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h4 className="font-medium mb-2">Copy & Paste Prompts</h4>
                    <p className="text-sm text-muted-foreground">Use our generated prompts to quickly set up your project structure</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h4 className="font-medium mb-2">Build & Launch</h4>
                    <p className="text-sm text-muted-foreground">Follow the tool's workflow to bring your MVP to life</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhancement Tab */}
        <TabsContent value="enhance" className="space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Enhance Your MVP Blueprint</h2>
              <p className="text-muted-foreground">Iterate and improve your MVP with additional features and optimizations</p>
            </div>

            {/* Enhancement Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Add Advanced Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enhance your MVP with additional functionality like user authentication, payments, analytics, and more.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">User authentication & profiles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Payment integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Analytics & tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">API integrations</span>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Enhancement Prompts
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Design Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Refine your design with better UX patterns, accessibility improvements, and visual enhancements.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Accessibility improvements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Mobile responsiveness</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Animation & micro-interactions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Performance optimization</span>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Palette className="h-4 w-4 mr-2" />
                    Generate Design Prompts
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Platform Expansion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Expand your MVP to additional platforms and devices for broader reach.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Mobile app version</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Desktop application</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Browser extension</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">API for third-party integrations</span>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Globe className="h-4 w-4 mr-2" />
                    Generate Platform Prompts
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI-Powered Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Integrate AI capabilities to make your MVP smarter and more competitive.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">AI chatbot integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Smart recommendations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Automated content generation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Predictive analytics</span>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Brain className="h-4 w-4 mr-2" />
                    Generate AI Prompts
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Enhancement Workflow */}
            <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Enhancement Workflow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h4 className="font-medium mb-2">Choose Enhancement</h4>
                    <p className="text-sm text-muted-foreground">Select the type of improvement you want to add</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h4 className="font-medium mb-2">Generate Prompts</h4>
                    <p className="text-sm text-muted-foreground">Get AI prompts tailored to your enhancement needs</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h4 className="font-medium mb-2">Implement Changes</h4>
                    <p className="text-sm text-muted-foreground">Use the prompts in your chosen AI builder</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">4</span>
                    </div>
                    <h4 className="font-medium mb-2">Test & Iterate</h4>
                    <p className="text-sm text-muted-foreground">Validate improvements and continue enhancing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Original Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.recommendedTools
              .sort((a, b) => a.priority - b.priority)
              .map((tool, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {tool.logoUrl ? (
                        <img src={tool.logoUrl} alt={tool.name} className="w-10 h-10 rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                    {index === 0 && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        <Star className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge className={getPricingColor(tool.pricing)}>
                      <DollarSign className="h-3 w-3 mr-1" />
                      {tool.pricing}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Best For:</h4>
                    <div className="flex flex-wrap gap-1">
                      {tool.bestFor.map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-green-400">Pros:</h4>
                      <ul className="text-xs space-y-1">
                        {tool.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-orange-400">Cons:</h4>
                      <ul className="text-xs space-y-1">
                        {tool.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <div className="w-3 h-3 border border-orange-400 rounded-full mt-0.5 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(tool.url, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit {tool.name}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(tool.url, `${tool.name} URL`)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Launch Tab */}
        <TabsContent value="launch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Launch Roadmap
              </CardTitle>
              <p className="text-muted-foreground">
                Follow these steps to bring your MVP to life
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {result.launchPath.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-medium">
                        {step.step}
                      </div>
                      {index < result.launchPath.length - 1 && (
                        <div className="w-px h-16 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{step.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {step.estimatedTime}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{step.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {step.tools.map((tool, toolIdx) => (
                          <Badge key={toolIdx} className="bg-primary/20 text-primary">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">Choose your preferred tool from the recommendations</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                  <span>Copy the UI prompt and paste it into your chosen tool</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                  <span>Follow the launch roadmap step by step</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                  <span>Test your MVP with real users and iterate</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Label: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={className}>{children}</div>
);

export default MVPResultsDisplay;
