
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, CheckCircle, Clock } from "lucide-react";

export interface Task {
  id: number;
  title: string;
  status: "completed" | "in-progress" | "pending";
}

export interface Phase {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  duration: string;
  progress: number;
}

interface PhaseCardProps {
  phase: Phase;
  index: number;
  onAddTask: (phaseId: string) => void;
  onEditTask: (phaseId: string, task: Task) => void;
  onToggleTaskStatus: (phaseId: string, taskId: number) => void;
}

const PhaseCard: React.FC<PhaseCardProps> = ({ 
  phase, 
  index,
  onAddTask,
  onEditTask,
  onToggleTaskStatus
}) => {
  return (
    <Card className="workspace-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">
            Phase {index + 1}: {phase.title}
          </CardTitle>
          <p className="text-muted-foreground">{phase.description}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{phase.duration}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Progress: {phase.progress}%
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={phase.progress} className="mb-4 h-2" />
        <div className="space-y-3">
          {phase.tasks.map(task => (
            <div key={task.id} className="flex justify-between items-center p-3 bg-white/5 rounded-md">
              <div className="flex items-center gap-2">
                <button 
                  className={`rounded-full w-5 h-5 flex items-center justify-center transition-colors ${
                    task.status === 'completed' ? 'bg-green-500' : 
                    task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-white/10'
                  }`}
                  onClick={() => onToggleTaskStatus(phase.id, task.id)}
                >
                  {task.status === 'completed' && <CheckCircle className="h-4 w-4 text-white" />}
                </button>
                <span>{task.title}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onEditTask(phase.id, task)}>Edit</Button>
            </div>
          ))}
          <Button 
            variant="ghost" 
            className="w-full justify-center"
            onClick={() => onAddTask(phase.id)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhaseCard;
