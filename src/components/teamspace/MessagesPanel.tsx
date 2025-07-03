import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RealTimeChat from "./RealTimeChat";

interface MessagesPanelProps {
  teamId: string;
}

const MessagesPanel = ({ teamId }: MessagesPanelProps) => {
  const { toast } = useToast();
  
  const handleStartMeeting = () => {
    toast({
      title: "Starting meeting",
      description: "Setting up your video call...",
    });
  };

  const handleShareFiles = () => {
    toast({
      title: "File sharing",
      description: "Opening file upload dialog...",
    });
  };



  return (
    <div className="space-y-6">
      {/* Real-time Chat - Main Feature */}
      <RealTimeChat teamId={teamId} />

      {/* Additional Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="workspace-card hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Video className="h-5 w-5 text-green-400" />
              <h3 className="font-medium text-white">Video Meetings</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Launch video meetings directly from chat (Coming Soon)
            </p>
            <Button
              variant="outline"
              className="w-full bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30"
              onClick={handleStartMeeting}
            >
              <Video className="h-4 w-4 mr-2" />
              Start Meeting
            </Button>
          </CardContent>
        </Card>

        <Card className="workspace-card hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Upload className="h-5 w-5 text-blue-400" />
              <h3 className="font-medium text-white">File Sharing</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Share documents and files with your team (Coming Soon)
            </p>
            <Button
              variant="outline"
              className="w-full bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30"
              onClick={handleShareFiles}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </CardContent>
        </Card>
      </div>


    </div>
  );
};

export default MessagesPanel;
