import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAdmin, withAdminAuth } from '@/contexts/AdminContext';
import { supabase } from '@/lib/supabase';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface SubscriptionData {
  totalSubscribers: number;
  freeUsers: number;
  paidUsers: number;
  trialUsers: number;
  mrr: number;
  arr: number;
  churnRate: number;
  conversionRate: number;
  planBreakdown: Array<{
    plan: string;
    users: number;
    revenue: number;
    percentage: number;
  }>;
  revenueGrowth: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  countryRevenue: Array<{
    country: string;
    revenue: number;
    users: number;
  }>;
}

const SubscriptionAnalytics: React.FC = () => {
  const { checkPermission } = useAdmin();
  const [data, setData] = useState<SubscriptionData>({
    totalSubscribers: 0,
    freeUsers: 0,
    paidUsers: 0,
    trialUsers: 0,
    mrr: 0,
    arr: 0,
    churnRate: 0,
    conversionRate: 0,
    planBreakdown: [],
    revenueGrowth: { monthly: 0, quarterly: 0, yearly: 0 },
    countryRevenue: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);

      // Fetch user subscription data
      const { data: userSettings, error } = await supabase
        .from('user_settings')
        .select('subscription_tier, subscription_status, created_at, settings')
        .not('user_id', 'is', null);

      if (error) throw error;

      const totalUsers = userSettings?.length || 0;
      const freeUsers = userSettings?.filter(u => u.subscription_tier === 'free').length || 0;
      const paidUsers = userSettings?.filter(u => u.subscription_tier !== 'free' && u.subscription_status === 'active').length || 0;
      const trialUsers = userSettings?.filter(u => u.subscription_status === 'trial').length || 0;

      // Calculate plan breakdown
      const planCounts = userSettings?.reduce((acc, user) => {
        const plan = user.subscription_tier || 'free';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Mock pricing data (in real implementation, this would come from your pricing config)
      const planPricing = {
        free: 0,
        starter: 999, // ₹999/month
        pro: 2999,    // ₹2999/month
        enterprise: 9999, // ₹9999/month
      };

      const planBreakdown = Object.entries(planCounts).map(([plan, users]) => ({
        plan: plan.charAt(0).toUpperCase() + plan.slice(1),
        users,
        revenue: users * (planPricing[plan as keyof typeof planPricing] || 0),
        percentage: (users / totalUsers) * 100,
      }));

      // Calculate MRR and ARR
      const mrr = planBreakdown.reduce((sum, plan) => sum + plan.revenue, 0);
      const arr = mrr * 12;

      // Mock additional metrics (in real implementation, calculate from historical data)
      const mockMetrics = {
        churnRate: 5.2,
        conversionRate: 12.8,
        revenueGrowth: {
          monthly: 15.3,
          quarterly: 42.7,
          yearly: 156.8,
        },
        countryRevenue: [
          { country: 'India', revenue: Math.floor(mrr * 0.4), users: Math.floor(paidUsers * 0.4) },
          { country: 'United States', revenue: Math.floor(mrr * 0.3), users: Math.floor(paidUsers * 0.3) },
          { country: 'United Kingdom', revenue: Math.floor(mrr * 0.15), users: Math.floor(paidUsers * 0.15) },
          { country: 'Canada', revenue: Math.floor(mrr * 0.1), users: Math.floor(paidUsers * 0.1) },
          { country: 'Others', revenue: Math.floor(mrr * 0.05), users: Math.floor(paidUsers * 0.05) },
        ],
      };

      setData({
        totalSubscribers: totalUsers,
        freeUsers,
        paidUsers,
        trialUsers,
        mrr,
        arr,
        planBreakdown,
        ...mockMetrics,
      });

    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // In a real implementation, this would generate and download a CSV/Excel file
    const csvData = [
      ['Plan', 'Users', 'Revenue (INR)', 'Percentage'],
      ...data.planBreakdown.map(plan => [
        plan.plan,
        plan.users.toString(),
        plan.revenue.toString(),
        plan.percentage.toFixed(1) + '%'
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscription-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Subscription Analytics</h1>
          <div className="animate-pulse h-8 w-32 bg-white/10 rounded"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-white">Subscription Analytics</h1>
          <p className="text-gray-400 mt-1">
            Revenue metrics and subscription performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={exportData} 
            variant="outline" 
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button 
            onClick={fetchSubscriptionData} 
            variant="outline" 
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Revenue Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="workspace-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{data.mrr.toLocaleString()}</div>
            <p className="text-xs text-green-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{data.revenueGrowth.monthly}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Annual Recurring Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{data.arr.toLocaleString()}</div>
            <p className="text-xs text-green-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{data.revenueGrowth.yearly}% YoY
            </p>
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Paid Subscribers</CardTitle>
            <CreditCard className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.paidUsers.toLocaleString()}</div>
            <p className="text-xs text-gray-400">
              {data.trialUsers} on trial
            </p>
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.conversionRate}%</div>
            <p className="text-xs text-gray-400">
              Free to paid conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Breakdown and Health Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              Subscription Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.planBreakdown.map((plan, index) => (
              <div key={plan.plan} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">{plan.plan}</span>
                    <Badge variant="secondary" className="text-xs">
                      {plan.users} users
                    </Badge>
                  </div>
                  <span className="text-white">₹{plan.revenue.toLocaleString()}/mo</span>
                </div>
                <Progress value={plan.percentage} className="h-2" />
                <p className="text-xs text-gray-400">{plan.percentage.toFixed(1)}% of total users</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Health Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Churn Rate</span>
              <div className="flex items-center gap-2">
                <span className="text-white">{data.churnRate}%</span>
                {data.churnRate < 10 ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Customer Lifetime Value</span>
              <span className="text-white">₹{Math.floor(data.mrr / data.paidUsers * 24).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Average Revenue Per User</span>
              <span className="text-white">₹{Math.floor(data.mrr / data.paidUsers).toLocaleString()}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Revenue Growth</span>
                <span className="text-green-400">+{data.revenueGrowth.monthly}%</span>
              </div>
              <Progress value={Math.min(data.revenueGrowth.monthly, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Revenue Distribution */}
      <Card className="workspace-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            Revenue by Country
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.countryRevenue.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 min-w-[100px]">{country.country}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(country.revenue / data.mrr) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400">{country.users} users</span>
                  </div>
                </div>
                <span className="text-white font-medium">₹{country.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default withAdminAuth(SubscriptionAnalytics, 'canViewAnalytics');
