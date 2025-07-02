
import React, { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";

interface IdeaSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

const IdeaSearch: React.FC<IdeaSearchProps> = ({ value, onChange, onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus the input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Handle escape key to close search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search ideas..."
        className="pl-10 pr-10 py-6 text-lg"
      />
      {value && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onChange('')}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default IdeaSearch;
