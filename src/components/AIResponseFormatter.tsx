import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Copy,
  Download,
  ChevronDown,
  ChevronRight,
  Code,
  FileText,
  Palette,
  Link,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface AIResponseFormatterProps {
  response: string;
  title?: string;
  toolType?: 'framer' | 'flutterflow' | 'uizard' | 'cursor' | 'lovable' | 'general';
  className?: string;
  showToolSpecific?: boolean;
}

const AIResponseFormatter: React.FC<AIResponseFormatterProps> = ({
  response,
  title = "AI Response",
  toolType = 'general',
  className,
  showToolSpecific = true
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('formatted');
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string = "Response") => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: `${filename} has been downloaded.`,
    });
  };

  // Parse response into sections
  const parseResponse = (text: string) => {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = { title: '', content: '', type: 'text' };
    
    for (const line of lines) {
      // Check for headers (markdown style)
      if (line.match(/^#{1,6}\s/)) {
        if (currentSection.content) {
          sections.push({ ...currentSection });
        }
        currentSection = {
          title: line.replace(/^#{1,6}\s/, ''),
          content: '',
          type: 'text'
        };
      }
      // Check for code blocks
      else if (line.match(/^```/)) {
        currentSection.type = currentSection.type === 'code' ? 'text' : 'code';
      }
      // Check for lists
      else if (line.match(/^[-*+]\s/) || line.match(/^\d+\.\s/)) {
        if (currentSection.type !== 'list') {
          if (currentSection.content) {
            sections.push({ ...currentSection });
          }
          currentSection = {
            title: currentSection.title || 'List',
            content: line + '\n',
            type: 'list'
          };
        } else {
          currentSection.content += line + '\n';
        }
      } else {
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection.content) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const formatForTool = (text: string, tool: string) => {
    const toolInstructions = {
      framer: `// Framer-specific prompt
// Use this prompt in Framer's AI assistant or remix feature

${text}

// Additional Framer tips:
// - Use Framer's component library
// - Leverage auto-layout and responsive design
// - Consider Framer Motion for animations`,

      flutterflow: `/* FlutterFlow-specific prompt
   Use this in FlutterFlow's AI Page Generator */

${text}

/* FlutterFlow tips:
   - Use FlutterFlow's widget library
   - Set up proper navigation between pages
   - Configure Firebase backend if needed */`,

      uizard: `<!-- Uizard-specific prompt
     Use this in Uizard's AI design assistant -->

${text}

<!-- Uizard tips:
     - Focus on wireframe and layout structure
     - Use Uizard's component library
     - Export to code when ready -->`,

      cursor: `// Cursor IDE prompt
// Use this with Cursor's AI coding assistant

${text}

// Cursor tips:
// - Use Ctrl+K for inline AI editing
// - Use Ctrl+L for AI chat
// - Reference existing code patterns`,

      lovable: `// Lovable.dev prompt
// Use this in Lovable's AI app builder

${text}

// Lovable tips:
// - Focus on React components
// - Use Tailwind CSS for styling
// - Leverage Lovable's component library`
    };

    return toolInstructions[tool as keyof typeof toolInstructions] || text;
  };

  const sections = parseResponse(response);
  const toolSpecificPrompt = formatForTool(response, toolType);

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'framer': return <Palette className="h-4 w-4" />;
      case 'flutterflow': return <Code className="h-4 w-4" />;
      case 'uizard': return <FileText className="h-4 w-4" />;
      case 'cursor': return <Code className="h-4 w-4" />;
      case 'lovable': return <Sparkles className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getToolColor = (tool: string) => {
    switch (tool) {
      case 'framer': return 'bg-purple-600/20 text-purple-400';
      case 'flutterflow': return 'bg-blue-600/20 text-blue-400';
      case 'uizard': return 'bg-orange-600/20 text-orange-400';
      case 'cursor': return 'bg-green-600/20 text-green-400';
      case 'lovable': return 'bg-pink-600/20 text-pink-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  return (
    <Card className={`bg-black/40 backdrop-blur-sm border-white/10 ${className}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
                <CardTitle className="text-white">{title}</CardTitle>
                {toolType !== 'general' && (
                  <Badge className={getToolColor(toolType)}>
                    {getToolIcon(toolType)}
                    <span className="ml-1 capitalize">{toolType}</span>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(response);
                  }}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadAsFile(response, `${title.replace(/\s+/g, '-').toLowerCase()}.txt`);
                  }}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-black/60 border border-white/20">
                <TabsTrigger value="formatted" className="data-[state=active]:bg-green-600">
                  Formatted
                </TabsTrigger>
                <TabsTrigger value="raw" className="data-[state=active]:bg-green-600">
                  Raw Text
                </TabsTrigger>
                {showToolSpecific && toolType !== 'general' && (
                  <TabsTrigger value="tool-specific" className="data-[state=active]:bg-green-600">
                    {toolType} Ready
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Formatted View */}
              <TabsContent value="formatted" className="mt-4">
                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <div key={index} className="space-y-2">
                      {section.title && (
                        <h4 className="font-semibold text-white border-b border-gray-700 pb-1">
                          {section.title}
                        </h4>
                      )}
                      
                      {section.type === 'code' ? (
                        <SyntaxHighlighter
                          language="javascript"
                          style={oneDark}
                          className="rounded-lg"
                          customStyle={{
                            background: 'rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          {section.content.trim()}
                        </SyntaxHighlighter>
                      ) : section.type === 'list' ? (
                        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                          <pre className="whitespace-pre-wrap text-gray-300 text-sm">
                            {section.content.trim()}
                          </pre>
                        </div>
                      ) : (
                        <div className="prose prose-invert max-w-none">
                          <p className="text-gray-300 leading-relaxed">
                            {section.content.trim()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Raw Text View */}
              <TabsContent value="raw" className="mt-4">
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                    {response}
                  </pre>
                </div>
                <div className="flex justify-end mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(response, "Raw text")}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Raw
                  </Button>
                </div>
              </TabsContent>

              {/* Tool-Specific View */}
              {showToolSpecific && toolType !== 'general' && (
                <TabsContent value="tool-specific" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      {getToolIcon(toolType)}
                      <span>Optimized for {toolType}</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300 p-0"
                        onClick={() => window.open(`https://${toolType}.com`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open {toolType}
                      </Button>
                    </div>
                    
                    <SyntaxHighlighter
                      language="javascript"
                      style={oneDark}
                      className="rounded-lg"
                      customStyle={{
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {toolSpecificPrompt}
                    </SyntaxHighlighter>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(toolSpecificPrompt, `${toolType} prompt`)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy for {toolType}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AIResponseFormatter;
