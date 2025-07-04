
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Investor } from "@/types/investor";
import LogContactModal from "./LogContactModal";
import InvestorProfile from "./InvestorProfile";

interface InvestorCardProps {
  investor: Investor;
  onLogContact: (id: number, contactDetails: unknown) => void;
  onStatusChange: (id: number, status: string) => void;
}

const InvestorCard: React.FC<InvestorCardProps> = ({ 
  investor, 
  onLogContact, 
  onStatusChange 
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogContactOpen, setIsLogContactOpen] = useState(false);
  
  const getStatusClass = (status: string) => {
    switch(status) {
      case 'interested':
        return 'bg-green-500/20 text-green-300';
      case 'follow-up':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'to-contact':
        return 'bg-blue-500/20 text-blue-300';
      case 'rejected':
        return 'bg-red-500/20 text-red-300';
      case 'committed':
        return 'bg-purple-500/20 text-purple-300';
      default:
        return 'bg-blue-500/20 text-blue-300';
    }
  };

  return (
    <>
      <Card className="workspace-card hover:shadow-lg transition-all duration-200 hover:border-primary/40">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{investor.name}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span 
                    className={`px-2 py-1 rounded text-xs uppercase cursor-pointer ${getStatusClass(investor.status)}`}
                    onClick={() => {
                      // In a real app, this would open a dropdown to change status
                      const newStatus = investor.status === 'interested' ? 'follow-up' : 'interested';
                      onStatusChange(investor.id, newStatus);
                    }}
                  >
                    {investor.status}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to change status</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Focus</p>
              <p className="font-medium">{investor.focus}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Portfolio</p>
              <p className="font-medium">{investor.portfolio} companies</p>
            </div>
            <div>
              <p className="text-muted-foreground">Stage</p>
              <p className="font-medium">{investor.stage}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Meeting</p>
              <p className="font-medium">{investor.lastMeeting}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsLogContactOpen(true)}
              className="transition-all hover:bg-accent hover:text-accent-foreground"
            >
              Log Contact
            </Button>
            <Button 
              size="sm" 
              onClick={() => setIsProfileOpen(true)}
              className="transition-all hover:scale-105"
            >
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Investor profile dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Investor Profile</DialogTitle>
            <DialogDescription>
              Detailed information about {investor.name}
            </DialogDescription>
          </DialogHeader>
          <InvestorProfile investor={investor} />
        </DialogContent>
      </Dialog>

      {/* Log contact modal */}
      <LogContactModal 
        open={isLogContactOpen}
        onClose={() => setIsLogContactOpen(false)}
        onSubmit={(contactDetails) => {
          onLogContact(investor.id, contactDetails);
          setIsLogContactOpen(false);
        }}
        investor={investor}
      />
    </>
  );
};

export default InvestorCard;
