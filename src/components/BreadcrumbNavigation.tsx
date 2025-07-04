import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

import {
  Home,
  Lightbulb,
  Archive,
  Hammer,
  Rocket,
  Settings,
  User,
  BookOpen,
  Presentation,
  Zap,
  Shield
} from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  maxItems?: number;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items = [],
  className,
  showHome = true,
  maxItems = 5
}) => {
  const location = useLocation();

  // Auto-generate breadcrumbs from current path if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (showHome) {
      breadcrumbs.push({
        label: 'Home',
        href: '/',
        icon: <Home className="h-4 w-4" />
      });
    }

    // Map common routes to readable names and icons
    const routeConfig: Record<string, { name: string; icon: React.ReactNode }> = {
      workspace: { name: 'Workspace', icon: <Lightbulb className="h-4 w-4" /> },
      'idea-vault': { name: 'Idea Vault', icon: <Archive className="h-4 w-4" /> },
      ideaforge: { name: 'IdeaForge', icon: <Hammer className="h-4 w-4" /> },
      'mvp-studio': { name: 'MVP Studio', icon: <Rocket className="h-4 w-4" /> },
      settings: { name: 'Settings', icon: <Settings className="h-4 w-4" /> },
      profile: { name: 'Profile', icon: <User className="h-4 w-4" /> },
      account: { name: 'Account', icon: <User className="h-4 w-4" /> },
      'ai-tools': { name: 'AI Tools', icon: <Zap className="h-4 w-4" /> },
      docs: { name: 'Documentation', icon: <BookOpen className="h-4 w-4" /> },
      decks: { name: 'Pitch Decks', icon: <Presentation className="h-4 w-4" /> },
      // Admin routes
      admin: { name: 'Admin Panel', icon: <Shield className="h-4 w-4" /> },
      users: { name: 'User Analytics', icon: <User className="h-4 w-4" /> },
      subscriptions: { name: 'Subscriptions', icon: <Settings className="h-4 w-4" /> },
      prompts: { name: 'Prompt Templates', icon: <BookOpen className="h-4 w-4" /> },
      tools: { name: 'AI Tools Directory', icon: <Zap className="h-4 w-4" /> },
      roles: { name: 'Role Management', icon: <Shield className="h-4 w-4" /> }
    };

    pathSegments.forEach((segment, index) => {
      const isLast = index === pathSegments.length - 1;
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const config = routeConfig[segment];
      const label = config?.name || segment.charAt(0).toUpperCase() + segment.slice(1);
      const icon = config?.icon;

      breadcrumbs.push({
        label,
        href: isLast ? undefined : path,
        icon,
        current: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs();

  // Truncate items if they exceed maxItems
  const displayItems = breadcrumbItems.length > maxItems
    ? [
        ...breadcrumbItems.slice(0, 1),
        { label: '...', href: undefined },
        ...breadcrumbItems.slice(-maxItems + 2)
      ]
    : breadcrumbItems;

  if (displayItems.length <= 1) {
    return null; // Don't show breadcrumbs for single items
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {displayItems.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.href && !item.current ? (
                <BreadcrumbLink asChild>
                  <Link 
                    to={item.href}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="flex items-center gap-1.5">
                  {item.icon}
                  <span>{item.label}</span>
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            
            {index < displayItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

// Breadcrumb context for managing breadcrumb state across components
interface BreadcrumbContextType {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
  addItem: (item: BreadcrumbItem) => void;
  removeItem: (index: number) => void;
  clear: () => void;
}

const BreadcrumbContext = React.createContext<BreadcrumbContextType | undefined>(undefined);

export const BreadcrumbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = React.useState<BreadcrumbItem[]>([]);

  const addItem = React.useCallback((item: BreadcrumbItem) => {
    setItems(prev => [...prev, item]);
  }, []);

  const removeItem = React.useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clear = React.useCallback(() => {
    setItems([]);
  }, []);

  const value = React.useMemo(() => ({
    items,
    setItems,
    addItem,
    removeItem,
    clear
  }), [items, addItem, removeItem, clear]);

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => {
  const context = React.useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
};

// Hook to automatically set breadcrumbs based on current route
export const useBreadcrumbEffect = (items: BreadcrumbItem[]) => {
  const { setItems } = useBreadcrumb();
  
  React.useEffect(() => {
    setItems(items);
    return () => setItems([]); // Clear on unmount
  }, [items, setItems]);
};

export default BreadcrumbNavigation;
