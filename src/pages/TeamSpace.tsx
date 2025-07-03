import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  ChevronLeft,
  Menu,
  X,
  Video,
  Phone,
  MessageSquare,
  Calendar,
  BarChart3,
  Settings,
  Monitor,
  Mic,
  MicOff,
  VideoOff,
  Volume2,
  VolumeX,
  ScreenShare,
  MoreHorizontal,
  Clock,
  Target,
  TrendingUp,
  Award,
  Zap,
  Brain,
  FileText,
  CheckCircle2,
  AlertCircle,
  Star,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import TeamMemberCard from "@/components/teamspace/TeamMemberCard";
import AddTeamMemberModal from "@/components/teamspace/AddTeamMemberModal";
import TeamRoles from "@/components/teamspace/TeamRoles";
import TaskList from "@/components/teamspace/TaskList";
import MessagesPanel from "@/components/teamspace/MessagesPanel";
import MeetingsList from "@/components/teamspace/MeetingsList";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  status: string;
}

interface Task {
  id: number;
  title: string;
  assignee: string;
  dueDate: string;
  status: string;
  priority: string;
}

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  attendees: string[];
  duration: string;
}

const TeamSpace = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("team");
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use a default team ID for now - you can replace this with actual team ID from your data
  const [teamId, setTeamId] = useState<string | null>(null);
  
  // Create or get team for the user
  useEffect(() => {
    const setupTeam = async () => {
      if (!user) return;

      try {
        // First, try to get the user's team
        const { data: existingTeam, error: fetchError } = await supabase
          .from('teams')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching team:', fetchError);
          return;
        }

        if (existingTeam) {
          setTeamId(existingTeam.id);
          return;
        }

        // If no team exists, create one
        const { data: newTeam, error: createError } = await supabase
          .from('teams')
          .insert([
            {
              name: `${user.email?.split('@')[0] || 'My'}'s Team`,
              description: 'Default team',
              owner_id: user.id
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating team:', createError);
          return;
        }

        setTeamId(newTeam.id);
      } catch (error) {
        console.error('Error in team setup:', error);
      }
    };

    setupTeam();
  }, [user]);

  // Start with empty team members - will be loaded from database
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // Start with empty tasks - will be loaded from database
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Meetings will be loaded from database when feature is implemented
  const meetings: any[] = [];

  // Add animation class when tab changes
  useEffect(() => {
    const tabContents = document.querySelectorAll('[role="tabpanel"]');
    tabContents.forEach(content => {
      content.classList.add('animate-fade-in');
    });
  }, [activeTab]);

  const handleAddMember = (newMember: TeamMember) => {
    setTeamMembers([...teamMembers, newMember]);
    
    toast({
      title: "🎉 Team member added",
      description: `${newMember.name} has been added to your team.`
    });
  };

  const handleUpdateTaskStatus = (taskId: number, newStatus: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      ...newTaskData
    };

    setTasks([...tasks, newTask]);

    toast({
      title: "✅ Task Created",
      description: `New task "${newTask.title}" has been assigned to ${newTask.assignee}.`
    });
  };

  // Video call and analytics functionality will be implemented in future updates

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 flex">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 transition-all duration-300">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarToggle onClick={() => setSidebarOpen(true)} />
                <Link
                  to="/workspace"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Workspace</span>
                </Link>
              </div>
              <Button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8 text-green-400" />
                  <h1 className="text-3xl md:text-4xl font-bold text-white">TeamSpace</h1>
                </div>
                <p className="text-gray-400 text-lg">
                  Collaborate and manage your team effectively
                </p>
              </div>

              {/* Team Stats */}
              <div className="flex gap-4">
                <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{teamMembers.length}</div>
                    <div className="text-xs text-gray-400">Team Members</div>
                  </div>
                </div>
                <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{tasks.filter(t => t.status === 'completed').length}</div>
                    <div className="text-xs text-gray-400">Tasks Done</div>
                  </div>
                </div>
                <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">Active</div>
                    <div className="text-xs text-gray-400">Chat Status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Container */}
          <Tabs
            defaultValue="team" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
              <div className="border-b mb-4 md:mb-6">
                <TabsList className="bg-transparent h-12 p-0 -mb-px overflow-x-auto flex-nowrap">
                <TabsTrigger 
                  value="team" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 md:px-6 h-12 whitespace-nowrap"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Team
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 md:px-6 h-12 whitespace-nowrap"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger
                  value="messages"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 md:px-6 h-12 whitespace-nowrap"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="meetings"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 md:px-6 h-12 whitespace-nowrap"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Meetings
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="team" className="animate-fade-in mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {teamMembers.map(member => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
                <div 
                  className="border border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer h-full min-h-[200px] hover:bg-accent/50 transition-colors"
                  onClick={() => setIsAddMemberModalOpen(true)}
                >
                    <div className="flex flex-col items-center justify-center p-4 md:p-6 h-full">
                    <div className="rounded-full bg-primary/10 p-3 mb-4">
                      <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-medium">Add Team Member</p>
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Invite someone to join your startup team
                    </p>
                  </div>
                </div>
              </div>
              <TeamRoles />
            </TabsContent>
            <TabsContent value="tasks" className="animate-fade-in mt-0">
              <TaskList tasks={tasks} onUpdateTask={handleUpdateTaskStatus} onAddTask={handleAddTask} />
            </TabsContent>
            <TabsContent value="messages" className="animate-fade-in mt-0">
              {teamId ? (
                <MessagesPanel teamId={teamId} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading team chat...</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="meetings" className="animate-fade-in mt-0">
              <MeetingsList meetings={meetings} />
            </TabsContent>
          </Tabs>
        </div>
        <AddTeamMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          onAddMember={handleAddMember}
        />




      </main>
    </div>
  );
};

export default TeamSpace;
