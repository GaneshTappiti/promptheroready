
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: {
    id?: number;
    title: string;
    status: "completed" | "in-progress" | "pending";
  }) => void;
  task?: {
    id?: number;
    title: string;
    status: "completed" | "in-progress" | "pending";
  };
  mode: "add" | "edit";
}

const TaskModal = ({ isOpen, onClose, onSaveTask, task, mode }: TaskModalProps) => {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"completed" | "in-progress" | "pending">("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load task data if editing
  useEffect(() => {
    if (mode === "edit" && task) {
      setTitle(task.title);
      setStatus(task.status);
    } else {
      setTitle("");
      setStatus("pending");
    }
  }, [task, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    onSaveTask({
      id: task?.id,
      title,
      status
    });
    
    setIsSubmitting(false);
    onClose();
    
    toast({
      title: "Success",
      description: mode === "add" ? "New task added" : "Task updated",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Task" : "Edit Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Conduct competitive analysis"
                autoFocus 
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Status</Label>
              <RadioGroup value={status} onValueChange={(value) => setStatus(value as "completed" | "in-progress" | "pending")}>
                <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed" className="flex items-center cursor-pointer">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Completed</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
                  <RadioGroupItem value="in-progress" id="in-progress" />
                  <Label htmlFor="in-progress" className="flex items-center cursor-pointer">
                    <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                    <span>In Progress</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
                  <RadioGroupItem value="pending" id="pending" />
                  <Label htmlFor="pending" className="flex items-center cursor-pointer">
                    <AlertCircle className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Pending</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {mode === "add" ? "Add Task" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
