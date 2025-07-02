
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WikiPageInput } from "@/types/wiki";

interface NewWikiPageModalProps {
  onCreatePage: (page: WikiPageInput) => void;
}

const NewWikiPageModal: React.FC<NewWikiPageModalProps> = ({ onCreatePage }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [errors, setErrors] = useState<{title?: string}>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }
    
    onCreatePage({
      title,
      description,
      tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag),
    });
    
    // Reset form
    setTitle("");
    setDescription("");
    setTags("");
    setErrors({});
  };

  return (
    <DialogContent className="sm:max-w-[550px]">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Create a New Wiki Page</DialogTitle>
          <DialogDescription>
            Start documenting your startup knowledge and ideas
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              Page Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Customer Acquisition Strategy"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this wiki page"
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags (optional, comma separated)
            </label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="E.g., marketing, strategy, acquisition"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="submit" className="w-full sm:w-auto">
            Create Page
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default NewWikiPageModal;
