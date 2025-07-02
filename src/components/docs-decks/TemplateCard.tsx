
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface TemplateCardProps {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: LucideIcon;
}

const TemplateCard = ({ name, description, icon: Icon }: TemplateCardProps) => {
  return (
    <Card className="workspace-card hover:shadow-lg cursor-pointer transition-all duration-200">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button size="sm">Use</Button>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
