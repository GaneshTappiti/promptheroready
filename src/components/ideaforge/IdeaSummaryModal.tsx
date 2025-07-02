import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  BookOpen,
  Layers,
  GitBranch,
  MessageSquare,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IdeaSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaData: any;
}

const IdeaSummaryModal: React.FC<IdeaSummaryModalProps> = ({
  isOpen,
  onClose,
  ideaData
}) => {
  const { toast } = useToast();

  const handleCopyContent = () => {
    const content = generateTextSummary();
    navigator.clipboard.writeText(content);
    toast({
      title: "Content Copied",
      description: "The idea summary has been copied to your clipboard."
    });
  };

  const generateTextSummary = () => {
    let summary = `${ideaData.idea?.title || 'Untitled Idea'}\n`;
    summary += `${'='.repeat(ideaData.idea?.title?.length || 15)}\n\n`;
    summary += `Description: ${ideaData.idea?.description || 'No description'}\n`;
    summary += `Status: ${ideaData.idea?.status || 'Draft'}\n`;
    summary += `Tags: ${ideaData.idea?.tags?.join(', ') || 'None'}\n`;
    summary += `Created: ${new Date(ideaData.idea?.createdAt).toLocaleDateString()}\n\n`;

    if (ideaData.wiki?.sections) {
      summary += `WIKI KNOWLEDGE BASE\n`;
      summary += `${'='.repeat(20)}\n`;
      ideaData.wiki.sections.forEach((section: any) => {
        summary += `\n${section.title}\n`;
        summary += `${'-'.repeat(section.title.length)}\n`;
        summary += `${section.content}\n`;
      });
    }

    if (ideaData.blueprint) {
      summary += `\nPRODUCT BLUEPRINT\n`;
      summary += `${'='.repeat(17)}\n`;
      summary += `App Type: ${ideaData.blueprint.appType}\n\n`;
      
      if (ideaData.blueprint.features?.length) {
        summary += `Features:\n`;
        ideaData.blueprint.features.forEach((feature: any) => {
          summary += `- ${feature.name} (${feature.priority}): ${feature.description}\n`;
        });
      }
    }

    if (ideaData.feedback?.items?.length) {
      summary += `\nFEEDBACK & VALIDATION\n`;
      summary += `${'='.repeat(20)}\n`;
      ideaData.feedback.items.forEach((item: any) => {
        summary += `\n${item.title}\n`;
        summary += `Source: ${item.source} | Type: ${item.type}\n`;
        summary += `${item.content}\n`;
      });
    }

    return summary;
  };

  if (!ideaData?.idea) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Idea Summary: {ideaData.idea.title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {ideaData.idea.title}
                  <Badge variant="outline">{ideaData.idea.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{ideaData.idea.description}</p>
                <div className="flex flex-wrap gap-2">
                  {ideaData.idea.tags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Created: {new Date(ideaData.idea.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            {/* Wiki Summary */}
            {ideaData.wiki?.sections && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Wiki Knowledge Base
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ideaData.wiki.sections.slice(0, 3).map((section: any) => (
                      <div key={section.id} className="border-l-4 border-blue-200 pl-4">
                        <h4 className="font-semibold">{section.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {section.content.replace(/[#*]/g, '').substring(0, 200)}...
                        </p>
                      </div>
                    ))}
                    {ideaData.wiki.sections.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{ideaData.wiki.sections.length - 3} more sections...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blueprint Summary */}
            {ideaData.blueprint && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-green-600" />
                    Product Blueprint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4"><strong>App Type:</strong> {ideaData.blueprint.appType}</p>
                  {ideaData.blueprint.features?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Key Features:</h4>
                      <div className="space-y-2">
                        {ideaData.blueprint.features.slice(0, 5).map((feature: any) => (
                          <div key={feature.id} className="flex items-center gap-2">
                            <Badge 
                              variant={feature.priority === 'high' ? 'destructive' : 
                                     feature.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {feature.priority}
                            </Badge>
                            <span className="text-sm">{feature.name}</span>
                          </div>
                        ))}
                        {ideaData.blueprint.features.length > 5 && (
                          <p className="text-sm text-muted-foreground">
                            +{ideaData.blueprint.features.length - 5} more features...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Journey Summary */}
            {ideaData.journey?.entries?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-orange-600" />
                    Recent Journey Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ideaData.journey.entries.slice(0, 3).map((entry: any) => (
                      <div key={entry.id} className="border-l-4 border-orange-200 pl-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{entry.title}</h4>
                          <Badge variant="outline" className="text-xs">{entry.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {ideaData.journey.entries.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{ideaData.journey.entries.length - 3} more entries...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feedback Summary */}
            {ideaData.feedback?.items?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    Feedback Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ideaData.feedback.items.slice(0, 3).map((item: any) => (
                      <div key={item.id} className="border-l-4 border-purple-200 pl-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{item.title}</h4>
                          <Badge variant="outline" className="text-xs">{item.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          From: {item.author} ({item.source})
                        </p>
                      </div>
                    ))}
                    {ideaData.feedback.items.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{ideaData.feedback.items.length - 3} more feedback items...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCopyContent}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Summary
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IdeaSummaryModal;
