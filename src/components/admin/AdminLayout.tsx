import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import BreadcrumbNavigation, { BreadcrumbItem } from '@/components/BreadcrumbNavigation';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BarChart3,
  Users,
  CreditCard,
  FileText,
  Wrench,
  Settings,
  Shield,
  Menu,
  X,
  Home,
  Bell,
  Search,
  LogOut,
  User,
  ChevronDown,
  Activity,
} from 'lucide-react';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { adminUser, isAdmin, isSuperAdmin, checkPermission } = useAdmin();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Generate admin-specific breadcrumbs
  const generateAdminBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Workspace',
        href: '/workspace',
        icon: <Home className="h-4 w-4" />
      },
      {
        label: 'Admin Panel',
        href: '/admin',
        icon: <Shield className="h-4 w-4" />
      }
    ];

    // Add specific admin page breadcrumbs
    if (pathSegments.length > 1) {
      const adminPage = pathSegments[1];
      const pageConfig: Record<string, { name: string; icon: React.ReactNode }> = {
        'users': { name: 'User Analytics', icon: <Users className="h-4 w-4" /> },
        'subscriptions': { name: 'Subscriptions', icon: <CreditCard className="h-4 w-4" /> },
        'prompts': { name: 'Prompt Templates', icon: <FileText className="h-4 w-4" /> },
        'tools': { name: 'AI Tools Directory', icon: <Wrench className="h-4 w-4" /> },
        'settings': { name: 'Platform Settings', icon: <Settings className="h-4 w-4" /> },
        'roles': { name: 'Role Management', icon: <Shield className="h-4 w-4" /> },
      };

      const config = pageConfig[adminPage];
      if (config) {
        breadcrumbs.push({
          label: config.name,
          icon: config.icon as React.ReactElement,
          current: true
        });
      }
    }

    return breadcrumbs;
  };

  if (!isAdmin) {
    return <Navigate to="/workspace" replace />;
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: BarChart3,
      permission: null,
    },
    {
      name: 'User Analytics',
      href: '/admin/users',
      icon: Users,
      permission: 'canViewAnalytics' as const,
      superAdminOnly: true,
    },
    {
      name: 'Subscriptions',
      href: '/admin/subscriptions',
      icon: CreditCard,
      permission: 'canViewAnalytics' as const,
    },
    {
      name: 'Prompt Templates',
      href: '/admin/prompts',
      icon: FileText,
      permission: 'canManagePrompts' as const,
    },
    {
      name: 'AI Tools Directory',
      href: '/admin/tools',
      icon: Wrench,
      permission: 'canManageTools' as const,
    },
    {
      name: 'Platform Settings',
      href: '/admin/settings',
      icon: Settings,
      permission: 'canManageSettings' as const,
      superAdminOnly: true,
    },
    {
      name: 'Database Performance',
      href: '/admin/performance',
      icon: Activity,
      permission: 'canViewAnalytics' as const,
      superAdminOnly: true,
    },
    {
      name: 'Role Management',
      href: '/admin/roles',
      icon: Shield,
      permission: 'canManageRoles' as const,
      superAdminOnly: true,
    },
  ];

  const filteredNavItems = navigationItems.filter(item => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.permission && !checkPermission(item.permission)) return false;
    return true;
  });

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left side - Menu toggle and branding */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-white hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Back to Workspace Button */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 hidden md:flex"
            >
              <Link to="/workspace">
                <Home className="h-4 w-4 mr-2" />
                Back to Workspace
              </Link>
            </Button>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
                <p className="text-xs text-gray-400">PromptHeroReady</p>
              </div>
            </div>
          </div>

          {/* Center - Search (placeholder) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search admin panel..."
                className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-green-600 text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <Badge variant="secondary" className="text-xs bg-green-600/20 text-green-400">
                      {adminUser?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-black/80 backdrop-blur-xl border-white/10">
                <DropdownMenuLabel className="text-white">Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild>
                  <Link to="/workspace" className="text-white hover:bg-white/10">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Workspace
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="text-white hover:bg-white/10">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:bg-red-500/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          bg-black/40 backdrop-blur-xl border-r border-white/10
        `}>
          <div className="flex h-full flex-col">
            {/* Sidebar header */}
            <div className="flex h-16 items-center justify-between px-6 lg:hidden">
              <span className="text-lg font-semibold text-white">Navigation</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 px-4 py-6">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar footer */}
            <div className="border-t border-white/10 p-4">
              <div className="text-xs text-gray-400">
                <p>Admin Panel v1.0</p>
                <p>Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:pl-0">
          <div className="p-6">
            {/* Breadcrumb Navigation */}
            <div className="mb-6">
              <BreadcrumbNavigation
                items={generateAdminBreadcrumbs()}
                className="text-gray-400"
              />
            </div>

            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
