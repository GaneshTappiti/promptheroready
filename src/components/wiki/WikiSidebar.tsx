
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder, Star, FileText, Tag, Settings, Search, X } from "lucide-react";
import { WikiPage } from "@/types/wiki";

interface WikiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pages: WikiPage[];
}

const WikiSidebar: React.FC<WikiSidebarProps> = ({ isOpen, onClose, pages }) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Wiki Pages</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search pages..." 
                className="pl-9"
              />
            </div>
          </div>
          
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all" className="flex flex-col items-center gap-1 py-2">
                <FileText className="h-4 w-4" />
                <span className="text-xs">All</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex flex-col items-center gap-1 py-2">
                <Star className="h-4 w-4" />
                <span className="text-xs">Favorites</span>
              </TabsTrigger>
              <TabsTrigger value="tags" className="flex flex-col items-center gap-1 py-2">
                <Tag className="h-4 w-4" />
                <span className="text-xs">Tags</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex flex-col items-center gap-1 py-2">
                <Settings className="h-4 w-4" />
                <span className="text-xs">Settings</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {pages.length > 0 ? (
                <ul className="space-y-1">
                  {pages.map(page => (
                    <li key={page.id}>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-left h-auto py-2"
                      >
                        <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{page.title}</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <Folder className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No pages yet</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="favorites" className="min-h-[200px] flex items-center justify-center">
              <div className="text-center py-8">
                <Star className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No favorite pages yet</p>
              </div>
            </TabsContent>
            
            <TabsContent value="tags" className="min-h-[200px] flex items-center justify-center">
              <div className="text-center py-8">
                <Tag className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No tags created yet</p>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="min-h-[200px] flex items-center justify-center">
              <div className="text-center py-8">
                <Settings className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Wiki settings coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WikiSidebar;
