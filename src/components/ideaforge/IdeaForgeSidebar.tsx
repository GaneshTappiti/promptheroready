
import React from "react";
import { Button } from "@/components/ui/button";
import { IdeaDocument } from "@/types/ideaforge";
import { 
  Brain, 
  FileText, 
  Folder, 
  Star, 
  Tag, 
  Settings, 
  PlusCircle, 
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface IdeaForgeSidebarProps {
  ideas: IdeaDocument[];
  selectedIdeaId: string | null;
  onSelectIdea: (id: string) => void;
  onCreateIdea: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const IdeaForgeSidebar: React.FC<IdeaForgeSidebarProps> = ({
  ideas,
  selectedIdeaId,
  onSelectIdea,
  onCreateIdea,
  isOpen,
  onToggle
}) => {
  if (!isOpen) {
    return (
      <div className="border-r border-border">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle}
          className="my-4"
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Expand Sidebar</span>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="w-72 border-r border-border p-4 flex flex-col h-full animate-slide-in-right">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6" />
          <h2 className="font-bold text-xl">IdeaForge</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggle}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Collapse Sidebar</span>
        </Button>
      </div>
      
      <Button 
        onClick={onCreateIdea}
        className="w-full mb-6 gap-2"
      >
        <PlusCircle className="h-5 w-5" />
        New Idea
      </Button>
      
      <nav className="space-y-1 mb-6">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
        >
          <Brain className="h-5 w-5" />
          My Ideas
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
        >
          <Folder className="h-5 w-5" />
          Categories
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
        >
          <FileText className="h-5 w-5" />
          Drafts
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
        >
          <Star className="h-5 w-5" />
          Favorites
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
        >
          <Tag className="h-5 w-5" />
          Tags
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Button>
      </nav>
      
      <div className="flex flex-col gap-1 overflow-auto flex-1">
        <h3 className="font-medium text-sm text-muted-foreground px-2 py-1">
          Recent Ideas
        </h3>
        {ideas.map((idea) => (
          <Button
            key={idea.id}
            variant={selectedIdeaId === idea.id ? "secondary" : "ghost"}
            className="w-full justify-start text-left h-auto py-2"
            onClick={() => onSelectIdea(idea.id)}
          >
            <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{idea.title}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default IdeaForgeSidebar;
