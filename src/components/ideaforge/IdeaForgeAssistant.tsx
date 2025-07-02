
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
    
    // Simulate AI response after a delay
    setTimeout(() => {
      setResponse(`Here's what I found for "${prompt}":\n\n` +
        "Your idea for an AI-powered grocery management app has significant market potential. " +
        "Based on my analysis, here are some insights:\n\n" +
        "1. Target Market: Urban professionals and families with busy schedules\n" +
        "2. Competitor Analysis: Apps like Fridgely and NoWaste exist but lack AI capabilities\n" +
        "3. Key Differentiators: AI food recognition, expiry predictions, and recipe suggestions\n" +
        "4. Recommended Tech Stack: React Native + Firebase for MVP, with TensorFlow Lite for AI features\n" +
        "5. Monetization Strategy: Freemium model with subscription for premium features\n\n" +
        "Would you like me to expand on any of these points or generate a more detailed blueprint section?"
      );
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
            <div className="bg-card p-3 rounded-lg mb-4">
              <pre className="whitespace-pre-wrap text-sm font-sans">{response}</pre>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Regenerate
                </Button>
                <Button size="sm" variant="outline" className="gap-1">
                  <Download className="h-3 w-3" />
                  Save
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
