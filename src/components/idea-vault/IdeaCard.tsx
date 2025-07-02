
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, MessageSquare, Tag } from "lucide-react";
import { IdeaProps } from "@/pages/IdeaVault";

interface IdeaCardProps {
  idea: IdeaProps;
  onClick: () => void;
  onVoteClick: (e: React.MouseEvent) => void;
}

const IdeaCard = ({ idea, onClick, onVoteClick }: IdeaCardProps) => {
  return (
    <Card 
      key={idea.id} 
      className="workspace-card hover:shadow-lg cursor-pointer transition-all"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle>{idea.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{idea.description}</p>
        <div className="flex flex-wrap gap-2">
          {idea.tags.map((tag, index) => (
            <div 
              key={index} 
              className="bg-white/10 px-2 py-1 rounded-full text-xs flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                // Tag filtering functionality would go here
              }}
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-4 text-muted-foreground text-sm">
          <div 
            className="flex items-center gap-1 hover:text-primary transition-colors"
            onClick={onVoteClick}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{idea.votes}</span>
          </div>
          <div 
            className="flex items-center gap-1 hover:text-primary transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Comment functionality would go here
            }}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{idea.comments}</span>
          </div>
          <div>
            <span className={`px-2 py-1 rounded-full text-xs uppercase ${
              idea.status === 'validated' 
                ? 'bg-green-500/20 text-green-300' 
                : idea.status === 'exploring'
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : 'bg-gray-500/20 text-gray-300'
            }`}>
              {idea.status}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IdeaCard;
