import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Download, 
  Copy, 
  ExternalLink, 
  FileText, 
  Package,
  Share2,
  Sparkles,
  Code,
  Palette,
  Link,
  CheckCircle2,
  Eye,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/services/mvpStudioAnalytics";
import { GeneratedFramework } from "@/services/frameworkGenerator";
import { PagePrompt } from "@/types/ideaforge";

interface ExportablePromptsSystemProps {
  framework: GeneratedFramework;
  pagePrompts: PagePrompt[];
  linkingPrompt: string;
  appName: string;
}

const ExportablePromptsSystem: React.FC<ExportablePromptsSystemProps> = ({
  framework,
  pagePrompts,
  linkingPrompt,
  appName
}) => {
  const { toast } = useToast();
  const analytics = useAnalytics();
  const [exportFormat, setExportFormat] = useState<'gpt-ready' | 'markdown' | 'json' | 'notion' | 'txt'>('gpt-ready');
  const [selectedBuilder, setSelectedBuilder] = useState(framework.builderTools[0]?.tool.name.toLowerCase() || 'framer');
  const [includeInstructions, setIncludeInstructions] = useState(true);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  const generateExportContent = () => {
    switch (exportFormat) {
      case 'gpt-ready':
        return generateGPTReadyExport();
      case 'markdown':
        return generateMarkdownExport();
      case 'json':
        return generateJSONExport();
      case 'notion':
        return generateNotionExport();
      case 'txt':
        return generateTextExport();
      default:
        return generateGPTReadyExport();
    }
  };

  const generateGPTReadyExport = () => {
    const builderInstructions = getBuilderSpecificInstructions(selectedBuilder);

    return `# ${appName} - GPT-Ready Prompts for ${selectedBuilder.charAt(0).toUpperCase() + selectedBuilder.slice(1)}

## 🎯 How to Use These Prompts

1. **Copy each prompt individually** - Don't paste all at once
2. **Start with Framework Prompt** - This creates your app structure
3. **Then use Page Prompts one by one** - For each screen/page
4. **Finish with Navigation Prompt** - To connect everything
5. **Paste into ${selectedBuilder.charAt(0).toUpperCase() + selectedBuilder.slice(1)}** - Follow the builder-specific instructions below

${builderInstructions}

---

## 🏗️ FRAMEWORK PROMPT
**Use this first to create your app structure**

\`\`\`
${framework.prompts.framework}
\`\`\`

---

## 🎨 PAGE PROMPTS
**Use these one by one for each page**

${pagePrompts.map((page, index) => `
### ${index + 1}. ${page.pageName} Page

\`\`\`
${page.builderSpecific[selectedBuilder] || page.prompt}
\`\`\`

**Components:** ${page.components.join(', ')}
**Layout:** ${page.layout}

---`).join('')}

## 🔗 NAVIGATION PROMPT
**Use this last to connect all pages**

