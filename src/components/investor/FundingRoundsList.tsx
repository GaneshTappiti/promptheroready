
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Clock as ClockIcon } from "lucide-react";
import { FundingRound, FundingRoundInput } from "@/types/investor";
import EmptyState from "./EmptyState";
import AddFundingRoundModal from "./AddFundingRoundModal";

interface FundingRoundsListProps {
  fundingRounds: FundingRound[];
  onAddFundingRound: (round: FundingRoundInput) => void;
}

const FundingRoundsList: React.FC<FundingRoundsListProps> = ({
  fundingRounds,
  onAddFundingRound
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  if (fundingRounds.length === 0) {
    return <EmptyState type="funding" onAction={() => setIsAddModalOpen(true)} />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        {fundingRounds.map(round => (
          <Card key={round.id} className="workspace-card hover:shadow-lg transition-all duration-200 hover:border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{round.name}</span>
                <span className={`px-2 py-1 rounded text-xs uppercase ${
                  round.status === 'active' ? 'bg-green-500/20 text-green-300' : 
                  round.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-purple-500/20 text-purple-300'
                }`}>
                  {round.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/5 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span>Progress</span>
                  <span>{round.raised} / {round.target}</span>
                </div>
                <div className="h-2 bg-white/10 rounded overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-in-out" 
                    style={{ width: `${round.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Investors</p>
                    <p className="font-medium">{round.investors}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-medium">{round.timeline || "3 months"}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  size="sm"
                  className="transition-all hover:scale-105"
                >
                  Manage Round
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Card 
          className="workspace-card border-dashed border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50"
          onClick={() => setIsAddModalOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-primary/20 p-3 mb-4 transition-transform hover:scale-110">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">Create New Funding Round</p>
            <p className="text-sm text-muted-foreground">Plan your next fundraising effort</p>
          </CardContent>
        </Card>
      </div>

      <AddFundingRoundModal 
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => {
          onAddFundingRound(data);
          setIsAddModalOpen(false);
        }}
      />
    </>
  );
};

export default FundingRoundsList;
