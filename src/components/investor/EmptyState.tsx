
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Plus } from "lucide-react";

interface EmptyStateProps {
  type: "investors" | "funding";
  onAction: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  return (
    <Card className="workspace-card p-6 animate-fade-in">
      <CardContent className="text-center py-16">
        <div className="rounded-full bg-primary/20 p-4 mx-auto mb-6 w-16 h-16 flex items-center justify-center animate-float">
          {type === "investors" ? (
            <Users className="h-8 w-8 text-primary" />
          ) : (
            <Briefcase className="h-8 w-8 text-primary" />
          )}
        </div>
        <h3 className="text-2xl font-medium mb-4">
          {type === "investors" ? "No Investors Yet" : "No Funding Rounds Yet"}
        </h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {type === "investors"
            ? "Start tracking potential investors for your startup. Add investors to keep track of your fundraising progress."
            : "Plan and track your fundraising rounds to organize your fundraising efforts."}
        </p>
        <Button onClick={onAction} className="transition-all hover:scale-105">
          <Plus className="h-4 w-4 mr-2" />
          {type === "investors" ? "Add Your First Investor" : "Create Your First Funding Round"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