\`\`\`
${linkingPrompt}
\`\`\`

---

## 📋 Quick Checklist

- [ ] Framework prompt used ✅
${pagePrompts.map((page, index) => `- [ ] ${page.pageName} page created ✅`).join('\n')}
- [ ] Navigation implemented ✅
- [ ] App tested ✅

**Generated on:** ${new Date().toLocaleDateString()}
**Builder:** ${selectedBuilder.charAt(0).toUpperCase() + selectedBuilder.slice(1)}
**Total Prompts:** ${pagePrompts.length + 2}`;
  };

  const getBuilderSpecificInstructions = (builder: string) => {
    const instructions = {
      'framer': `
## 🎨 Framer Instructions

1. **Open Framer** → Create new project
2. **Use AI Assistant** → Paste framework prompt first
3. **Create Components** → Use page prompts for each screen
4. **Add Interactions** → Use navigation prompt for linking
5. **Preview & Test** → Check all flows work

**Pro Tips:**
- Use Framer's component variants for different states
- Add smooth transitions between pages
- Utilize responsive breakpoints
- Test on mobile and desktop`,

      'flutterflow': `
## 📱 FlutterFlow Instructions

1. **Create New Project** → Choose Flutter app
2. **Set Up Pages** → Use framework prompt to plan structure
3. **Design Each Page** → Use page prompts in UI Builder
4. **Add Navigation** → Use navigation prompt for routing
5. **Configure Backend** → Add Firebase if needed

**Pro Tips:**
- Start with mobile-first design
- Use FlutterFlow's widget library
- Set up proper state management
- Test on both iOS and Android simulators`,

      'uizard': `
## 🎯 Uizard Instructions

1. **Start New Project** → Choose app type
2. **Use AI Design** → Paste framework prompt
3. **Generate Screens** → Use page prompts individually
4. **Connect Flows** → Use navigation prompt
5. **Export Code** → Download when ready

**Pro Tips:**
- Use Uizard's AI to generate from text
- Iterate on designs with AI suggestions
- Export to code when satisfied
- Test user flows before finalizing`,

      'builder.io': `
## 🏗️ Builder.io Instructions

1. **Create New Project** → Choose framework (React/Vue/etc)
2. **Set Up Pages** → Use framework prompt for structure
3. **Design Components** → Use page prompts for each section
4. **Add Navigation** → Implement routing with navigation prompt
5. **Publish** → Deploy when ready

**Pro Tips:**
- Use Builder's visual editor
- Leverage component library
- Set up proper SEO
- Test performance before launch`
    };

    return instructions[builder as keyof typeof instructions] || instructions['framer'];
  };

  const generateMarkdownExport = () => {
    const selectedTool = framework.builderTools.find(t => t.tool.name === selectedBuilder);
    
    return `# ${appName} - MVP Builder Prompts

Generated on: ${new Date().toLocaleDateString()}
Recommended Builder: **${selectedBuilder}**
Estimated Time: ${selectedTool?.estimatedTime || '1-2 weeks'}

## 🏗️ Framework Overview

### App Structure
- **Type**: ${framework.appStructure.type}
- **Architecture**: ${framework.appStructure.architecture}
- **Core Modules**: ${framework.appStructure.coreModules.join(', ')}

### Tech Stack Recommendation
- **Frontend**: ${framework.techStack.frontend.join(', ')}
- **Backend**: ${framework.techStack.backend.join(', ')}
- **Database**: ${framework.techStack.database.join(', ')}
- **Deployment**: ${framework.techStack.deployment.join(', ')}

**Reasoning**: ${framework.techStack.reasoning}

## 📋 Framework Generation Prompt

\`\`\`
${framework.prompts.framework}
\`\`\`

## 📄 Page-by-Page Prompts

${pagePrompts.map((page, index) => `
### ${index + 1}. ${page.pageName} Page

**Components**: ${page.components.join(', ')}
**Layout**: ${page.layout}

#### ${selectedBuilder} Prompt:
\`\`\`
${page.builderSpecific[selectedBuilder.toLowerCase()] || page.prompt}
\`\`\`

---
`).join('')}

## 🔗 Navigation & Linking Prompt

\`\`\`
${linkingPrompt}
\`\`\`

## 🛠️ Recommended Builder Tools

${framework.builderTools.map(tool => `
### ${tool.tool.name}
- **Suitability Score**: ${tool.suitabilityScore}/100
- **Estimated Time**: ${tool.estimatedTime}
- **Complexity**: ${tool.complexity}
- **URL**: ${tool.tool.officialUrl}

**Why Recommended**: ${tool.reasons.join(', ')}
`).join('')}

## 🚀 Quick Start Guide

1. **Choose Your Builder**: We recommend ${selectedBuilder} for this project
2. **Start with Framework**: Copy the framework prompt and paste it into ${selectedBuilder}
3. **Build Page by Page**: Use each page prompt to create individual screens
4. **Connect with Navigation**: Implement the linking prompt for seamless navigation
5. **Deploy**: Use ${framework.techStack.deployment[0]} for quick deployment

${includeInstructions ? `
## 📖 Builder-Specific Instructions

