import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  const location = useLocation();

  // Auto-generate breadcrumbs from current path if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Workspace', href: '/workspace', icon: <Home className="h-4 w-4" /> }
    ];

    let currentPath = '';
    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      
      // Skip the first 'workspace' segment as it's already added
      if (segment === 'workspace') continue;
      
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        href: currentPath
      });
    }

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          
          {item.href && index < breadcrumbItems.length - 1 ? (
            <Link
              to={item.href}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-white font-medium">
              {item.icon}
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
