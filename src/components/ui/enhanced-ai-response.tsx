import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Code, 
  Palette, 
  Smartphone, 
  Monitor,
  Zap,
  Download,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { useToast } from '@/hooks/use-toast';

interface ToolSpecificSection {
  id: string;
  title: string;
  content: string;
  type: 'prompt' | 'code' | 'instructions' | 'config';
  toolType?: 'framer' | 'flutterflow' | 'uizard' | 'cursor' | 'lovable';
  priority?: 'high' | 'medium' | 'low';
}

interface EnhancedAIResponseProps {
  content: string;
  className?: string;
  showCopyButton?: boolean;
  variant?: 'default' | 'compact' | 'chat' | 'tool-specific' | 'structured';
  title?: string;
  toolType?: 'framer' | 'flutterflow' | 'uizard' | 'cursor' | 'lovable' | 'general';
  showToolButtons?: boolean;
  metadata?: {
    appType?: string;
    uiStyle?: string;
    complexity?: 'simple' | 'medium' | 'complex';
    estimatedTime?: string;
    sections?: ToolSpecificSection[];
  };
  onSectionCopy?: (sectionId: string, content: string, toolType?: string) => void;
}

const EnhancedAIResponse: React.FC<EnhancedAIResponseProps> = ({
  content,
  className,
  showCopyButton = true,
  variant = 'default',
  title,
  toolType = 'general',
  showToolButtons = false,
  metadata,
  onSectionCopy
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleCopy = async (text: string, label: string = 'Content') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleSectionCopy = async (section: ToolSpecificSection) => {
    await handleCopy(section.content, section.title);
    setCopiedSection(section.id);
    setTimeout(() => setCopiedSection(null), 2000);
    
    if (onSectionCopy) {
      onSectionCopy(section.id, section.content, section.toolType);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'framer':
        return <Monitor className="h-4 w-4" />;
      case 'flutterflow':
        return <Smartphone className="h-4 w-4" />;
      case 'uizard':
        return <Palette className="h-4 w-4" />;
      case 'cursor':
        return <Code className="h-4 w-4" />;
      case 'lovable':
        return <Zap className="h-4 w-4" />;
      default:
        return <Code className="h-4 w-4" />;
    }
  };

  const getToolColor = (tool: string) => {
    switch (tool) {
      case 'framer':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'flutterflow':
        return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'uizard':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'cursor':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'lovable':
        return 'bg-pink-600/20 text-pink-400 border-pink-600/30';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const renderStructuredContent = () => {
    if (!metadata?.sections) {
      return renderDefaultContent();
    }

    return (
      <div className="space-y-4">
        {metadata.sections.map((section) => (
          <Card key={section.id} className="bg-gray-900/30 border-gray-700">
            <Collapsible
              open={expandedSections.has(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                        {section.toolType && getToolIcon(section.toolType)}
                      </div>
                      <div>
                        <CardTitle className="text-white text-sm">{section.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getToolColor(section.toolType || 'general'))}
                          >
                            {section.type}
                          </Badge>
                          {section.toolType && (
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getToolColor(section.toolType))}
                            >
                              {section.toolType}
                            </Badge>
                          )}
                          {section.priority && (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                section.priority === 'high' ? 'bg-red-600/20 text-red-400' :
                                section.priority === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                                'bg-gray-600/20 text-gray-400'
                              )}
                            >
                              {section.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSectionCopy(section);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedSection === section.id ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
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
                      {section.content}
                    </SyntaxHighlighter>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {section.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  
                  {showToolButtons && section.toolType && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSectionCopy(section)}
                        className="text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy for {section.toolType}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://${section.toolType}.com`, '_blank')}
                        className="text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open {section.toolType}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    );
  };

  const renderDefaultContent = () => {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:rounded-r prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-table:border prose-th:border prose-td:border prose-th:bg-muted prose-th:p-3 prose-td:p-3 prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';

              if (!inline && language) {
                return (
                  <div className="my-4 rounded-lg border overflow-hidden">
                    <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {language}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(String(children), `${language} code`)}
                        className="h-6 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <SyntaxHighlighter
                      style={oneDark}
                      language={language}
                      PreTag="div"
                      className="!m-0 !bg-transparent"
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: 'transparent',
                        fontSize: '0.875rem'
                      }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                );
              }

              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={cn("relative group bg-card border rounded-lg p-4", className)}>
      {/* Header */}
      {(title || metadata) && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <div className="flex items-center gap-3">
            {toolType !== 'general' && getToolIcon(toolType)}
            <div>
              {title && <h4 className="font-semibold text-foreground">{title}</h4>}
              {metadata && (
                <div className="flex items-center gap-2 mt-1">
                  {metadata.appType && (
                    <Badge variant="outline" className="text-xs">
                      {metadata.appType}
                    </Badge>
                  )}
                  {metadata.uiStyle && (
                    <Badge variant="outline" className="text-xs">
                      {metadata.uiStyle}
                    </Badge>
                  )}
                  {metadata.complexity && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        metadata.complexity === 'complex' ? 'bg-red-600/20 text-red-400' :
                        metadata.complexity === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-green-600/20 text-green-400'
                      )}
                    >
                      {metadata.complexity}
                    </Badge>
                  )}
                  {metadata.estimatedTime && (
                    <Badge variant="outline" className="text-xs">
                      ⏱️ {metadata.estimatedTime}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {showCopyButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(content, title || 'AI Response')}
              className="h-8"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy All
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Content */}
      {variant === 'structured' && metadata?.sections ? 
        renderStructuredContent() : 
        renderDefaultContent()
      }

      {/* Tool-specific actions */}
      {showToolButtons && toolType !== 'general' && (
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(content, `${toolType} prompt`)}
            className={cn("text-xs", getToolColor(toolType))}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy for {toolType}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://${toolType}.com`, '_blank')}
            className="text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open {toolType}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EnhancedAIResponse;
