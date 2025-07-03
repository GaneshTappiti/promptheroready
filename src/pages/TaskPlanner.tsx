import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  PlusCircle,
  Filter,
  Search,
  Calendar,
  User,
  Flag,
  Clock,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Edit,
  Trash2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import { useToast } from "@/hooks/use-toast";
import { taskPlannerHelpers } from "@/lib/supabase-connection-helpers";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
  assignee?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const TaskPlanner = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [activeView, setActiveView] = useState("kanban");
  const { toast } = useToast();

  // Start with empty tasks - users will create their own tasks
  useEffect(() => {
    // Tasks will be loaded from user's database or created by the user
    setTasks([]);
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === "all" || task.assignee === filterAssignee;

    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === "todo"),
    "in-progress": filteredTasks.filter(task => task.status === "in-progress"),
    done: filteredTasks.filter(task => task.status === "done")
  };

  const handleCreateTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks([...tasks, newTask]);
    setIsNewTaskModalOpen(false);
    toast({
      title: "Task created",
      description: "Your task has been created successfully."
    });
  };

  const handleUpdateTask = (taskData: Task) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskData.id
        ? { ...taskData, updatedAt: new Date().toISOString() }
        : task
    );

    setTasks(updatedTasks);
    setIsEditTaskModalOpen(false);
    setSelectedTask(null);
    toast({
      title: "Task updated",
      description: "Your task has been updated successfully."
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast({
      title: "Task deleted",
      description: "The task has been deleted successfully."
    });
  };

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    );

    setTasks(updatedTasks);
    toast({
      title: "Task status updated",
      description: `Task moved to ${newStatus.replace("-", " ")}.`
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo": return <Circle className="h-4 w-4" />;
      case "in-progress": return <Clock className="h-4 w-4" />;
      case "done": return <CheckCircle2 className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  return (
    <div className="layout-container">
      <WorkspaceSidebar />
      <main className="layout-main p-4 md:p-6 md:ml-64 transition-all duration-300">
        <div className="w-full max-w-7xl mx-auto bg-black/80 rounded-2xl shadow-lg p-8 flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Link
                  to="/workspace"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Workspace</span>
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => setIsNewTaskModalOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Task Planner</h1>
              <p className="text-muted-foreground">
                Organize and track your startup tasks with our Kanban board
              </p>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/20 border-white/10"
                />
              </div>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full sm:w-[140px] bg-black/20 border-white/10">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                <SelectTrigger className="w-full sm:w-[140px] bg-black/20 border-white/10">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value="John Doe">John Doe</SelectItem>
                  <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                  <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                  <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <Tabs value={activeView} onValueChange={setActiveView} className="mb-6">
              <TabsList>
                <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Kanban Board */}
          <TabsContent value="kanban" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* To Do Column */}
              <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Circle className="h-4 w-4 text-gray-400" />
                    To Do ({tasksByStatus.todo.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {tasksByStatus.todo.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => {
                        setSelectedTask(task);
                        setIsEditTaskModalOpen(true);
                      }}
                      onDelete={() => handleDeleteTask(task.id)}
                      onStatusChange={handleStatusChange}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                  {tasksByStatus.todo.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No tasks to do</p>
                    </div>
                  )}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    In Progress ({tasksByStatus["in-progress"].length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {tasksByStatus["in-progress"].map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => {
                        setSelectedTask(task);
                        setIsEditTaskModalOpen(true);
                      }}
                      onDelete={() => handleDeleteTask(task.id)}
                      onStatusChange={handleStatusChange}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                  {tasksByStatus["in-progress"].length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No tasks in progress</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Done Column */}
              <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    Done ({tasksByStatus.done.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {tasksByStatus.done.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => {
                        setSelectedTask(task);
                        setIsEditTaskModalOpen(true);
                      }}
                      onDelete={() => handleDeleteTask(task.id)}
                      onStatusChange={handleStatusChange}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                  {tasksByStatus.done.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No completed tasks</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="mt-0">
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <Card key={task.id} className="bg-black/20 backdrop-blur-xl border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            {task.assignee && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {task.assignee}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleStatusChange(task.id, value as Task["status"])}
                        >
                          <SelectTrigger className="w-32 bg-black/20 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              setSelectedTask(task);
                              setIsEditTaskModalOpen(true);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-8">
                    <Flag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || filterPriority !== "all" || filterAssignee !== "all"
                        ? "Try adjusting your filters or search query"
                        : "Create your first task to get started"
                      }
                    </p>
                    <Button onClick={() => setIsNewTaskModalOpen(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </div>

        {/* New Task Modal */}
        <TaskModal
          isOpen={isNewTaskModalOpen}
          onClose={() => setIsNewTaskModalOpen(false)}
          onSave={handleCreateTask}
          title="Create New Task"
        />

        {/* Edit Task Modal */}
        <TaskModal
          isOpen={isEditTaskModalOpen}
          onClose={() => {
            setIsEditTaskModalOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleUpdateTask}
          task={selectedTask}
          title="Edit Task"
        />
      </main>
    </div>
  );
};

// TaskCard Component
interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
  getPriorityColor: (priority: string) => string;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange, getPriorityColor }) => {
  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-medium text-white text-sm line-clamp-2 flex-1 pr-2">
            {task.title}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-400">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <Badge className={getPriorityColor(task.priority)} variant="outline">
            {task.priority}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>

        {task.assignee && (
          <div className="flex items-center gap-2 mb-3">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{task.assignee}</span>
          </div>
        )}

        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs bg-white/10 text-white/70">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-1">
          <Button
            size="sm"
            variant={task.status === "todo" ? "default" : "outline"}
            onClick={() => onStatusChange(task.id, "todo")}
            className="flex-1 text-xs"
          >
            To Do
          </Button>
          <Button
            size="sm"
            variant={task.status === "in-progress" ? "default" : "outline"}
            onClick={() => onStatusChange(task.id, "in-progress")}
            className="flex-1 text-xs"
          >
            Progress
          </Button>
          <Button
            size="sm"
            variant={task.status === "done" ? "default" : "outline"}
            onClick={() => onStatusChange(task.id, "done")}
            className="flex-1 text-xs"
          >
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// TaskModal Component
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
  task?: Task | null;
  title: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, title }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo" as Task["status"],
    priority: "medium" as Task["priority"],
    dueDate: "",
    assignee: "",
    tags: [] as string[]
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignee: task.assignee || "",
        tags: task.tags
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
        assignee: "",
        tags: []
      });
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (task) {
      onSave({
        ...task,
        ...formData
      });
    } else {
      onSave(formData);
    }
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData({ ...formData, tags });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-black/20 border-white/10"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-black/20 border-white/10"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Task["status"] })}>
                <SelectTrigger className="bg-black/20 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as Task["priority"] })}>
                <SelectTrigger className="bg-black/20 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="bg-black/20 border-white/10"
            />
          </div>

          <div>
            <Label htmlFor="assignee">Assignee</Label>
            <Select value={formData.assignee} onValueChange={(value) => setFormData({ ...formData, assignee: value })}>
              <SelectTrigger className="bg-black/20 border-white/10">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                <SelectItem value="John Doe">John Doe</SelectItem>
                <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags.join(", ")}
              onChange={(e) => handleTagsChange(e.target.value)}
              className="bg-black/20 border-white/10"
              placeholder="frontend, design, urgent"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {task ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskPlanner;
