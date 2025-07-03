
import React, { useState } from "react";
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

const WorkspaceLayout = ({ children }: WorkspaceLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-container bg-background">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content - no margin since sidebar is now overlay */}
      <main className="layout-main p-6 transition-all duration-300">
        {/* Top navigation bar with hamburger menu */}
        <div className="flex items-center gap-4 mb-6">
          <SidebarToggle onClick={() => setSidebarOpen(true)} />
          <div className="flex-1">
            {/* This space can be used for page-specific navigation or breadcrumbs */}
          </div>
        </div>
        <div className="layout-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default WorkspaceLayout;
