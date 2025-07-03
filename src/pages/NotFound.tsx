import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search, Lightbulb, FileText, Users, Menu } from "lucide-react";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";

const NotFound = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const quickLinks = [
    { name: "Workspace", path: "/workspace", icon: Home, description: "Return to your dashboard" },
    { name: "Idea Vault", path: "/workspace/idea-vault", icon: Lightbulb, description: "Manage your startup ideas" },
    { name: "Docs & Decks", path: "/workspace/docs-decks", icon: FileText, description: "Create documents and presentations" },
    { name: "Team Space", path: "/workspace/teamspace", icon: Users, description: "Collaborate with your team" }
  ];

  return (
    <div className="layout-container">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="layout-main flex items-center justify-center p-6 transition-all duration-300">
        {/* Top navigation with hamburger menu */}
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-black/30"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
        <div className="max-w-2xl w-full">
          <Card className="bg-black/80 backdrop-blur-xl border-white/10 text-center">
            <CardContent className="p-8 md:p-12">
              {/* 404 Animation */}
              <div className="mb-8">
                <div className="text-8xl md:text-9xl font-bold text-green-500/20 mb-4">404</div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-purple-500/20 blur-3xl"></div>
                  <h1 className="relative text-3xl md:text-4xl font-bold text-white mb-4">
                    Page Not Found
                  </h1>
                </div>
              </div>

              <p className="text-lg text-gray-400 mb-8">
                The page you're looking for doesn't exist or has been moved.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link to="/workspace">
                  <Button className="w-full sm:w-auto">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Workspace
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>

              {/* Quick Links */}
              <div className="border-t border-white/10 pt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickLinks.map((link) => (
                    <Link key={link.path} to={link.path}>
                      <div className="group bg-black/40 rounded-lg p-4 border border-white/10 hover:border-green-500/30 transition-all duration-300 text-left hover:bg-black/60">
                        <div className="flex items-center gap-3">
                          <link.icon className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform" />
                          <div>
                            <h4 className="font-medium text-white group-hover:text-green-400 transition-colors">
                              {link.name}
                            </h4>
                            <p className="text-sm text-gray-400">{link.description}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Help Text */}
              <div className="mt-8 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <Search className="h-4 w-4" />
                  <span className="text-sm">
                    Need help? Try searching for what you're looking for in the workspace.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
