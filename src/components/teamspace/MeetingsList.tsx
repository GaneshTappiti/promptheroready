
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Plus, AlertCircle } from "lucide-react";
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
  
  const handleScheduleMeeting = () => {
    toast({
      title: "Schedule Meeting",
      description: "Calendar interface opening...",
    });
  };
  
  const handleJoinMeeting = (meetingTitle: string) => {
    toast({
      title: "Joining Meeting",
      description: `Connecting to "${meetingTitle}" meeting...`,
    });
  };
  
  const handleRescheduleMeeting = (meetingTitle: string) => {
    toast({
      title: "Reschedule Meeting",
      description: `Opening scheduler for "${meetingTitle}"...`,
    });
  };
  
  const handleSendReminder = () => {
    toast({
      title: "Reminders Sent",
      description: "Meeting reminders have been sent to all attendees.",
    });
  };

  return (
    <div className="space-y-4">
      {meetings.map(meeting => (
        <Card key={meeting.id} className="workspace-card hover:shadow-md transition-all animate-fade-in">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{meeting.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{meeting.date}, {meeting.time}</span>
                  <span className="text-muted-foreground">({meeting.duration})</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {meeting.attendees.map((attendee, index) => (
                    <span key={index} className="bg-white/10 px-2 py-1 rounded-full text-xs hover:bg-white/20 transition-colors">
                      {attendee}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hover:bg-primary/10"
                  onClick={() => handleRescheduleMeeting(meeting.title)}
                >
                  Reschedule
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleJoinMeeting(meeting.title)}
                >
                  Join
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Button 
        variant="outline" 
        className="w-full justify-center hover:bg-primary/10"
        onClick={handleScheduleMeeting}
      >
        <Plus className="h-4 w-4 mr-2" />
        Schedule New Meeting
      </Button>
      
      <Card className="workspace-card mt-8 hover:shadow-md transition-all">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-yellow-500/20 p-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-medium">Upcoming Important Meeting</h3>
              <p className="text-sm text-muted-foreground">Investor Pitch Rehearsal - Thursday, 10:00 AM</p>
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded-lg mb-4 hover:bg-white/10 transition-colors">
            <h4 className="text-sm font-medium mb-2">Meeting Agenda:</h4>
            <ol className="list-decimal pl-5 text-sm space-y-1 text-muted-foreground">
              <li>Introduction and company overview (5 min)</li>
              <li>Product demo (10 min)</li>
              <li>Market analysis and opportunity (5 min)</li>
              <li>Business model and traction (5 min)</li>
              <li>Financial projections (5 min)</li>
              <li>Team introduction (5 min)</li>
              <li>Funding ask and use of funds (5 min)</li>
              <li>Q&A practice (15 min)</li>
            </ol>
          </div>
          <div className="flex justify-between">
            <Button 
              variant="outline"
              className="hover:bg-primary/10"
              onClick={handleSendReminder}
            >
              Send Reminder
            </Button>
            <Button onClick={() => handleJoinMeeting("Investor Pitch Rehearsal")}>Join Meeting</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingsList;
