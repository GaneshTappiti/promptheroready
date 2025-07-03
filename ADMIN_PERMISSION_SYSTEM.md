# Admin Permission System

## Overview

The admin permission system provides role-based access control for administrative features in the application. It ensures that different admin roles have appropriate access to various admin functionalities.

## Admin Roles

### Super Admin (`super_admin`)
- **Full system access** with all permissions
- Can access all admin pages and features
- Can manage other admin users
- Typically reserved for system administrators

**Permissions:**
- ✅ canManageUsers
- ✅ canManagePrompts  
- ✅ canManageTools
- ✅ canViewAnalytics
- ✅ canManageSettings
- ✅ canManageRoles
- ✅ canViewAuditLogs

### Regular Admin (`admin`)
- **Limited administrative access**
- Can manage content and tools but not system settings
- Cannot access user analytics or system configuration

**Permissions:**
- ❌ canManageUsers
- ✅ canManagePrompts
- ✅ canManageTools  
- ❌ canViewAnalytics
- ❌ canManageSettings
- ❌ canManageRoles
- ❌ canViewAuditLogs

## Route Protection

### Protected Routes and Required Permissions

| Route | Required Permission | Super Admin Only | Access Level |
|-------|-------------------|------------------|--------------|
| `/admin` | None | No | All admins |
| `/admin/users` | `canViewAnalytics` | Yes | Super admin only |
| `/admin/subscriptions` | `canViewAnalytics` | No | Super admin only* |
| `/admin/prompts` | `canManagePrompts` | No | All admins |
| `/admin/tools` | `canManageTools` | No | All admins |
| `/admin/settings` | `canManageSettings` | Yes | Super admin only |
| `/admin/roles` | `canManageRoles` | Yes | Super admin only |

*Note: Subscriptions require `canViewAnalytics` which regular admins don't have.

## Implementation Details

### 1. Route-Level Protection
Routes are protected using the `ProtectedAdminRoute` component:

```tsx
<Route path="users" element={
  <ProtectedAdminRoute requiredPermission="canViewAnalytics" superAdminOnly>
    <UserAnalytics />
  </ProtectedAdminRoute>
} />
```

### 2. Navigation Filtering
The admin navigation automatically filters menu items based on permissions:

```tsx
const filteredNavItems = navigationItems.filter(item => {
  if (item.superAdminOnly && !isSuperAdmin) return false;
  if (item.permission && !checkPermission(item.permission)) return false;
  return true;
});
```

### 3. Permission Context
The `AdminContext` provides:
- Current admin user information
- Role-based permissions
- Permission checking functions
- Admin status validation

## Testing the Permission System

### 1. Automated Testing
Visit `/admin-permission-test` to run comprehensive permission tests:
- Tests all role/route combinations
- Validates permission logic
- Generates detailed test reports

### 2. Manual Testing Steps

#### Test Regular Admin Access:
1. Create a user with `admin` role in `user_profiles` table
2. Login as that user
3. Navigate to `/admin` - should work
4. Try accessing `/admin/users` - should be denied
5. Try accessing `/admin/settings` - should be denied
6. Access `/admin/prompts` - should work
7. Access `/admin/tools` - should work

#### Test Super Admin Access:
1. Create a user with `super_admin` role
2. Login as that user  
3. All admin routes should be accessible

#### Test Non-Admin Access:
1. Login as regular user (role: `user`)
2. Try accessing any `/admin/*` route - should be denied
3. Should redirect to workspace with error message

### 3. Database Setup for Testing

```sql
-- Create test admin user
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'your-user-id';

-- Create test super admin user  
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE id = 'your-user-id';

-- Reset to regular user
UPDATE user_profiles 
SET role = 'user' 
WHERE id = 'your-user-id';
```

## Security Features

### 1. Multiple Protection Layers
- Route-level protection prevents direct URL access
- Navigation filtering hides unauthorized menu items
- Database-level RLS policies protect data access
- Permission checks in individual components

### 2. Graceful Degradation
- Users see appropriate error messages
- Automatic redirects to authorized areas
- No broken UI states for unauthorized access

### 3. Audit Trail
- Admin actions are logged in `security_audit_log`
- User activity tracking in `user_activity`
- Permission changes are recorded

## Troubleshooting

### Common Issues

1. **Admin can access restricted pages**
   - Check if `ProtectedAdminRoute` is properly configured
   - Verify permission requirements match role capabilities
   - Ensure navigation filtering is working

2. **Permission checks not working**
   - Verify user has correct role in `user_profiles` table
   - Check `AdminContext` is properly initialized
   - Confirm permission logic in `getPermissionsForRole()`

3. **Navigation items not filtering**
   - Check `superAdminOnly` and `permission` properties
   - Verify `filteredNavItems` logic in `AdminLayout`
   - Ensure `useAdmin` hook is working correctly

### Debug Tools

1. **Browser Console**
   ```javascript
   // Check current admin status
   console.log(window.adminPermissionTest);
   
   // Run permission tests
   window.adminPermissionTest.runTests();
   
   // Generate test report
   console.log(window.adminPermissionTest.generateReport());
   ```

2. **Permission Test Page**
   - Visit `/admin-permission-test`
   - View current user permissions
   - Run comprehensive test suite
   - Check route access matrix

## Best Practices

1. **Always use route protection** for sensitive admin pages
2. **Filter navigation** to prevent confusion
3. **Provide clear error messages** for denied access
4. **Test permission changes** thoroughly
5. **Document permission requirements** for new features
6. **Use principle of least privilege** when assigning roles

## Future Enhancements

1. **Granular Permissions**: More specific permissions for fine-grained control
2. **Time-based Access**: Temporary admin access with expiration
3. **IP Restrictions**: Limit admin access to specific IP ranges
4. **Two-Factor Authentication**: Additional security for admin accounts
5. **Permission Templates**: Predefined permission sets for common roles
