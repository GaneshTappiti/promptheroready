import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Copy,
  Download,
  Clock,
  Brain,
  Rocket
} from "lucide-react";
import { usePromptHistory } from "@/stores/ideaStore";
import { useToast } from "@/hooks/use-toast";

interface PromptHistoryProps {
  section?: 'ideaforge' | 'mvpStudio';
  className?: string;
}

const PromptHistory: React.FC<PromptHistoryProps> = ({ section, className }) => {
  const { promptHistory, exportPrompts } = usePromptHistory();
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
  };

  const exportAllPrompts = () => {
    const exported = exportPrompts();
    const blob = new Blob([exported], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompthero-prompts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported!",
      description: "Prompt history exported successfully.",
    });
  };

  const getPrompts = () => {
    if (section) {
      return Object.entries(promptHistory[section]).filter(([, prompt]) => prompt);
    }
    
    // Return all prompts from both sections
    const allPrompts = [
      ...Object.entries(promptHistory.ideaforge).map(([key, prompt]) => ({ 
        section: 'ideaforge', 
        key, 
        prompt 
      })),
      ...Object.entries(promptHistory.mvpStudio).map(([key, prompt]) => ({ 
        section: 'mvpStudio', 
        key, 
        prompt 
      }))
    ].filter(item => item.prompt);
    
    return allPrompts.sort((a, b) => 
      new Date(b.prompt!.timestamp).getTime() - new Date(a.prompt!.timestamp).getTime()
    );
  };

  const prompts = getPrompts();

  const getSectionIcon = (sectionName: string) => {
    if (sectionName === 'ideaforge' || sectionName.includes('ideaforge')) {
      return <Brain className="h-4 w-4 text-blue-400" />;
    }
    return <Rocket className="h-4 w-4 text-green-400" />;
  };

  const getSectionColor = (sectionName: string) => {
    if (sectionName === 'ideaforge' || sectionName.includes('ideaforge')) {
      return "bg-blue-600/20 text-blue-400";
    }
    return "bg-green-600/20 text-green-400";
  };

  return (
    <Card className={`bg-black/40 backdrop-blur-sm border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            Prompt History
          </CardTitle>
          {prompts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportAllPrompts}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {prompts.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No prompts generated yet</p>
            <p className="text-gray-500 text-sm">
              Generate AI responses to see them here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {prompts.map((item, index) => {
                const prompt = section ? item[1] : item.prompt;
                const sectionName = section ? section : item.section;
                const key = section ? item[0] : item.key;
                
                if (!prompt) return null;
                
                return (
                  <Card key={index} className="bg-gray-900/50 border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getSectionIcon(sectionName)}
                          <Badge className={getSectionColor(sectionName)}>
                            {sectionName === 'ideaforge' ? 'IdeaForge' : 'MVP Studio'}
                          </Badge>
                          <span className="text-sm text-gray-400 capitalize">
                            {key.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(prompt.response)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-1">Prompt:</h4>
                          <p className="text-xs text-gray-400 bg-gray-800/50 p-2 rounded">
                            {prompt.prompt.length > 100 
                              ? prompt.prompt.substring(0, 100) + '...' 
                              : prompt.prompt
                            }
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-1">Response:</h4>
                          <div className="text-xs text-gray-300 bg-gray-800/50 p-2 rounded max-h-32 overflow-y-auto">
                            <pre className="whitespace-pre-wrap">
                              {prompt.response.length > 300 
                                ? prompt.response.substring(0, 300) + '...' 
                                : prompt.response
                              }
                            </pre>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
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
                            Copy Full Response
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default PromptHistory;
