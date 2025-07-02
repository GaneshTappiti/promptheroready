
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { 
  Search, 
  Bell, 
  Settings, 
  User,
  Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Check if the current path matches the given path
  const isActive = (path: string) => {
    return location.pathname === path || 
      (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/10">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-custom w-8 h-8 flex items-center justify-center">
              <span className="font-bold text-white text-sm">IV</span>
            </div>
            <span className="font-bold text-lg hidden md:inline-block">Startify OS</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-primary' : 'hover:text-primary'}`}
            >
              Home
            </Link>
            <Link 
              to="/workspace" 
              className={`text-sm font-medium transition-colors ${isActive('/workspace') ? 'text-primary' : 'hover:text-primary'}`}
            >
              Workspace
            </Link>
            <Link 
              to="/features" 
              className={`text-sm font-medium transition-colors ${isActive('/features') ? 'text-primary' : 'hover:text-primary'}`}
            >
              Features
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-medium transition-colors ${isActive('/about') ? 'text-primary' : 'hover:text-primary'}`}
            >
              About
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-muted">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-muted relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <button className="p-2 rounded-full hover:bg-muted">
              <Settings className="h-5 w-5" />
            </button>
            <div className="h-8 w-px bg-border mx-1"></div>
            <button className="p-1 rounded-full bg-muted">
              <User className="h-5 w-5" />
            </button>
          </div>
          
          <Button asChild className="bg-primary hover:bg-primary/90 hidden md:flex">
            <Link to="/workspace">
              Get Started
            </Link>
          </Button>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-l border-white/10">
              <div className="flex flex-col gap-6 pt-6">
                <Link 
                  to="/" 
                  className={`text-sm font-medium py-2 ${isActive('/') ? 'text-primary' : 'hover:text-primary'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/workspace" 
                  className={`text-sm font-medium py-2 ${isActive('/workspace') ? 'text-primary' : 'hover:text-primary'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Workspace
                </Link>
                <Link 
                  to="/features" 
                  className={`text-sm font-medium py-2 ${isActive('/features') ? 'text-primary' : 'hover:text-primary'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  to="/about" 
                  className={`text-sm font-medium py-2 ${isActive('/about') ? 'text-primary' : 'hover:text-primary'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link to="/workspace" onClick={() => setIsMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
