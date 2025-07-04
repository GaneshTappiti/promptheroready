import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import DataMigrationService, { MigrationResult } from '@/utils/dataMigration';

interface MigrationStatus {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: MigrationResult;
}

const MigrationRunner: React.FC = () => {
  const { toast } = useToast();
  const [migrations, setMigrations] = useState<MigrationStatus[]>([
    { name: 'User Settings Migration', status: 'pending' },
    { name: 'Idea Relationships Migration', status: 'pending' },
    { name: 'User Onboarding Initialization', status: 'pending' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  const runAllMigrations = async () => {
    setIsRunning(true);
    setOverallProgress(0);

    try {
      // Reset all migrations to pending
      setMigrations(prev => prev.map(m => ({ ...m, status: 'pending' as const, result: undefined })));

      const migrationFunctions = [
        { name: 'User Settings Migration', fn: DataMigrationService.migrateUserSettings },
        { name: 'Idea Relationships Migration', fn: DataMigrationService.migrateIdeaRelationships },
        { name: 'User Onboarding Initialization', fn: DataMigrationService.initializeUserOnboarding }
      ];

      for (let i = 0; i < migrationFunctions.length; i++) {
        const migration = migrationFunctions[i];
        
        // Update status to running
        setMigrations(prev => prev.map(m => 
          m.name === migration.name 
            ? { ...m, status: 'running' as const }
            : m
        ));

        try {
          const result = await migration.fn();
          
          // Update status to completed or failed
          setMigrations(prev => prev.map(m => 
            m.name === migration.name 
              ? { 
                  ...m, 
                  status: result.success ? 'completed' as const : 'failed' as const,
                  result 
                }
              : m
          ));

          if (result.success) {
            toast({
              title: "Migration Completed",
              description: `${migration.name}: ${result.message}`,
            });
          } else {
            toast({
              title: "Migration Failed",
              description: `${migration.name}: ${result.message}`,
              variant: "destructive"
            });
          }

        } catch (error) {
          const errorResult: MigrationResult = {
            success: false,
            message: `Unexpected error: ${error}`,
            errors: [String(error)]
          };

          setMigrations(prev => prev.map(m => 
            m.name === migration.name 
              ? { ...m, status: 'failed' as const, result: errorResult }
              : m
          ));

          toast({
            title: "Migration Error",
            description: `${migration.name} failed with unexpected error`,
            variant: "destructive"
          });
        }

        // Update progress
        setOverallProgress(((i + 1) / migrationFunctions.length) * 100);
      }

      toast({
        title: "All Migrations Completed",
        description: "Database migration process finished. Check individual results below.",
      });

    } catch {
      toast({
        title: "Migration Process Failed",
        description: "The migration process encountered an unexpected error",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runSingleMigration = async (migrationName: string) => {
    const migrationMap: Record<string, () => Promise<MigrationResult>> = {
      'User Settings Migration': DataMigrationService.migrateUserSettings,
      'Idea Relationships Migration': DataMigrationService.migrateIdeaRelationships,
      'User Onboarding Initialization': DataMigrationService.initializeUserOnboarding
    };

    const migrationFn = migrationMap[migrationName];
    if (!migrationFn) return;

    // Update status to running
    setMigrations(prev => prev.map(m => 
      m.name === migrationName 
        ? { ...m, status: 'running' as const, result: undefined }
        : m
    ));

    try {
      const result = await migrationFn();
      
      setMigrations(prev => prev.map(m => 
        m.name === migrationName 
          ? { 
              ...m, 
              status: result.success ? 'completed' as const : 'failed' as const,
              result 
            }
          : m
      ));

      toast({
        title: result.success ? "Migration Completed" : "Migration Failed",
        description: `${migrationName}: ${result.message}`,
        variant: result.success ? "default" : "destructive"
      });

    } catch (error) {
      const errorResult: MigrationResult = {
        success: false,
        message: `Unexpected error: ${error}`,
        errors: [String(error)]
      };

      setMigrations(prev => prev.map(m => 
        m.name === migrationName 
          ? { ...m, status: 'failed' as const, result: errorResult }
          : m
      ));

      toast({
        title: "Migration Error",
        description: `${migrationName} failed with unexpected error`,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: MigrationStatus['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusBadge = (status: MigrationStatus['status']) => {
    const variants = {
      pending: 'bg-gray-600/20 text-gray-400',
      running: 'bg-blue-600/20 text-blue-400',
      completed: 'bg-green-600/20 text-green-400',
      failed: 'bg-red-600/20 text-red-400'
    };

    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Migration Runner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-yellow-600/20 bg-yellow-600/10">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200">
              <strong>Warning:</strong> Database migrations should only be run by administrators. 
              These operations modify the database structure and data. Always backup your database before running migrations.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              onClick={runAllMigrations}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Migrations...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run All Migrations
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setMigrations(prev => prev.map(m => ({ ...m, status: 'pending' as const, result: undefined })));
                setOverallProgress(0);
              }}
              disabled={isRunning}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Overall Progress</span>
                <span className="text-white">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {migrations.map((migration, index) => (
          <Card key={index} className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(migration.status)}
                  <div>
                    <h3 className="text-white font-medium">{migration.name}</h3>
                    {migration.result && (
                      <p className="text-gray-400 text-sm mt-1">
                        {migration.result.message}
                        {migration.result.migratedCount !== undefined && (
                          <span className="ml-2 text-blue-400">
                            ({migration.result.migratedCount} items)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(migration.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSingleMigration(migration.name)}
                    disabled={isRunning || migration.status === 'running'}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Run
                  </Button>
                </div>
              </div>

              {migration.result?.errors && migration.result.errors.length > 0 && (
                <Alert className="mt-3 border-red-600/20 bg-red-600/10">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">
                    <strong>Errors:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {migration.result.errors.map((error, errorIndex) => (
                        <li key={errorIndex} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MigrationRunner;
