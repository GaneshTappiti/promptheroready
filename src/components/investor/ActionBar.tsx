
import React from "react";
import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";
import SearchBar from "./SearchBar";

interface ActionBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  onAddClick: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ 
  searchQuery, 
  onSearchChange, 
  onFilterClick, 
  onAddClick 
}) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between">
      <SearchBar 
        value={searchQuery}
        onChange={onSearchChange}
      />
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={onFilterClick}
          className="transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button 
          onClick={onAddClick}
          className="transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Investor
        </Button>
      </div>
    </div>
  );
};

export default ActionBar;
