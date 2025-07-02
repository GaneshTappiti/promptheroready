
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface PitchDeckProps {
  id: number;
  name: string;
  description: string;
  lastEdited: string;
  slides: number;
  template: string;
  onClick: () => void;
}

const PitchDeckCard = ({ id, name, description, lastEdited, slides, template, onClick }: PitchDeckProps) => {
  const { toast } = useToast();
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Copy a mock share link to clipboard
    navigator.clipboard.writeText(`https://app.example.com/share/deck/${id}`);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    });
  };
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Downloading",
      description: "Your deck is being prepared for download",
    });
    // Mock download functionality - in a real app, this would trigger an actual download
  };
  
  return (
    <Card 
      className="workspace-card hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.01]"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="truncate" title={name}>{name}</CardTitle>
          <div className="flex">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy share link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download presentation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm text-muted-foreground mt-4">
          <span>Last edited: {lastEdited}</span>
          <div className="flex items-center gap-3">
            <span>{slides} slides</span>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
              {template}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PitchDeckCard;
