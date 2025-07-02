import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  Download,
  Clock,
  Brain,
  Rocket,
  Layers,
  Palette,
  Map,
  Target,
  ExternalLink
} from "lucide-react";
import { useIdeaStore, PromptData } from "@/stores/ideaStore";
import { useToast } from "@/hooks/use-toast";

interface IdeaPromptHistoryProps {
  ideaId: string;
  ideaTitle: string;
  className?: string;
}

const IdeaPromptHistory: React.FC<IdeaPromptHistoryProps> = ({ 
  ideaId, 
  ideaTitle, 
  className 
}) => {
  const getPromptsByIdea = useIdeaStore((state) => state.getPromptsByIdea);
  const exportIdeaPrompts = useIdeaStore((state) => state.exportIdeaPrompts);
  const { toast } = useToast();

  const prompts = getPromptsByIdea(ideaId);
  const ideaforgePrompts = prompts.filter(p => 
    p.section.includes('target-user') || 
    p.section.includes('features') || 
    p.section.includes('structure') || 
    p.section.includes('ui-design') || 
    p.section.includes('pages')
  );
  const mvpStudioPrompts = prompts.filter(p => p.ideaId === ideaId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
  };

  const exportAllPrompts = () => {
    const exported = exportIdeaPrompts(ideaId);
    const blob = new Blob([exported], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ideaTitle.replace(/\s+/g, '-').toLowerCase()}-prompts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported!",
      description: "All prompts for this idea exported successfully.",
    });
  };

  const getSectionIcon = (section: string) => {
    if (section.includes('target-user')) return <Target className="h-4 w-4 text-blue-400" />;
    if (section.includes('features')) return <Layers className="h-4 w-4 text-purple-400" />;
    if (section.includes('structure')) return <Map className="h-4 w-4 text-orange-400" />;
    if (section.includes('ui-design')) return <Palette className="h-4 w-4 text-pink-400" />;
    if (section.includes('pages')) return <Map className="h-4 w-4 text-cyan-400" />;
    return <Rocket className="h-4 w-4 text-green-400" />;
  };

  const getSectionColor = (section: string) => {
    if (section.includes('target-user')) return "bg-blue-600/20 text-blue-400";
    if (section.includes('features')) return "bg-purple-600/20 text-purple-400";
    if (section.includes('structure')) return "bg-orange-600/20 text-orange-400";
    if (section.includes('ui-design')) return "bg-pink-600/20 text-pink-400";
    if (section.includes('pages')) return "bg-cyan-600/20 text-cyan-400";
    return "bg-green-600/20 text-green-400";
  };

  const formatSectionName = (section: string) => {
    return section
      .replace(`${ideaId}-`, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className={`bg-black/40 backdrop-blur-sm border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            {ideaTitle} - Prompt History
          </CardTitle>
          {prompts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportAllPrompts}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>Total: {prompts.length} prompts</span>
          <span>IdeaForge: {ideaforgePrompts.length}</span>
          <span>MVP Studio: {mvpStudioPrompts.length}</span>
        </div>
      </CardHeader>
      <CardContent>
        {prompts.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No prompts generated yet</p>
            <p className="text-gray-500 text-sm">
              Complete IdeaForge sections and generate MVP prompts to see them here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-6">
              {/* IdeaForge Section */}
              {ideaforgePrompts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-5 w-5 text-blue-400" />
                    <h4 className="font-semibold text-white">IdeaForge Research</h4>
                    <Badge className="bg-blue-600/20 text-blue-400">
                      {ideaforgePrompts.length} prompts
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {ideaforgePrompts.map((prompt, index) => (
                      <Card key={index} className="bg-gray-900/50 border-gray-700">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getSectionIcon(prompt.section)}
                              <Badge className={getSectionColor(prompt.section)}>
                                {formatSectionName(prompt.section)}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(prompt.response)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-xs text-gray-300 bg-gray-800/50 p-2 rounded max-h-24 overflow-y-auto">
                            <pre className="whitespace-pre-wrap">
                              {prompt.response.length > 200 
                                ? prompt.response.substring(0, 200) + '...' 
                                : prompt.response
                              }
                            </pre>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                            <span>
                              {new Date(prompt.timestamp).toLocaleDateString()} at{' '}
                              {new Date(prompt.timestamp).toLocaleTimeString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(prompt.response)}
                              className="h-6 text-xs text-gray-400 hover:text-white"
                            >
                              Copy Full
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Separator */}
              {ideaforgePrompts.length > 0 && mvpStudioPrompts.length > 0 && (
                <Separator className="bg-gray-700" />
              )}

              {/* MVP Studio Section */}
              {mvpStudioPrompts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Rocket className="h-5 w-5 text-green-400" />
                    <h4 className="font-semibold text-white">MVP Studio Prompts</h4>
                    <Badge className="bg-green-600/20 text-green-400">
                      {mvpStudioPrompts.length} prompts
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {mvpStudioPrompts.map((prompt, index) => (
                      <Card key={index} className="bg-gray-900/50 border-gray-700">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Rocket className="h-4 w-4 text-green-400" />
                              <Badge className="bg-green-600/20 text-green-400">
                                {prompt.pageType || formatSectionName(prompt.section)}
                              </Badge>
                              {prompt.appType && (
                                <Badge variant="outline" className="border-gray-600 text-gray-300">
                                  {prompt.appType}
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(prompt.response)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {prompt.tools && prompt.tools.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {prompt.tools.map((tool, toolIndex) => (
                                <Badge key={toolIndex} variant="outline" className="text-xs border-gray-600 text-gray-400">
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="text-xs text-gray-300 bg-gray-800/50 p-2 rounded max-h-24 overflow-y-auto">
                            <pre className="whitespace-pre-wrap">
                              {prompt.response.length > 200 
                                ? prompt.response.substring(0, 200) + '...' 
                                : prompt.response
                              }
                            </pre>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                            <span>
                              {new Date(prompt.timestamp).toLocaleDateString()} at{' '}
                              {new Date(prompt.timestamp).toLocaleTimeString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(prompt.response)}
                              className="h-6 text-xs text-gray-400 hover:text-white"
                            >
                              Copy Full
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default IdeaPromptHistory;
