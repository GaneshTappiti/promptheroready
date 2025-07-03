import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Flag, Calendar, ChevronLeft } from "lucide-react";
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import AddPhaseModal from "@/components/blueprint/AddPhaseModal";
import TaskModal from "@/components/blueprint/TaskModal";
import PhaseCard, { Phase, Task } from "@/components/blueprint/PhaseCard";
import { blueprintZoneHelpers } from "@/lib/supabase-connection-helpers";
import { useAuth } from "@/contexts/AuthContext";

const BlueprintZone = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("roadmap");
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isAddPhaseModalOpen, setIsAddPhaseModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskModalMode, setTaskModalMode] = useState<"add" | "edit">("add");
  // Removed unused loading state

  // Load phases from database
  const loadPhases = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await blueprintZoneHelpers.getProjectPhases(user.id);

      if (error) throw error;

      setPhases(data || []);
    } catch (error) {
      console.error('Error loading phases:', error);
      toast({
        title: "Error Loading Phases",
        description: "Failed to load your project phases. Please try again.",
        variant: "destructive"
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPhases();
    }
  }, [user, loadPhases]);
  
  // Calculate progress for each phase
  useEffect(() => {
    const updatedPhases = phases.map(phase => {
      if (phase.tasks.length === 0) return { ...phase, progress: 0 };
      
      const completedTasks = phase.tasks.filter(task => task.status === 'completed').length;
      const progress = Math.round((completedTasks / phase.tasks.length) * 100);
      
      return { ...phase, progress };
    });
    
    setPhases(updatedPhases);
  }, [phases]);
  
  const handleAddPhase = (phaseData: { title: string; description: string; duration: string }) => {
    const newPhase: Phase = {
      id: phaseData.title.toLowerCase().replace(/\s+/g, '-'),
      title: phaseData.title,
      description: phaseData.description,
      tasks: [],
      duration: phaseData.duration,
      progress: 0
    };
    
    setPhases([...phases, newPhase]);
    toast({
      title: "Phase added",
      description: `${phaseData.title} phase has been added to your roadmap`,
    });
  };
  
  const handleAddTask = (phaseId: string) => {
    setSelectedPhaseId(phaseId);
    setSelectedTask(null);
    setTaskModalMode("add");
    setIsTaskModalOpen(true);
  };
  
  const handleEditTask = (phaseId: string, task: Task) => {
    setSelectedPhaseId(phaseId);
    setSelectedTask(task);
    setTaskModalMode("edit");
    setIsTaskModalOpen(true);
  };
  
  const handleSaveTask = (taskData: { id?: number; title: string; status: "completed" | "in-progress" | "pending" }) => {
    if (!selectedPhaseId) return;
    
    const updatedPhases = phases.map(phase => {
      if (phase.id !== selectedPhaseId) return phase;
      
      if (taskModalMode === "add") {
        // Add new task
        const newTaskId = Math.max(0, ...phase.tasks.map(t => t.id)) + 1;
        const newTask = { id: newTaskId, title: taskData.title, status: taskData.status };
        return { ...phase, tasks: [...phase.tasks, newTask] };
      } else {
        // Edit existing task
        return {
          ...phase,
          tasks: phase.tasks.map(t => (t.id === taskData.id ? { ...t, title: taskData.title, status: taskData.status } : t))
        };
      }
    });
    
    setPhases(updatedPhases);
  };
  
  const handleToggleTaskStatus = (phaseId: string, taskId: number) => {
    const updatedPhases = phases.map(phase => {
      if (phase.id !== phaseId) return phase;
      
      return {
        ...phase,
        tasks: phase.tasks.map(task => {
          if (task.id !== taskId) return task;
          
          // Cycle through statuses: pending -> in-progress -> completed -> pending
          let newStatus: "completed" | "in-progress" | "pending";
          if (task.status === "pending") newStatus = "in-progress";
          else if (task.status === "in-progress") newStatus = "completed";
          else newStatus = "pending";
          
          return { ...task, status: newStatus };
        })
      };
    });
    
    setPhases(updatedPhases);
    
    // Show toast when task is completed
    const phase = updatedPhases.find(p => p.id === phaseId);
    const task = phase?.tasks.find(t => t.id === taskId);
    
    if (task?.status === "completed") {
      toast({
        title: "Task completed",
        description: `"${task.title}" has been marked as complete`,
      });
    }
  };
  
  const milestones = [
    { id: 1, title: "MVP Completion", date: "July 30, 2025", status: "pending" },
    { id: 2, title: "Beta Launch", date: "August 15, 2025", status: "pending" },
    { id: 3, title: "First 100 Users", date: "September 1, 2025", status: "pending" },
    { id: 4, title: "Product Market Fit", date: "October 15, 2025", status: "pending" }
  ];

  return (
    <div className="layout-container">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="layout-main p-6 transition-all duration-300">
        {/* Top navigation with hamburger menu */}
        <div className="flex items-center gap-4 mb-6">
          <SidebarToggle onClick={() => setSidebarOpen(true)} />
          <Link
            to="/workspace"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Workspace</span>
          </Link>
          <div className="flex-1">
            {/* Page-specific navigation can go here */}
          </div>
        </div>
        <div className="container mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Blueprint Zone</h1>
            <p className="text-muted-foreground">
              Create detailed roadmaps and strategic plans for your startup
            </p>
          </header>
        
        <div className="flex justify-between items-center mb-6">
          <Button className="ml-auto">
            Share Blueprint
          </Button>
        </div>
        
        <Tabs defaultValue="roadmap" className="mb-8">
          <TabsList>
            <TabsTrigger 
              value="roadmap" 
              onClick={() => setActiveTab("roadmap")}
              className={activeTab === "roadmap" ? "tab-active" : ""}
            >
              Roadmap
            </TabsTrigger>
            <TabsTrigger 
              value="milestones" 
              onClick={() => setActiveTab("milestones")}
              className={activeTab === "milestones" ? "tab-active" : ""}
            >
              Milestones
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              onClick={() => setActiveTab("timeline")}
              className={activeTab === "timeline" ? "tab-active" : ""}
            >
              Timeline
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roadmap" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Product Roadmap</h2>
              <Button size="sm" onClick={() => setIsAddPhaseModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Phase
              </Button>
            </div>
            
            <div className="space-y-6">
              {phases.map((phase, index) => (
                <PhaseCard 
                  key={phase.id} 
                  phase={phase} 
                  index={index} 
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onToggleTaskStatus={handleToggleTaskStatus}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="milestones" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Key Milestones</h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Milestone
              </Button>
            </div>
            
            <div className="grid gap-4">
              {milestones.map(milestone => (
                <Card key={milestone.id} className="workspace-card">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Flag className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.date}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Mark Complete</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Timeline View</h2>
              <Button size="sm">
                <Calendar className="h-4 w-4 mr-1" />
                Change View
              </Button>
            </div>
            
            <Card className="workspace-card p-6">
              <div className="text-center py-16">
                <h3 className="text-xl font-medium mb-4">Timeline Visualization</h3>
                <p className="text-muted-foreground mb-6">Interactive timeline view coming soon</p>
                <Button>Generate Timeline</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modals */}
      <AddPhaseModal 
        isOpen={isAddPhaseModalOpen} 
        onClose={() => setIsAddPhaseModalOpen(false)}
        onAddPhase={handleAddPhase}
      />
      
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaveTask={handleSaveTask}
        task={selectedTask || undefined}
        mode={taskModalMode}
      />
      </main>
    </div>
  );
};

export default BlueprintZone;
