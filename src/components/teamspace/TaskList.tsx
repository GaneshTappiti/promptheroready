
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle2, Clock, Calendar, User, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  title: string;
  assignee: string;
  dueDate: string;
  status: string;
  priority: string;
}

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (taskId: number, status: string) => void;
  onAddTask?: (task: Omit<Task, 'id'>) => void;
}

interface NewTaskData {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

const TaskList = ({ tasks, onUpdateTask, onAddTask }: TaskListProps) => {
  const { toast } = useToast();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState<NewTaskData>({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium'
  });

  const handleAddTask = () => {
    if (!newTaskData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive"
      });
      return;
    }

    if (!newTaskData.assignee.trim()) {
      toast({
        title: "Error",
        description: "Please assign the task to someone",
        variant: "destructive"
      });
      return;
    }

    if (!newTaskData.dueDate) {
      toast({
        title: "Error",
        description: "Please set a due date",
        variant: "destructive"
      });
      return;
    }

    const newTask: Omit<Task, 'id'> = {
      title: newTaskData.title,
      assignee: newTaskData.assignee,
      dueDate: newTaskData.dueDate,
      status: 'in-progress',
      priority: newTaskData.priority
    };

    if (onAddTask) {
      onAddTask(newTask);
    }

    // Reset form
    setNewTaskData({
      title: '',
      description: '',
      assignee: '',
      dueDate: '',
      priority: 'medium'
    });

    setIsAddTaskOpen(false);

    toast({
      title: "Success!",
      description: "New task has been created",
    });
  };

  const resetForm = () => {
    setNewTaskData({
      title: '',
      description: '',
      assignee: '',
      dueDate: '',
      priority: 'medium'
    });
  };

  const toggleTaskStatus = (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "in-progress" : "completed";
    onUpdateTask(taskId, newStatus);
    
    toast({
      title: newStatus === "completed" ? "Task completed" : "Task reopened",
      description: `Task has been marked as ${newStatus}.`,
    });
  };

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <Card key={task.id} className="workspace-card transition-all hover:shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                className={`h-5 w-5 rounded-full flex items-center justify-center ${
                  task.status === "completed" ? "bg-green-500" : "border border-white/30"
                }`}
                onClick={() => toggleTaskStatus(task.id, task.status)}
                aria-label={task.status === "completed" ? "Mark as incomplete" : "Mark as complete"}
              >
                {task.status === "completed" && <CheckCircle2 className="h-4 w-4 text-white" />}
              </button>
              <div>
                <p className={task.status === "completed" ? "line-through text-muted-foreground" : ""}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>Assigned to: {task.assignee}</span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    task.priority === "high" ? "bg-red-500/20 text-red-400" : 
                    task.priority === "medium" ? "bg-yellow-500/20 text-yellow-400" : 
                    "bg-green-500/20 text-green-400"
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.dueDate}
              </span>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-center transition-all hover:bg-primary/10">
            <Plus className="h-4 w-4 mr-2" />
            Add New Task
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Task
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                placeholder="Enter task title..."
                value={newTaskData.title}
                onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Add task description (optional)..."
                value={newTaskData.description}
                onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="task-assignee">Assign To *</Label>
              <Input
                id="task-assignee"
                placeholder="Enter assignee name..."
                value={newTaskData.assignee}
                onChange={(e) => setNewTaskData({...newTaskData, assignee: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="task-due-date">Due Date *</Label>
              <Input
                id="task-due-date"
                type="date"
                value={newTaskData.dueDate}
                onChange={(e) => setNewTaskData({...newTaskData, dueDate: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="task-priority">Priority</Label>
              <Select value={newTaskData.priority} onValueChange={(value: any) => setNewTaskData({...newTaskData, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Low Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      Medium Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      High Priority
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddTaskOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddTask}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
