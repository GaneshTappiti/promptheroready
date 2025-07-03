
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MessageSquare, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  status: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
}

const TeamMemberCard = ({ member }: TeamMemberCardProps) => {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const { toast } = useToast();

  const handleMessage = () => {
    toast({
      title: "Message initiated",
      description: `Opening chat with ${member.name}...`,
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'online': return 'Online now';
      case 'away': return 'Away';
      default: return 'Offline';
    }
  };

  return (
    <>
      <Card className="workspace-card hover:shadow-lg transition-all group">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center relative">
                <span className="font-medium">{member.avatar}</span>
                <div 
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${getStatusColor(member.status)} ring-2 ring-background`}
                  title={getStatusText(member.status)}
                ></div>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">{member.name}</h3>
                <p className="text-sm text-gray-400">{member.role}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">{member.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">{member.phone}</span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsProfileOpen(true)} 
              className="flex-1 group-hover:border-primary/50 group-hover:text-primary transition-colors"
            >
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMessage}
              className="flex-1 group-hover:border-primary/50 group-hover:text-primary transition-colors"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Team Member Profile</DialogTitle>
            <DialogDescription>
              View detailed information about {member.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-xl relative">
                {member.avatar}
                <div 
                  className={`absolute bottom-0 right-0 h-4 w-4 rounded-full ${getStatusColor(member.status)} ring-2 ring-background`}
                  title={getStatusText(member.status)}
                ></div>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-muted-foreground">{member.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">CONTACT INFORMATION</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{member.phone}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">SKILLS</h4>
                <div className="flex flex-wrap gap-1">
                  {["Product Strategy", "UX Design", "Marketing", "Leadership"].map((skill) => (
                    <span key={skill} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">WORK HISTORY</h4>
                <div className="space-y-2 text-sm p-2 bg-muted/50 rounded-md">
                  <p>Previously at: Google, Amazon</p>
                  <p>Education: Stanford University</p>
                  <p>Years of experience: 8+</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">CURRENT TASKS</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded-md flex items-center justify-between">
                    <span>Update pitch deck</span>
                    <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full text-xs">In Progress</span>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-md flex items-center justify-between">
                    <span>Investor outreach</span>
                    <span className="bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full text-xs">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setIsProfileOpen(false)}>Close</Button>
            <Button onClick={handleMessage}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TeamMemberCard;
