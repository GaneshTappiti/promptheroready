
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileText, FileSpreadsheet, FilePieChart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface DocumentCardProps {
  id: number;
  name: string;
  description: string;
  type: string;
  lastEdited: string;
  pages: string | number;
  onClick: () => void;
}

const DocumentCard = ({ id, name, description, type, lastEdited, pages, onClick }: DocumentCardProps) => {
  const { toast } = useToast();
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://app.example.com/share/doc/${id}`);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    });
  };
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Downloading",
      description: "Your document is being prepared for download",
    });
    // Mock download functionality
  };
  
  const getIcon = () => {
    if (type === "Document" || type === "One-pager") return <FileText className="h-5 w-5 text-primary" />;
    if (type === "Research") return <FilePieChart className="h-5 w-5 text-blue-400" />;
    if (type === "Spreadsheet") return <FileSpreadsheet className="h-5 w-5 text-yellow-400" />;
    return <FileText className="h-5 w-5" />;
  };
  
  return (
    <Card className="workspace-card hover:shadow-lg cursor-pointer transition-all duration-200" onClick={onClick}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">{lastEdited}</div>
            <div className="text-xs text-muted-foreground">{pages} {type !== "Spreadsheet" ? "pages" : ""}</div>
          </div>
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
                  <p>Download document</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
