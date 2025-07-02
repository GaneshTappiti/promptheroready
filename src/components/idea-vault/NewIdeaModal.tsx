
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IdeaProps } from "@/pages/IdeaVault";

interface NewIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<IdeaProps>) => void;
}

const NewIdeaModal = ({ isOpen, onClose, onSubmit }: NewIdeaModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"validated" | "exploring">("exploring");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    tags?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {title?: string; tags?: string} = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!tags.trim()) {
      newErrors.tags = "At least one tag is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    const tagsArray = tags.split(",").map(tag => tag.trim()).filter(Boolean);
    
    const newIdea: Partial<IdeaProps> = {
      title,
      description,
      tags: tagsArray,
      status,
      votes: 0,
      comments: 0,
    };
    
    // Simulate API delay
    setTimeout(() => {
      onSubmit(newIdea);
      resetForm();
      setIsSubmitting(false);
    }, 500);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTags("");
    setStatus("exploring");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Idea</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a catchy title..."
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your idea in detail..."
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">
              Tags <span className="text-destructive">*</span>{" "}
              <span className="text-xs text-muted-foreground">(comma-separated)</span>
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Health, Mobile App, AI..."
              className={errors.tags ? "border-destructive" : ""}
            />
            {errors.tags && (
              <p className="text-sm text-destructive">{errors.tags}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Initial Status</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={status === "exploring" ? "default" : "outline"}
                className={status === "exploring" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/50" : ""}
                onClick={() => setStatus("exploring")}
              >
                Exploring
              </Button>
              <Button
                type="button"
                variant={status === "validated" ? "default" : "outline"}
                className={status === "validated" ? "bg-green-500/20 text-green-300 border-green-500/50" : ""}
                onClick={() => setStatus("validated")}
              >
                Validated
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Idea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewIdeaModal;