### ${selectedBuilder} Setup:
${getBuilderSetupInstructions(selectedBuilder)}

### Tips for Success:
- Start with the framework prompt to establish the overall structure
- Build pages in order of priority (high → medium → low)
- Test navigation flow between pages regularly
- Use the recommended tech stack for best compatibility
- Deploy early and iterate based on user feedback
` : ''}

---
*Generated by MVP Studio - Your AI-Powered MVP Builder*`;
  };

  const generateJSONExport = () => {
    return JSON.stringify({
      appName,
      generatedAt: new Date().toISOString(),
      recommendedBuilder: selectedBuilder,
      framework: {
        structure: framework.appStructure,
        techStack: framework.techStack,
        prompt: framework.prompts.framework
      },
      pages: pagePrompts.map(page => ({
        name: page.pageName,
        components: page.components,
        layout: page.layout,
        prompt: page.builderSpecific[selectedBuilder.toLowerCase()] || page.prompt
      })),
      navigation: {
        structure: framework.navigation,
        prompt: linkingPrompt
      },
      builderTools: framework.builderTools.map(tool => ({
        name: tool.tool.name,
        url: tool.tool.officialUrl,
        suitabilityScore: tool.suitabilityScore,
        estimatedTime: tool.estimatedTime,
        reasons: tool.reasons
      }))
    }, null, 2);
  };

  const generateNotionExport = () => {
    return `# ${appName} MVP Builder Guide

## Overview
App Type: ${framework.appStructure.type}
Recommended Builder: ${selectedBuilder}
Generated: ${new Date().toLocaleDateString()}

## Framework Prompt
${framework.prompts.framework}

## Page Prompts
${pagePrompts.map((page, index) => `
## ${page.pageName}
${page.builderSpecific[selectedBuilder.toLowerCase()] || page.prompt}
`).join('')}

## Navigation
${linkingPrompt}

## Tools
${framework.builderTools.map(tool => `- ${tool.tool.name}: ${tool.tool.officialUrl}`).join('\n')}`;
  };

  const generateTextExport = () => {
    return `${appName} - MVP Builder Prompts

=== FRAMEWORK ===
${framework.prompts.framework}

=== PAGES ===
${pagePrompts.map((page, index) => `
--- ${page.pageName.toUpperCase()} ---
${page.builderSpecific[selectedBuilder.toLowerCase()] || page.prompt}
`).join('')}

=== NAVIGATION ===
${linkingPrompt}

=== TOOLS ===
${framework.builderTools.map(tool => `${tool.tool.name}: ${tool.tool.officialUrl}`).join('\n')}`;
  };

  const getBuilderSetupInstructions = (builder: string) => {
    const instructions: Record<string, string> = {
      'framer': `1. Sign up at framer.com
2. Create a new project
3. Use the AI website generator feature
4. Paste the framework prompt first
5. Create pages using individual page prompts
6. Connect pages with Framer's link system`,
      
      'flutterflow': `1. Sign up at flutterflow.io
2. Create a new Flutter project
3. Set up Firebase integration
4. Use the visual builder with page prompts
5. Implement navigation between screens
6. Test on both iOS and Android`,
      
      'webflow': `1. Sign up at webflow.com
2. Create a new site project
3. Use Webflow's designer with prompts
4. Set up CMS for dynamic content
5. Implement responsive design
6. Publish to Webflow hosting`,
      
      'bubble': `1. Sign up at bubble.io
2. Create a new web app
3. Set up database structure
4. Use visual editor with prompts
5. Create workflows for interactions
6. Set up privacy rules and deploy`
    };
    
    return instructions[builder.toLowerCase()] || 'Follow platform-specific setup instructions';
  };

  const copyToClipboard = (content: string, type: string) => {
    try {
      navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`
      });
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Track export action
    analytics.trackExportAction(
      exportFormat,
      selectedBuilder,
      pagePrompts.length
    );

    toast({
      title: "Downloaded!",
      description: `${filename} has been downloaded`
    });
  };

  const openBuilder = (url: string, name: string) => {
    window.open(url, '_blank');
    toast({
      title: `Opening ${name}`,
      description: "Ready to start building your MVP!"
    });
  };

  // Safety checks
  if (!framework || !pagePrompts || pagePrompts.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No framework data available. Please generate the framework first.</p>
      </div>
    );
  }

  const exportContent = generateExportContent();
  const filename = `${appName.toLowerCase().replace(/\s+/g, '-')}-mvp-prompts.${exportFormat}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export MVP Prompts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Export Format</label>
              <Select value={exportFormat} onValueChange={(value: string) => setExportFormat(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-ready">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      GPT-Ready Prompts (Recommended)
                    </div>
                  </SelectItem>
                  <SelectItem value="markdown">Markdown (.md)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                  <SelectItem value="notion">Notion Format</SelectItem>
                  <SelectItem value="txt">Plain Text (.txt)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target Builder</label>
              <Select value={selectedBuilder} onValueChange={setSelectedBuilder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="framer">🎨 Framer</SelectItem>
                  <SelectItem value="flutterflow">📱 FlutterFlow</SelectItem>
                  <SelectItem value="uizard">🎯 Uizard</SelectItem>
                  <SelectItem value="builder.io">🏗️ Builder.io</SelectItem>
                  {framework.builderTools.map((tool) => (
                    <SelectItem key={tool.tool.id} value={tool.tool.name}>
                      {tool.tool.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIncludeInstructions(!includeInstructions)}
              >
                {includeInstructions ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {includeInstructions ? 'Instructions Included' : 'Add Instructions'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Copy className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Copy All Prompts</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Copy the complete prompt bundle to clipboard
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => copyToClipboard(exportContent, 'Complete prompt bundle')}
          >
            Copy Bundle
          </Button>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Download className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Download File</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Download prompts as {exportFormat.toUpperCase()} file
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => downloadFile(exportContent, filename)}
          >
            Download {exportFormat.toUpperCase()}
          </Button>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <ExternalLink className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Open Builder</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Launch {selectedBuilder} to start building
          </p>
          <Button 
            className="w-full"
            onClick={() => {
              const tool = framework.builderTools.find(t => t.tool.name === selectedBuilder);
              if (tool) openBuilder(tool.tool.officialUrl, tool.tool.name);
            }}
          >
            Open {selectedBuilder}
          </Button>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={exportContent}
            readOnly
            className="min-h-[300px] font-mono text-xs"
            placeholder="Export preview will appear here..."
          />
        </CardContent>
      </Card>

      {/* Builder Tools Grid */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Recommended Builder Tools</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {framework.builderTools.map((tool, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="font-medium">{tool.tool.name}</h5>
                  <p className="text-sm text-muted-foreground">{tool.tool.description}</p>
                </div>
                <Badge variant={tool.suitabilityScore >= 80 ? 'default' : 'secondary'}>
                  {tool.suitabilityScore}/100
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Estimated Time:</span>
                  <span className="font-medium">{tool.estimatedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Complexity:</span>
                  <Badge variant="outline" className="text-xs">
                    {tool.complexity}
                  </Badge>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Why recommended:</span>
                  <p className="text-muted-foreground">{tool.reasons.join(', ')}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedBuilder(tool.tool.name)}
                >
                  Select
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => openBuilder(tool.tool.officialUrl, tool.tool.name)}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Success Actions */}
      <div className="text-center pt-6 border-t">
        <div className="flex items-center justify-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span className="font-medium">Your MVP Blueprint is Ready!</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={() => {
              copyToClipboard(exportContent, 'Complete MVP blueprint');
              const tool = framework.builderTools.find(t => t.tool.name === selectedBuilder);
              if (tool) {
                setTimeout(() => openBuilder(tool.tool.officialUrl, tool.tool.name), 1000);
              }
            }}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            <Zap className="h-4 w-4 mr-2" />
            Copy & Launch {selectedBuilder}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => downloadFile(exportContent, filename)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download for Later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportablePromptsSystem;
