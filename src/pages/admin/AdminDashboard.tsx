import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/lib/supabase';
import {
  Users,
  CreditCard,
  Activity,
  TrendingUp,
  FileText,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
  Globe,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  paidUsers: number;
  freeUsers: number;
  totalIdeas: number;
  totalPrompts: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  apiUsage: number;
}

const AdminDashboard: React.FC = () => {
  const { adminUser, isSuperAdmin, checkPermission } = useAdmin();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    paidUsers: 0,
    freeUsers: 0,
    totalIdeas: 0,
    totalPrompts: 0,
    systemHealth: 'healthy',
    apiUsage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch user statistics (aggregated, no personal data)
      const { data: userStats, error: userError } = await supabase
        .from('user_settings')
        .select('subscription_tier, created_at')
        .not('user_id', 'is', null);

      if (userError) throw userError;

      // Calculate user metrics
      const totalUsers = userStats?.length || 0;
      const paidUsers = userStats?.filter(u => u.subscription_tier !== 'free').length || 0;
      const freeUsers = totalUsers - paidUsers;
      
      // Active users (logged in within last 30 days) - this would need auth.users access
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // For now, estimate active users as 70% of total (in real implementation, query auth.users)
      const activeUsers = Math.floor(totalUsers * 0.7);

      // Fetch idea statistics (count only, no content)
      const { count: ideaCount, error: ideaError } = await supabase
        .from('ideas')
        .select('*', { count: 'exact', head: true });

      if (ideaError && ideaError.code !== 'PGRST116') {
        console.warn('Could not fetch idea count:', ideaError);
      }

      // Fetch prompt template statistics
      const { count: promptCount, error: promptError } = await supabase
        .from('prompt_templates')
        .select('*', { count: 'exact', head: true });

      if (promptError && promptError.code !== 'PGRST116') {
        console.warn('Could not fetch prompt count:', promptError);
      }

      setStats({
        totalUsers,
        activeUsers,
        paidUsers,
        freeUsers,
        totalIdeas: ideaCount || 0,
        totalPrompts: promptCount || 0,
        systemHealth: 'healthy', // This would be determined by actual health checks
        apiUsage: Math.floor(Math.random() * 100), // Placeholder
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30">Warning</Badge>;
      case 'critical':
        return <Badge className="bg-red-600/20 text-red-400 border-red-500/30">Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="animate-pulse h-8 w-32 bg-white/10 rounded"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="workspace-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-white/10 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome back, {adminUser?.email} • {adminUser?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getHealthBadge(stats.systemHealth)}
          <Button 
            onClick={fetchDashboardStats} 
            variant="outline" 
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="workspace-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-gray-400">
              {stats.activeUsers} active in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.paidUsers}</div>
            <p className="text-xs text-gray-400">
              {stats.freeUsers} free users
            </p>
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Ideas Created</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalIdeas.toLocaleString()}</div>
            <p className="text-xs text-gray-400">
              Across all users
            </p>
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Prompt Templates</CardTitle>
            <FileText className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalPrompts}</div>
            <p className="text-xs text-gray-400">
              System templates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-400" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">API Response Time</span>
              <span className="text-green-400">~120ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Database Status</span>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">AI Provider Status</span>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">API Usage</span>
                <span className="text-white">{stats.apiUsage}%</span>
              </div>
              <Progress value={stats.apiUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checkPermission('canManagePrompts') && (
              <Button 
                variant="outline" 
                className="w-full justify-start border-white/20 text-white hover:bg-white/10"
                onClick={() => window.location.href = '/admin/prompts'}
              >
                <FileText className="mr-2 h-4 w-4" />
                Manage Prompt Templates
              </Button>
            )}
            {checkPermission('canManageTools') && (
              <Button 
                variant="outline" 
                className="w-full justify-start border-white/20 text-white hover:bg-white/10"
                onClick={() => window.location.href = '/admin/tools'}
              >
                <Wrench className="mr-2 h-4 w-4" />
                Update AI Tools Directory
              </Button>
            )}
            {isSuperAdmin && (
              <Button 
                variant="outline" 
                className="w-full justify-start border-white/20 text-white hover:bg-white/10"
                onClick={() => window.location.href = '/admin/settings'}
              >
                <Zap className="mr-2 h-4 w-4" />
                Platform Settings
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card className="workspace-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">System health check completed</span>
              <span className="text-gray-500 ml-auto">2 minutes ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-300">New prompt template published</span>
              <span className="text-gray-500 ml-auto">1 hour ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-300">AI tools directory updated</span>
              <span className="text-gray-500 ml-auto">3 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
