// =====================================================
// DATABASE TEST PANEL COMPONENT
// =====================================================
// React component for running and displaying database integration tests

import React, { useState, useEffect } from 'react';
import { databaseTester } from '@/utils/database-test';
import { QueryOptimizationService } from '@/services/queryOptimizationService';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  duration?: number;
  details?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

interface TestResults {
  suites: TestSuite[];
  overall: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    duration: number;
  };
}

const DatabaseTestPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());

  // Auto-run tests on component mount in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      runTests();
    }
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    try {
      // Use cached query optimization for database tests
      const testResults = await QueryOptimizationService.getCachedSchemaQuery(
        'database_test_results',
        () => databaseTester.runAllTests(),
        5 * 60 * 1000 // Cache for 5 minutes
      );
      setResults(testResults);

      // Auto-expand failed suites
      const failedSuites = testResults.suites
        .filter(suite => suite.summary.failed > 0)
        .map(suite => suite.name);
      setExpandedSuites(new Set(failedSuites));
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleSuite = (suiteName: string) => {
    const newExpanded = new Set(expandedSuites);
    if (newExpanded.has(suiteName)) {
      newExpanded.delete(suiteName);
    } else {
      newExpanded.add(suiteName);
    }
    setExpandedSuites(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'warning': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600';
      case 'fail': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getSuiteStatusColor = (suite: TestSuite) => {
    if (suite.summary.failed > 0) return 'border-red-200 bg-red-50';
    if (suite.summary.warnings > 0) return 'border-yellow-200 bg-yellow-50';
    return 'border-green-200 bg-green-50';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Database Integration Tests</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive testing of Supabase integration and database functionality
            </p>
          </div>
          <button
            onClick={runTests}
            disabled={isRunning}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isRunning
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRunning ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Running Tests...</span>
              </div>
            ) : (
              'Run Tests'
            )}
          </button>
        </div>
      </div>

      {/* Overall Results */}
      {results && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{results.overall.total}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{results.overall.passed}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{results.overall.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{results.overall.warnings}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {results.overall.duration.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex text-sm text-gray-600 mb-1">
              <span>Test Progress</span>
              <span className="ml-auto">
                {results.overall.passed}/{results.overall.total} passed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(results.overall.passed / results.overall.total) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Test Suites */}
      {results && (
        <div className="space-y-4">
          {results.suites.map((suite) => (
            <div
              key={suite.name}
              className={`bg-white rounded-lg shadow-sm border-2 transition-colors ${getSuiteStatusColor(suite)}`}
            >
              {/* Suite Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleSuite(suite.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {expandedSuites.has(suite.name) ? '📂' : '📁'}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">{suite.name}</h3>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-green-600">✅ {suite.summary.passed}</span>
                    {suite.summary.failed > 0 && (
                      <span className="text-red-600">❌ {suite.summary.failed}</span>
                    )}
                    {suite.summary.warnings > 0 && (
                      <span className="text-yellow-600">⚠️ {suite.summary.warnings}</span>
                    )}
                    <span className="text-gray-500">
                      {expandedSuites.has(suite.name) ? '▼' : '▶'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Suite Details */}
              {expandedSuites.has(suite.name) && (
                <div className="border-t border-gray-200 p-4">
                  <div className="space-y-3">
                    {suite.tests.map((test, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 bg-white rounded border border-gray-100"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg">{getStatusIcon(test.status)}</span>
                          <div>
                            <div className="font-medium text-gray-900">{test.name}</div>
                            <div className={`text-sm ${getStatusColor(test.status)}`}>
                              {test.message}
                            </div>
                            {test.details && (
                              <details className="mt-2">
                                <summary className="text-xs text-gray-500 cursor-pointer">
                                  Show details
                                </summary>
                                <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-auto">
                                  {JSON.stringify(test.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                        {test.duration && (
                          <div className="text-xs text-gray-500">
                            {test.duration.toFixed(2)}ms
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Results State */}
      {!results && !isRunning && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🧪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Results</h3>
          <p className="text-gray-600 mb-4">
            Click "Run Tests" to start comprehensive database integration testing.
          </p>
          <button
            onClick={runTests}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Run Tests Now
          </button>
        </div>
      )}

      {/* Development Notice */}
      {import.meta.env.DEV && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">ℹ️</span>
            <div className="text-sm text-blue-800">
              <strong>Development Mode:</strong> Tests run automatically on component mount.
              This panel is only visible in development mode.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseTestPanel;
