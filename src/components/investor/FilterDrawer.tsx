
import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ open, onClose }) => {
  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-[85vh] max-h-[85vh] fixed bottom-0 left-0 right-0 rounded-t-lg">
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle>Filter Investors</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="px-4 py-2 overflow-y-auto h-full">
          <div className="space-y-6">
            {/* Status filters */}
            <div>
              <h3 className="text-lg font-medium mb-3">Status</h3>
              <div className="space-y-2">
                {["Interested", "Follow-up", "To Contact", "Rejected", "Committed"].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox id={`status-${status.toLowerCase()}`} />
                    <Label htmlFor={`status-${status.toLowerCase()}`}>{status}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Stage filters */}
            <div>
              <h3 className="text-lg font-medium mb-3">Investment Stage</h3>
              <div className="space-y-2">
                {["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"].map((stage) => (
                  <div key={stage} className="flex items-center space-x-2">
                    <Checkbox id={`stage-${stage.toLowerCase().replace(" ", "-")}`} />
                    <Label htmlFor={`stage-${stage.toLowerCase().replace(" ", "-")}`}>{stage}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Focus area filters */}
            <div>
              <h3 className="text-lg font-medium mb-3">Focus Areas</h3>
              <div className="space-y-2">
                {["B2B SaaS", "Consumer Tech", "Fintech", "AI/ML", "Marketplace", "Healthcare", "Enterprise"].map((focus) => (
                  <div key={focus} className="flex items-center space-x-2">
                    <Checkbox id={`focus-${focus.toLowerCase().replace("/", "-").replace(" ", "-")}`} />
                    <Label htmlFor={`focus-${focus.toLowerCase().replace("/", "-").replace(" ", "-")}`}>{focus}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Last contact filters */}
            <div>
              <h3 className="text-lg font-medium mb-3">Last Contact</h3>
              <div className="space-y-2">
                {["Last 7 days", "Last 30 days", "Last 3 months", "Older than 3 months", "Never contacted"].map((timeframe) => (
                  <div key={timeframe} className="flex items-center space-x-2">
                    <Checkbox id={`contact-${timeframe.toLowerCase().replace(" ", "-")}`} />
                    <Label htmlFor={`contact-${timeframe.toLowerCase().replace(" ", "-")}`}>{timeframe}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DrawerFooter className="border-t p-4">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={onClose}>
              Reset Filters
            </Button>
            <Button onClick={onClose}>
              Apply Filters
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default FilterDrawer;
