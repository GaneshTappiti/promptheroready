
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, AlertCircle, Video, Clock, Users, Sparkles, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  attendees: string[];
  duration: string;
}

interface MeetingsListProps {
  meetings: Meeting[];
}

const MeetingsList = ({ meetings }: MeetingsListProps) => {
  const { toast } = useToast();

  const handleComingSoonFeature = (featureName: string) => {
    toast({
      title: "🚀 Coming Soon!",
      description: `${featureName} feature is under development and will be available soon.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Coming Soon Hero Section */}
      <Card className="workspace-card text-center">
        <CardContent className="p-8 md:p-12">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full">
                <Video className="h-8 w-8 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Video Meetings</h2>
                <Badge className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 border border-green-500/30">
                  Coming Soon
                </Badge>
              </div>
              <p className="text-gray-400 max-w-md mx-auto">
                High-quality video conferencing with screen sharing, recording, and AI-powered meeting summaries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Video className="h-6 w-6 text-green-400 mb-2 mx-auto" />
                <h3 className="font-medium text-white text-sm">HD Video Calls</h3>
                <p className="text-xs text-gray-400 mt-1">Crystal clear video quality</p>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Users className="h-6 w-6 text-blue-400 mb-2 mx-auto" />
                <h3 className="font-medium text-white text-sm">Team Collaboration</h3>
                <p className="text-xs text-gray-400 mt-1">Up to 50 participants</p>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Sparkles className="h-6 w-6 text-purple-400 mb-2 mx-auto" />
                <h3 className="font-medium text-white text-sm">AI Summaries</h3>
                <p className="text-xs text-gray-400 mt-1">Auto-generated notes</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border-green-500/30 text-green-400 hover:bg-gradient-to-r hover:from-green-600/30 hover:to-blue-600/30"
              onClick={() => handleComingSoonFeature("Video Meetings")}
            >
              <Zap className="h-4 w-4 mr-2" />
              Get Notified When Ready
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5 text-green-400" />
              Smart Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-400">
              AI-powered meeting scheduler that finds the best time for all team members.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Timezone detection</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span>Availability sync</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles className="h-3 w-3" />
                <span>Smart suggestions</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-green-400 hover:bg-green-500/10"
              onClick={() => handleComingSoonFeature("Smart Scheduling")}
            >
              Learn More
            </Button>
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Video className="h-5 w-5 text-blue-400" />
              Meeting Rooms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-400">
              Persistent virtual rooms for your team with custom backgrounds and layouts.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Video className="h-3 w-3" />
                <span>Screen sharing</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span>Breakout rooms</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles className="h-3 w-3" />
                <span>Recording & transcripts</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-blue-400 hover:bg-blue-500/10"
              onClick={() => handleComingSoonFeature("Meeting Rooms")}
            >
              Learn More
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MeetingsList;
