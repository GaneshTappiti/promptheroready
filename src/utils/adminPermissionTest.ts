/**
 * Admin Permission Testing Utility
 * This utility helps test and validate admin permission system
 */

import { AdminRole, AdminPermissions } from '@/contexts/AdminContext';

export interface AdminTestCase {
  role: AdminRole;
  expectedPermissions: AdminPermissions;
  allowedRoutes: string[];
  deniedRoutes: string[];
}

export const adminTestCases: AdminTestCase[] = [
  {
    role: 'super_admin',
    expectedPermissions: {
      canManageUsers: true,
      canManagePrompts: true,
      canManageTools: true,
      canViewAnalytics: true,
      canManageSettings: true,
      canManageRoles: true,
      canViewAuditLogs: true,
    },
    allowedRoutes: [
      '/admin',
      '/admin/users',
      '/admin/subscriptions',
      '/admin/prompts',
      '/admin/tools',
      '/admin/settings',
      '/admin/roles',
    ],
    deniedRoutes: [],
  },
  {
    role: 'admin',
    expectedPermissions: {
      canManageUsers: false,
      canManagePrompts: true,
      canManageTools: true,
      canViewAnalytics: false,
      canManageSettings: false,
      canManageRoles: false,
      canViewAuditLogs: false,
    },
    allowedRoutes: [
      '/admin',
      '/admin/prompts',
      '/admin/tools',
    ],
    deniedRoutes: [
      '/admin/users',
      '/admin/subscriptions',
      '/admin/settings',
      '/admin/roles',
    ],
  },
  {
    role: null,
    expectedPermissions: {
      canManageUsers: false,
      canManagePrompts: false,
      canManageTools: false,
      canViewAnalytics: false,
      canManageSettings: false,
      canManageRoles: false,
      canViewAuditLogs: false,
    },
    allowedRoutes: [],
    deniedRoutes: [
      '/admin',
      '/admin/users',
      '/admin/subscriptions',
      '/admin/prompts',
      '/admin/tools',
      '/admin/settings',
      '/admin/roles',
    ],
  },
];

export interface RoutePermissionMap {
  route: string;
  requiredPermission?: keyof AdminPermissions;
  superAdminOnly?: boolean;
}

export const routePermissions: RoutePermissionMap[] = [
  { route: '/admin', requiredPermission: undefined, superAdminOnly: false },
  { route: '/admin/users', requiredPermission: 'canViewAnalytics', superAdminOnly: true },
  { route: '/admin/subscriptions', requiredPermission: 'canViewAnalytics', superAdminOnly: false },
  { route: '/admin/prompts', requiredPermission: 'canManagePrompts', superAdminOnly: false },
  { route: '/admin/tools', requiredPermission: 'canManageTools', superAdminOnly: false },
  { route: '/admin/settings', requiredPermission: 'canManageSettings', superAdminOnly: true },
  { route: '/admin/roles', requiredPermission: 'canManageRoles', superAdminOnly: true },
];

/**
 * Test if a user with given role and permissions can access a route
 */
export function canAccessRoute(
  role: AdminRole,
  permissions: AdminPermissions,
  route: string
): boolean {
  // Non-admin users can't access any admin routes
  if (!role || (role !== 'admin' && role !== 'super_admin')) {
    return false;
  }

  const routeConfig = routePermissions.find(r => r.route === route);
  if (!routeConfig) {
    return false; // Unknown route
  }

  // Check if super admin is required
  if (routeConfig.superAdminOnly && role !== 'super_admin') {
    return false;
  }

  // Check specific permission if required
  if (routeConfig.requiredPermission && !permissions[routeConfig.requiredPermission]) {
    return false;
  }

  return true;
}

/**
 * Run comprehensive permission tests
 */
export function runPermissionTests(): { passed: number; failed: number; results: any[] } {
  const results: any[] = [];
  let passed = 0;
  let failed = 0;

  adminTestCases.forEach(testCase => {
    const { role, expectedPermissions, allowedRoutes, deniedRoutes } = testCase;

    // Test allowed routes
    allowedRoutes.forEach(route => {
      const canAccess = canAccessRoute(role, expectedPermissions, route);
      const result = {
        role,
        route,
        expected: true,
        actual: canAccess,
        passed: canAccess === true,
      };
      results.push(result);
      if (result.passed) passed++;
      else failed++;
    });

    // Test denied routes
    deniedRoutes.forEach(route => {
      const canAccess = canAccessRoute(role, expectedPermissions, route);
      const result = {
        role,
        route,
        expected: false,
        actual: canAccess,
        passed: canAccess === false,
      };
      results.push(result);
      if (result.passed) passed++;
      else failed++;
    });
  });

  return { passed, failed, results };
}

/**
 * Generate test report
 */
export function generateTestReport(): string {
  const { passed, failed, results } = runPermissionTests();
  
  let report = `\n=== Admin Permission Test Report ===\n`;
  report += `Total Tests: ${passed + failed}\n`;
  report += `Passed: ${passed}\n`;
  report += `Failed: ${failed}\n`;
  report += `Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n\n`;

  if (failed > 0) {
    report += `Failed Tests:\n`;
    results
      .filter(r => !r.passed)
      .forEach(r => {
        report += `- ${r.role || 'non-admin'} accessing ${r.route}: expected ${r.expected}, got ${r.actual}\n`;
      });
  }

  report += `\n=== Route Permission Configuration ===\n`;
  routePermissions.forEach(rp => {
    report += `${rp.route}:\n`;
    report += `  - Required Permission: ${rp.requiredPermission || 'none'}\n`;
    report += `  - Super Admin Only: ${rp.superAdminOnly}\n`;
  });

  return report;
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).adminPermissionTest = {
    runTests: runPermissionTests,
    generateReport: generateTestReport,
    canAccessRoute,
    testCases: adminTestCases,
    routePermissions,
  };
}
