
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, FileText, Presentation } from "lucide-react";

const PitchDeckView: React.FC = () => {
  return (
    <Card className="workspace-card p-6 animate-fade-in">
      <div className="text-center py-16">
        <div className="rounded-full bg-primary/20 p-4 mx-auto mb-6 w-16 h-16 flex items-center justify-center animate-float">
          <ArrowUpRight className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-medium mb-4">Create Your Pitch Deck</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Generate a professional investor presentation based on your startup data
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button variant="outline" className="transition-all hover:bg-accent hover:text-accent-foreground">
            <FileText className="h-4 w-4 mr-2" />
            Import Template
          </Button>
          <Button className="transition-all hover:scale-105">
            <Presentation className="h-4 w-4 mr-2" />
            Create New Deck
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PitchDeckView;
