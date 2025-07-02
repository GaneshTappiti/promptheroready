
import React from "react";
import { Investor } from "@/types/investor";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Briefcase, Calendar, Clock as ClockIcon } from "lucide-react";

interface InvestorProfileProps {
  investor: Investor;
}

const InvestorProfile: React.FC<InvestorProfileProps> = ({ investor }) => {
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{investor.name}</h2>
          <p className="text-muted-foreground">{investor.focus}</p>
        </div>
        <div className={`px-3 py-1 rounded text-xs uppercase 
          ${investor.status === 'interested' ? 'bg-green-500/20 text-green-300' : 
           investor.status === 'follow-up' ? 'bg-yellow-500/20 text-yellow-300' :
           'bg-blue-500/20 text-blue-300'}
        `}>
          {investor.status}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex flex-col">
          <span className="text-muted-foreground">Portfolio Size</span>
          <span className="font-medium">{investor.portfolio} companies</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">Investment Stage</span>
          <span className="font-medium">{investor.stage}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">Last Contact</span>
          <span className="font-medium">{investor.lastMeeting}</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Notes</h3>
        <p className="text-muted-foreground">{investor.notes || "No notes available."}</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium">Contact History</h3>
        {investor.contacts && investor.contacts.length > 0 ? (
          <div className="space-y-3">
            {investor.contacts.map(contact => (
              <Card key={contact.id} className="p-3">
                <CardContent className="p-0">
                  <div className="flex justify-between">
                    <div className="font-medium">{contact.type}</div>
                    <div className="text-sm text-muted-foreground">{contact.date}</div>
                  </div>
                  <p className="mt-2 text-sm">{contact.notes}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">No contact history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorProfile;
