import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Video, Upload, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RealTimeChat from "./RealTimeChat";
import SupabaseTestPanel from "../debug/SupabaseTestPanel";

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
    <Tabs defaultValue="chat" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="chat">
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat
        </TabsTrigger>
        <TabsTrigger value="features">
          <Video className="h-4 w-4 mr-2" />
          Features
        </TabsTrigger>
        <TabsTrigger value="debug">
          <Settings className="h-4 w-4 mr-2" />
          Debug
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="space-y-6">
        <RealTimeChat teamId={teamId} />
      </TabsContent>

      <TabsContent value="features" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="workspace-card hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Video className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Start Video Call</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Launch a video meeting with your team members
              </p>
              <Button
                variant="outline"
                className="w-full hover:bg-primary/10"
                onClick={handleStartMeeting}
              >
                Start Meeting
              </Button>
            </CardContent>
          </Card>

          <Card className="workspace-card hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Share Files</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Upload and share documents with your team
              </p>
              <Button
                variant="outline"
                className="w-full hover:bg-primary/10"
                onClick={handleShareFiles}
              >
                Upload Files
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="debug" className="space-y-6">
        <SupabaseTestPanel />
      </TabsContent>
    </Tabs>
  );
};

export default MessagesPanel;
