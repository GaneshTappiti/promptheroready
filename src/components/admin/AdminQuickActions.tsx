import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/contexts/AdminContext';
import { 
  Shield, 
  BarChart3, 
  Users, 
  FileText, 
  Wrench, 
  Settings,
  ArrowRight,
  Activity
} from 'lucide-react';

interface AdminQuickActionsProps {
  className?: string;
}

const AdminQuickActions: React.FC<AdminQuickActionsProps> = ({ className = '' }) => {
  const { isAdmin, isSuperAdmin, adminUser } = useAdmin();

  if (!isAdmin) {
    return null;
  }

  const quickActions = [
    {
      title: 'Dashboard',
      description: 'View system metrics and analytics',
      href: '/admin',
      icon: BarChart3,
      color: 'text-blue-400',
      available: true
    },
    {
      title: 'Prompt Templates',
      description: 'Manage system-wide prompt templates',
      href: '/admin/prompts',
      icon: FileText,
      color: 'text-green-400',
      available: true
    },
    {
      title: 'AI Tools Directory',
      description: 'Update AI tools recommendations',
      href: '/admin/tools',
      icon: Wrench,
      color: 'text-purple-400',
      available: true
    },
    {
      title: 'User Analytics',
      description: 'View user engagement metrics',
      href: '/admin/users',
      icon: Users,
      color: 'text-orange-400',
      available: isSuperAdmin
    },
    {
      title: 'Platform Settings',
      description: 'Configure system settings',
      href: '/admin/settings',
      icon: Settings,
      color: 'text-red-400',
      available: isSuperAdmin
    }
  ];

  const availableActions = quickActions.filter(action => action.available);

  return (
    <Card className={`workspace-card ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-400" />
          Admin Quick Actions
          <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400 ml-auto">
            {adminUser?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {availableActions.slice(0, 3).map((action) => (
          <Button
            key={action.href}
            asChild
            variant="outline"
            className="w-full justify-between border-white/20 text-white hover:bg-white/10 h-auto p-3"
          >
            <Link to={action.href}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded ${action.color.replace('text-', 'bg-').replace('-400', '-500/20')}`}>
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-gray-400">{action.description}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>
          </Button>
        ))}
        
        {availableActions.length > 3 && (
          <Button
            asChild
            variant="ghost"
            className="w-full text-green-400 hover:bg-green-500/10"
          >
            <Link to="/admin">
              <Activity className="h-4 w-4 mr-2" />
              View All Admin Features
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminQuickActions;
