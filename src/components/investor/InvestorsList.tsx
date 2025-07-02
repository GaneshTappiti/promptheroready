
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Investor } from "@/types/investor";
import InvestorCard from "./InvestorCard";
import EmptyState from "./EmptyState";

interface InvestorsListProps {
  investors: Investor[];
  onLogContact: (id: number, contactDetails: any) => void;
  onStatusChange: (id: number, status: string) => void;
  onAddInvestor: () => void;
}

const InvestorsList: React.FC<InvestorsListProps> = ({
  investors,
  onLogContact,
  onStatusChange,
  onAddInvestor
}) => {
  if (investors.length === 0) {
    return <EmptyState type="investors" onAction={onAddInvestor} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {investors.map(investor => (
        <InvestorCard 
          key={investor.id} 
          investor={investor}
          onLogContact={onLogContact}
          onStatusChange={onStatusChange}
        />
      ))}
      
      <Card className="workspace-card border-dashed border-2 flex flex-col items-center justify-center cursor-pointer h-full transition-all duration-200 hover:shadow-md hover:border-primary/50">
        <CardContent className="flex flex-col items-center justify-center p-6 h-full" onClick={onAddInvestor}>
          <div className="rounded-full bg-primary/20 p-3 mb-4 transition-transform hover:scale-110">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <p className="font-medium">Add New Investor</p>
          <p className="text-sm text-muted-foreground">Track a potential funding source</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorsList;
