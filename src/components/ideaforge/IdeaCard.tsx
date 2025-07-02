
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IdeaDocument } from "@/types/ideaforge";
import { formatDistanceToNow } from "date-fns";

interface IdeaCardProps {
  idea: IdeaDocument;
  onClick: () => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onClick }) => {
  const updatedAt = new Date(idea.updatedAt);
  const timeAgo = formatDistanceToNow(updatedAt, { addSuffix: true });
  
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50"
      onClick={onClick}
    >
      {idea.coverImage && (
        <div 
          className="h-32 w-full bg-cover bg-center rounded-t-lg" 
          style={{ backgroundImage: `url(${idea.coverImage})` }}
        />
      )}
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{idea.title}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{idea.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {idea.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {idea.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{idea.tags.length - 3} more
            </Badge>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          Updated {timeAgo}
        </div>
      </CardContent>
    </Card>
  );
};

export default IdeaCard;
