/**
 * Comprehensive Feature Test Component
 * Tests multiple features quickly to ensure database connectivity and basic functionality
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Loader2, Users, FileText, Target, Brain, Calendar, DollarSign, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface TestResult {
  feature: string;
  tests: Array<{
    name: string;
    success: boolean;
    error?: string;
  }>;
  overallSuccess: boolean;
}

const ComprehensiveFeatureTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { user } = useAuth();

  const runComprehensiveTests = async () => {
    setIsRunning(true);
    setResults([]);
    const allResults: TestResult[] = [];

    if (!user) {
      setResults([{
        feature: 'Authentication',
        tests: [{ name: 'User Login Check', success: false, error: 'User must be logged in' }],
        overallSuccess: false
      }]);
      setIsRunning(false);
      return;
    }

    // Test 1: Team Space Features
    const teamSpaceTests = [];
    try {
      // Test teams table
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .limit(1);
      teamSpaceTests.push({
        name: 'Teams Table Access',
        success: !teamsError,
        error: teamsError?.message
      });

      // Test team_members table
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .limit(1);
      teamSpaceTests.push({
        name: 'Team Members Table Access',
        success: !membersError,
        error: membersError?.message
      });

      // Test team_messages table
      const { data: messages, error: messagesError } = await supabase
        .from('team_messages')
        .select('*')
        .limit(1);
      teamSpaceTests.push({
        name: 'Team Messages Table Access',
        success: !messagesError,
        error: messagesError?.message
      });

    } catch (error) {
      teamSpaceTests.push({
        name: 'Team Space General Test',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    allResults.push({
      feature: 'Team Space',
      tests: teamSpaceTests,
      overallSuccess: teamSpaceTests.every(t => t.success)
    });

    // Test 2: Task Planner Features
    const taskPlannerTests = [];
    try {
      // Test projects table
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .limit(1);
      taskPlannerTests.push({
        name: 'Projects Table Access',
        success: !projectsError,
        error: projectsError?.message
      });

      // Test tasks table
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .limit(1);
      taskPlannerTests.push({
        name: 'Tasks Table Access',
        success: !tasksError,
        error: tasksError?.message
      });

      // Test project_phases table
      const { data: phases, error: phasesError } = await supabase
        .from('project_phases')
        .select('*')
        .limit(1);
      taskPlannerTests.push({
        name: 'Project Phases Table Access',
        success: !phasesError,
        error: phasesError?.message
      });

    } catch (error) {
      taskPlannerTests.push({
        name: 'Task Planner General Test',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    allResults.push({
      feature: 'Task Planner',
      tests: taskPlannerTests,
      overallSuccess: taskPlannerTests.every(t => t.success)
    });

    // Test 3: Investor Radar Features
    const investorRadarTests = [];
    try {
      // Test investors table
      const { data: investors, error: investorsError } = await supabase
        .from('investors')
        .select('*')
        .limit(1);
      investorRadarTests.push({
        name: 'Investors Table Access',
        success: !investorsError,
        error: investorsError?.message
      });

      // Test funding_rounds table
      const { data: funding, error: fundingError } = await supabase
        .from('funding_rounds')
        .select('*')
        .limit(1);
      investorRadarTests.push({
        name: 'Funding Rounds Table Access',
        success: !fundingError,
        error: fundingError?.message
      });

    } catch (error) {
      investorRadarTests.push({
        name: 'Investor Radar General Test',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    allResults.push({
      feature: 'Investor Radar',
      tests: investorRadarTests,
      overallSuccess: investorRadarTests.every(t => t.success)
    });

    // Test 4: Admin Panel Features
    const adminTests = [];
    try {
      // Test admin_users table
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .limit(1);
      adminTests.push({
        name: 'Admin Users Table Access',
        success: !adminError,
        error: adminError?.message
      });

      // Test system_metrics table
      const { data: metrics, error: metricsError } = await supabase
        .from('system_metrics')
        .select('*')
        .limit(1);
      adminTests.push({
        name: 'System Metrics Table Access',
        success: !metricsError,
        error: metricsError?.message
      });

    } catch (error) {
      adminTests.push({
        name: 'Admin Panel General Test',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    allResults.push({
      feature: 'Admin Panel',
      tests: adminTests,
      overallSuccess: adminTests.every(t => t.success)
    });

    // Test 5: User Profile & Settings
    const profileTests = [];
    try {
      // Test user_preferences table
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .limit(1);
      profileTests.push({
        name: 'User Preferences Table Access',
        success: !prefError,
        error: prefError?.message
      });

      // Test notifications table
      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .limit(1);
      profileTests.push({
        name: 'Notifications Table Access',
        success: !notifError,
        error: notifError?.message
      });

    } catch (error) {
      profileTests.push({
        name: 'Profile & Settings General Test',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    allResults.push({
      feature: 'User Profile & Settings',
      tests: profileTests,
      overallSuccess: profileTests.every(t => t.success)
    });

    setResults(allResults);
    setIsRunning(false);
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'Team Space': return <Users className="h-5 w-5" />;
      case 'Task Planner': return <Calendar className="h-5 w-5" />;
      case 'Investor Radar': return <DollarSign className="h-5 w-5" />;
      case 'Admin Panel': return <Settings className="h-5 w-5" />;
      case 'User Profile & Settings': return <Settings className="h-5 w-5" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  const overallSuccess = results.length > 0 && results.every(r => r.overallSuccess);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Comprehensive Feature Test
          </CardTitle>
          <CardDescription>
            Quick verification of all major features and database connectivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current User Status */}
          <Alert className={user ? "border-green-500" : "border-red-500"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  User Status: {user ? `Logged in as ${user.email}` : 'Not logged in - tests will fail'}
                </span>
                <Badge variant={user ? "default" : "destructive"}>
                  {user ? "AUTHENTICATED" : "NOT AUTHENTICATED"}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>

          {/* Overall Status */}
          {results.length > 0 && (
            <Alert className={overallSuccess ? "border-green-500" : "border-red-500"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    Overall Status: {overallSuccess ? "All features working!" : "Some features need attention"}
                  </span>
                  {getStatusBadge(overallSuccess)}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Test Action */}
          <div className="flex justify-center">
            <Button
              onClick={runComprehensiveTests}
              disabled={isRunning || !user}
              size="lg"
              className="flex items-center gap-2"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {isRunning ? 'Running Tests...' : 'Run Comprehensive Tests'}
            </Button>
          </div>

          {/* Test Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Feature Test Results</h3>
              {results.map((result, index) => (
                <Card key={index} className={`border-l-4 ${result.overallSuccess ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center gap-2">
                        {getFeatureIcon(result.feature)}
                        {result.feature}
                      </div>
                      {getStatusBadge(result.overallSuccess)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.tests.map((test, testIndex) => (
                        <div key={testIndex} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(test.success)}
                            <span className="text-sm">{test.name}</span>
                          </div>
                          {test.error && (
                            <span className="text-xs text-red-500 max-w-xs truncate">{test.error}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveFeatureTest;