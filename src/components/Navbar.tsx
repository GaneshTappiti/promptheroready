
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  Settings,
  User,
  Menu,
  X
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { MobileButton } from "@/components/ui/mobile-responsive";


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
              <MobileButton
                variant="ghost"
                size="md"
                className="md:hidden min-w-[44px] min-h-[44px] p-2"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </MobileButton>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-background border-l border-white/10 w-[300px] sm:w-[350px]"
            >
              <SheetHeader className="pb-6">
                <SheetTitle className="text-left text-lg font-semibold">
                  Navigation
                </SheetTitle>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute right-4 top-4 mobile-touch-target rounded-full hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </SheetHeader>

              <div className="flex flex-col gap-2">
                {/* Main Navigation */}
                <div className="space-y-1">
                  <Link
                    to="/"
                    className={`mobile-nav-item transition-colors ${
                      isActive('/') ? 'text-primary bg-primary/10' : 'hover:text-primary hover:bg-muted/50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/workspace"
                    className={`mobile-nav-item transition-colors ${
                      isActive('/workspace') ? 'text-primary bg-primary/10' : 'hover:text-primary hover:bg-muted/50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Workspace
                  </Link>
                  <Link
                    to="/features"
                    className={`mobile-nav-item transition-colors ${
                      isActive('/features') ? 'text-primary bg-primary/10' : 'hover:text-primary hover:bg-muted/50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    to="/about"
                    className={`mobile-nav-item transition-colors ${
                      isActive('/about') ? 'text-primary bg-primary/10' : 'hover:text-primary hover:bg-muted/50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <MobileButton
                    variant="primary"
                    fullWidth
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/workspace" className="w-full">
                      Get Started
                    </Link>
                  </MobileButton>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-4 gap-3 pt-2">
                    <button className="mobile-touch-target rounded-lg hover:bg-muted/50 flex flex-col items-center gap-1">
                      <Search className="h-5 w-5" />
                      <span className="text-xs">Search</span>
                    </button>
                    <button className="mobile-touch-target rounded-lg hover:bg-muted/50 flex flex-col items-center gap-1 relative">
                      <Bell className="h-5 w-5" />
                      <span className="text-xs">Alerts</span>
                      <span className="absolute top-1 right-2 w-2 h-2 bg-primary rounded-full"></span>
                    </button>
                    <button className="mobile-touch-target rounded-lg hover:bg-muted/50 flex flex-col items-center gap-1">
                      <Settings className="h-5 w-5" />
                      <span className="text-xs">Settings</span>
                    </button>
                    <button className="mobile-touch-target rounded-lg hover:bg-muted/50 flex flex-col items-center gap-1">
                      <User className="h-5 w-5" />
                      <span className="text-xs">Profile</span>
                    </button>
                  </div>
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
