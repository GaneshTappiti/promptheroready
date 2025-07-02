
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Edit, Clock } from "lucide-react";
import { WikiPage } from "@/types/wiki";
import { formatDistanceToNow } from "date-fns";

interface WikiPageCardProps {
  page: WikiPage;
}

const WikiPageCard: React.FC<WikiPageCardProps> = ({ page }) => {
  // Format date to "time ago" format
  const timeAgo = formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true });
  
  return (
    <Card className="hover:shadow-md transition-all animate-fade-in hover:-translate-y-1">
      <CardHeader className="relative pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium line-clamp-2">{page.title}</h3>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${page.favorited ? 'text-yellow-400' : ''}`}
          >
            <Star className={`h-4 w-4 ${page.favorited ? 'fill-yellow-400' : ''}`} />
            <span className="sr-only">
              {page.favorited ? 'Remove from favorites' : 'Add to favorites'}
            </span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {page.description || "No description"}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {page.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {page.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{page.tags.length - 3} more
            </Badge>
          )}
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>Updated {timeAgo}</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button variant="default" className="w-full">View Page</Button>
      </CardFooter>
    </Card>
  );
};

export default WikiPageCard;
