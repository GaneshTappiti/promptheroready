
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Presentation, Plus } from "lucide-react";

interface EmptyStateProps {
  type: "decks" | "documents";
  onCreateNew: () => void;
}

const EmptyState = ({ type, onCreateNew }: EmptyStateProps) => {
  return (
    <Card className="workspace-card p-6 text-center">
      <CardContent className="py-16">
        <div className="rounded-full bg-primary/20 p-4 mx-auto mb-6 w-16 h-16 flex items-center justify-center animate-float">
          {type === "decks" ? (
            <Presentation className="h-8 w-8 text-primary" />
          ) : (
            <FileText className="h-8 w-8 text-primary" />
          )}
        </div>
        <h3 className="text-2xl font-medium mb-4">
          {type === "decks" ? "No Pitch Decks Yet" : "No Documents Yet"}
        </h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {type === "decks"
            ? "Create your first pitch deck to impress investors, partners or customers."
            : "Create your first document to organize your startup's plans and research."}
        </p>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          {type === "decks" ? "Create Your First Deck" : "Create Your First Document"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
