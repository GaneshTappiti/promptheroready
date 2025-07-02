
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterModal = ({ isOpen, onClose }: FilterModalProps) => {
  // Sample tags for filtering
  const availableTags = [
    "Health", "Mobile App", "AI", "SaaS", "Productivity",
    "Marketplace", "Sustainability", "E-commerce", "Remote Work", 
    "Collaboration", "Developer Tools", "Seniors"
  ];
  
  // States for filters
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  const handleStatusToggle = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };
  
  const handleApplyFilters = () => {
    // Here you would apply the filters to the idea list
    // For this example, we'll just close the modal
    onClose();
  };
  
  const handleClearFilters = () => {
    setSelectedTags([]);
    setSortBy("newest");
    setStatusFilters([]);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Ideas</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Sort options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Sort By</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={sortBy === "newest" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSortBy("newest")}
              >
                Newest
              </Button>
              <Button 
                variant={sortBy === "popular" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSortBy("popular")}
              >
                Most Popular
              </Button>
              <Button 
                variant={sortBy === "comments" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSortBy("comments")}
              >
                Most Comments
              </Button>
              <Button 
                variant={sortBy === "alphabetical" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSortBy("alphabetical")}
              >
                Alphabetical
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Status filters */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Status</h4>
            <div className="space-y-2">
              {["validated", "exploring", "archived"].map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`status-${status}`}
                    checked={statusFilters.includes(status)}
                    onCheckedChange={() => handleStatusToggle(status)}
                  />
                  <Label 
                    htmlFor={`status-${status}`}
                    className="text-sm capitalize"
                  >
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          {/* Tag filters */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center mt-6">
          <Button 
            variant="ghost" 
            onClick={handleClearFilters}
          >
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
