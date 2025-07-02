
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText, Presentation, FilePieChart } from "lucide-react";

type DocumentType = "deck" | "document" | "template";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string; type: DocumentType }) => void;
}

const DocumentModal = ({ isOpen, onClose, onSave }: DocumentModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [docType, setDocType] = useState<DocumentType>("deck");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your document",
        variant: "destructive",
      });
      return;
    }
    
    onSave({ title, description, type: docType });
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex gap-4 justify-between">
              <Button
                type="button"
                variant={docType === "deck" ? "default" : "outline"}
                className="flex-1 flex flex-col items-center gap-2 py-6"
                onClick={() => setDocType("deck")}
              >
                <Presentation className="h-8 w-8" />
                <span>Pitch Deck</span>
              </Button>
              <Button
                type="button"
                variant={docType === "document" ? "default" : "outline"}
                className="flex-1 flex flex-col items-center gap-2 py-6" 
                onClick={() => setDocType("document")}
              >
                <FileText className="h-8 w-8" />
                <span>Document</span>
              </Button>
              <Button
                type="button"
                variant={docType === "template" ? "default" : "outline"}
                className="flex-1 flex flex-col items-center gap-2 py-6"
                onClick={() => setDocType("template")}
              >
                <FilePieChart className="h-8 w-8" />
                <span>Template</span>
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter short description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Document</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentModal;
