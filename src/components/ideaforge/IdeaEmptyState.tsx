
import React from "react";
import { Button } from "@/components/ui/button";
import { Brain, PlusCircle } from "lucide-react";

interface IdeaEmptyStateProps {
  onCreateClick: () => void;
}

const IdeaEmptyState: React.FC<IdeaEmptyStateProps> = ({ onCreateClick }) => {
  return (
    <div className="workspace-card p-8 text-center flex flex-col items-center animate-fade-in">
      <div className="rounded-full bg-primary/10 p-6 mb-4">
        <Brain className="h-10 w-10 text-primary" />
      </div>
      
      <h2 className="text-2xl font-semibold mb-2">Your IdeaForge is empty</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Start documenting your startup ideas with a powerful combination of 
        wiki-style documentation and blueprint execution tools.
      </p>
      
      <Button 
        size="lg" 
        className="gap-2 animate-pulse"
        onClick={onCreateClick}
      >
        <PlusCircle className="h-5 w-5" />
        Create Your First Idea
      </Button>
    </div>
  );
};

export default IdeaEmptyState;
