import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAdmin } from '@/contexts/AdminContext';
import { Shield, Settings, BarChart3 } from 'lucide-react';

interface AdminStatusIndicatorProps {
  variant?: 'badge' | 'card' | 'button';
  className?: string;
}

const AdminStatusIndicator: React.FC<AdminStatusIndicatorProps> = ({
  variant = 'badge',
  className = ''
}) => {
  const { isAdmin, isSuperAdmin, adminUser, loading } = useAdmin();

  if (loading || !isAdmin) {
    return null;
  }

  const adminRole = adminUser?.role === 'super_admin' ? 'Super Admin' : 'Admin';
  const adminColor = adminUser?.role === 'super_admin' ? 'text-green-400' : 'text-blue-400';

  if (variant === 'badge') {
    return (
      <Badge 
        variant="outline" 
        className={`border-green-500/30 bg-green-500/10 text-green-400 ${className}`}
      >
        <Shield className="h-3 w-3 mr-1" />
        {adminRole}
      </Badge>
    );
  }

  if (variant === 'button') {
    return (
      <Button
        asChild
        variant="outline"
        size="sm"
        className={`border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 ${className}`}
      >
        <Link to="/admin">
          <Shield className="h-4 w-4 mr-2" />
          Admin Panel
        </Link>
      </Button>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={`workspace-card ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Shield className={`h-5 w-5 ${adminColor}`} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">{adminRole} Access</h4>
                <p className="text-xs text-gray-400">Manage platform settings</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Link to="/admin">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
              </Button>
              {isSuperAdmin && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Link to="/admin/settings">
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default AdminStatusIndicator;
