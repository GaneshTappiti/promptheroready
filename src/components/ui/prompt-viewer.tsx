import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Copy, Check, ExternalLink, ChevronDown, ChevronRight, Sparkles, Palette, Monitor, Smartphone } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import AIResponse from './ai-response';

interface PromptSection {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: string;
  type?: 'prompt' | 'instruction' | 'component' | 'style';
  toolSpecific?: {
    framer?: string;
    flutterflow?: string;
    uizard?: string;
    figma?: string;
  };
}

interface PromptViewerProps {
  title: string;
  description?: string;
  appType?: 'web' | 'mobile' | 'saas' | 'desktop';
  uiStyle?: string;
  sections: PromptSection[];
  className?: string;
  showToolButtons?: boolean;
}

const PromptViewer: React.FC<PromptViewerProps> = ({
  title,
  description,
  appType,
  uiStyle,
  sections,
  className,
  showToolButtons = true
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['0'])); // First section expanded by default

  const handleCopySection = async (sectionId: string, content: string, tool?: string) => {
    try {
      let textToCopy = content;
      
      // If tool-specific content exists, use it
      const section = sections.find(s => s.id === sectionId);
      if (tool && section?.toolSpecific?.[tool as keyof typeof section.toolSpecific]) {
        textToCopy = section.toolSpecific[tool as keyof typeof section.toolSpecific] || content;
      }
      
      await navigator.clipboard.writeText(textToCopy);
      setCopiedSection(`${sectionId}-${tool || 'default'}`);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleCopyAll = async () => {
    try {
      const allContent = sections.map(section => 
        `## ${section.title}\n\n${section.content}`
      ).join('\n\n---\n\n');
      
      const fullPrompt = `# ${title}\n\n${description ? `${description}\n\n` : ''}${allContent}`;
      
      await navigator.clipboard.writeText(fullPrompt);
      setCopiedSection('all');
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getAppTypeIcon = () => {
    switch (appType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'web': return <Monitor className="h-4 w-4" />;
      case 'saas': return <Sparkles className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getSectionIcon = (type?: string) => {
    switch (type) {
      case 'style': return <Palette className="h-4 w-4" />;
      case 'component': return <Monitor className="h-4 w-4" />;
      case 'instruction': return <Sparkles className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getAppTypeIcon()}
                <CardTitle className="text-xl">{title}</CardTitle>
              </div>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
              <div className="flex items-center gap-2">
                {appType && (
                  <Badge variant="secondary" className="capitalize">
                    {appType} App
                  </Badge>
                )}
                {uiStyle && (
                  <Badge variant="outline">
                    <Palette className="h-3 w-3 mr-1" />
                    {uiStyle}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleCopyAll}
              className="shrink-0"
            >
              {copiedSection === 'all' ? (
                <>
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <Collapsible
              open={expandedSections.has(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        {section.icon || getSectionIcon(section.type)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{section.title}</CardTitle>
                        {section.type && (
                          <Badge variant="outline" className="mt-1 text-xs capitalize">
                            {section.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <AIResponse 
                    content={section.content}
                    variant="compact"
                    showCopyButton={false}
                    className="mb-4 bg-muted/30"
                  />
                  
                  {/* Copy buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopySection(section.id, section.content)}
                    >
                      {copiedSection === `${section.id}-default` ? (
                        <>
                          <Check className="h-3 w-3 text-green-500 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                    
                    {showToolButtons && section.toolSpecific && (
                      <>
                        {section.toolSpecific.framer && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopySection(section.id, section.content, 'framer')}
                            className="text-xs"
                          >
                            {copiedSection === `${section.id}-framer` ? (
                              <>
                                <Check className="h-3 w-3 text-green-500 mr-1" />
                                Copied for Framer!
                              </>
                            ) : (
                              <>
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Copy for Framer
                              </>
                            )}
                          </Button>
                        )}
                        
                        {section.toolSpecific.flutterflow && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopySection(section.id, section.content, 'flutterflow')}
                            className="text-xs"
                          >
                            {copiedSection === `${section.id}-flutterflow` ? (
                              <>
                                <Check className="h-3 w-3 text-green-500 mr-1" />
                                Copied for FlutterFlow!
                              </>
                            ) : (
                              <>
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Copy for FlutterFlow
                              </>
                            )}
                          </Button>
                        )}
                        
                        {section.toolSpecific.uizard && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopySection(section.id, section.content, 'uizard')}
                            className="text-xs"
                          >
                            {copiedSection === `${section.id}-uizard` ? (
                              <>
                                <Check className="h-3 w-3 text-green-500 mr-1" />
                                Copied for Uizard!
                              </>
                            ) : (
                              <>
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Copy for Uizard
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PromptViewer;
