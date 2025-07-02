import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Lightbulb,
  Calendar,
  Code,
  Users,
  Search,
  BarChart,
  Brain,
  MessageSquare,
  X,
  FileText,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, path, isActive, onClick }: SidebarItemProps) => {
  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-all duration-200 ${
        isActive
          ? "bg-green-600/20 text-green-400 border-l-2 border-green-400"
          : "text-gray-400 hover:bg-black/30 hover:text-white hover:border-l-2 hover:border-green-500/50"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
};

interface WorkspaceSidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

const WorkspaceSidebar = ({ isOpen = false, setIsOpen = () => {} }: WorkspaceSidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();

  const handleLinkClick = () => {
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  // Close sidebar when route changes
  useEffect(() => {
    if (setIsOpen) {
      setIsOpen(false);
    }
  }, [location.pathname, setIsOpen]);

  const modules = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, path: "/workspace" },
    { id: "idea-vault", name: "Idea Vault", icon: Lightbulb, path: "/workspace/idea-vault" },
    { id: "ideaforge", name: "IdeaForge", icon: Brain, path: "/workspace/ideaforge" },

    { id: "mvp-studio", name: "MVP Studio", icon: Code, path: "/workspace/mvp-studio" },
    { id: "ai-tools", name: "AI Tools Hub", icon: Brain, path: "/workspace/ai-tools" },
    { id: "docs-decks", name: "Docs & Decks", icon: FileText, path: "/workspace/docs-decks" },
    { id: "teamspace", name: "TeamSpace", icon: Users, path: "/workspace/teamspace" },
    { id: "investor-radar", name: "Investor Radar", icon: Search, path: "/workspace/investor-radar" },

  ];

  const sidebarContent = (
    <div className="h-full flex flex-col workspace-sidebar">
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-gradient-to-br from-green-500 to-green-600 w-8 h-8 flex items-center justify-center">
            <span className="font-bold text-white text-sm">SW</span>
          </div>
          <span className="font-bold text-lg text-white">StartWise</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen && setIsOpen(false)} className="text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <div className="px-2 py-4 flex-1 overflow-y-auto">
        <nav className="space-y-1">
          {modules.map((module) => (
            <SidebarItem 
              key={module.id}
              icon={module.icon}
              label={module.name}
              path={module.path}
              onClick={handleLinkClick}
              isActive={
                module.path === "/workspace" 
                  ? currentPath === "/workspace"
                  : currentPath.startsWith(module.path)
              }
            />
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-white/10">
        <div className="workspace-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-green-500/20 rounded">
              <MessageSquare className="h-4 w-4 text-green-400" />
            </div>
            <h4 className="text-sm font-medium text-white">Founder's GPT</h4>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Get advice on your startup journey from your AI co-founder
          </p>
          <button className="w-full bg-black/50 hover:bg-black/70 px-3 py-2 rounded text-xs text-left text-gray-300 hover:text-white transition-colors border border-white/10">
            Ask Founder's GPT...
          </button>
        </div>
      </div>
    </div>
  );

  // Use Sheet for both mobile and desktop for consistent off-canvas behavior
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen || (() => {})}>
      <SheetContent
        side="left"
        className="w-64 bg-black/95 backdrop-blur-xl border-r border-white/10 p-0 text-white"
      >
        {sidebarContent}
      </SheetContent>
    </Sheet>
  );
};

// Hamburger Menu Button Component
interface SidebarToggleProps {
  onClick: () => void;
  className?: string;
}

export const SidebarToggle = ({ onClick, className }: SidebarToggleProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`text-gray-400 hover:text-white hover:bg-black/30 ${className}`}
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};

export default WorkspaceSidebar;
