# Admin Panel Documentation

## Overview

The PromptHeroReady Admin Panel is a comprehensive administrative interface that provides role-based access control and management capabilities for the platform. It features a green glassy UI design that matches the main application aesthetic.

## Features

### 🔐 Role-Based Access Control
- **Super Admin**: Full system access including user analytics, role management, and platform settings
- **Admin**: Limited access to prompt templates and AI tools directory management

### 📊 Admin Dashboard
- High-level platform metrics and statistics
- User engagement analytics (aggregated, privacy-safe)
- System health monitoring
- Quick action buttons for common tasks

### 👥 User Analytics (Super Admin Only)
- Total users, active users, and subscription breakdowns
- Conversion funnel analysis (Idea → IdeaForge → MVP Studio)
- Usage patterns and feature adoption metrics
- Geographic distribution and device analytics
- **Privacy Protection**: No access to individual user ideas or personal data

### 💰 Subscription Analytics
- Monthly Recurring Revenue (MRR) and Annual Recurring Revenue (ARR)
- Plan breakdown and conversion rates
- Churn analysis and customer lifetime value
- Revenue by country with export functionality

### 📝 Prompt Templates Manager
- Create, edit, and manage system-wide prompt templates
- Categorization and tagging system
- Template publishing workflow (Draft → Published → Archived)
- Rich text editor with markdown support
- Template duplication and version control

### 🛠️ AI Tools Directory Editor
- Curate AI tools shown in IdeaForge recommendations
- Pricing information in INR
- Platform and input type categorization
- Verification status tracking
- Recommendation flags for featured tools

### ⚙️ Platform Settings (Super Admin Only)
- API rate limits and feature toggles
- System-wide configuration management
- Public/private setting visibility
- Real-time settings updates

### 👑 Role Management (Super Admin Only)
- Add/remove admin users by email
- Role assignment and permission management
- Admin activity audit logging
- Account activation/deactivation

## Getting Started

### 1. Database Setup

First, ensure your Supabase database has the required tables. The schema includes:

```sql
-- Admin Users Table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Prompt Templates Table
CREATE TABLE prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[],
    use_case TEXT,
    output_type TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Tools Directory Table
CREATE TABLE ai_tools_directory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    url TEXT,
    pricing_model TEXT,
    pricing_inr TEXT,
    is_recommended BOOLEAN DEFAULT false,
    supported_platforms TEXT[],
    input_types TEXT[],
    tags TEXT[],
    last_verified_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Platform Settings Table
CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin Audit Log Table
CREATE TABLE admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Admin Setup

#### Option A: Using the Demo Setup (Recommended for Testing)

1. Navigate to `/admin-setup` in your application
2. Sign in with your user account
3. Click "Setup Super Admin + Demo Data" to create admin access and sample data
4. Refresh the page to see the "Admin Panel" link in the sidebar

#### Option B: Manual Database Setup

1. Insert a record into the `admin_users` table:
```sql
INSERT INTO admin_users (user_id, role, is_active, created_by)
VALUES ('your-user-id', 'super_admin', true, 'your-user-id');
```

### 3. Accessing the Admin Panel

1. Sign in to your account
2. Look for the "Admin Panel" link in the sidebar (only visible to admin users)
3. Navigate to `/admin` to access the dashboard

## Navigation Structure

```
/admin                    - Dashboard Overview
/admin/users             - User Analytics (Super Admin only)
/admin/subscriptions     - Subscription Analytics
/admin/prompts           - Prompt Templates Manager
/admin/tools             - AI Tools Directory Editor
/admin/settings          - Platform Settings (Super Admin only)
/admin/roles             - Role Management (Super Admin only)
```

## Privacy & Security

### User Privacy Protection
- **No Access to User Ideas**: Admins cannot view individual user startup ideas or personal content
- **Aggregated Analytics Only**: All user metrics are presented in aggregate form
- **Anonymized Data**: Personal identifiers are removed from analytics views
- **Audit Logging**: All admin actions are logged for accountability

### Security Features
- **Role-Based Permissions**: Granular permission system based on admin roles
- **Session Management**: Secure authentication with automatic session refresh
- **Input Validation**: All forms include proper validation and sanitization
- **CSRF Protection**: Built-in protection against cross-site request forgery

## UI Design

The admin panel follows the application's green glassy design system:

- **Background**: Consistent green gradient background (`bg-green-glass`)
- **Cards**: Glass effect with backdrop blur (`workspace-card` class)
- **Colors**: Green accent colors for primary actions and highlights
- **Typography**: Clean, readable fonts with proper contrast
- **Responsive**: Mobile-friendly design with collapsible sidebar

## Development

### Adding New Admin Features

1. **Create the Page Component**:
```tsx
// src/pages/admin/NewFeature.tsx
import { withAdminAuth } from '@/contexts/AdminContext';

const NewFeature = () => {
  // Component implementation
};

export default withAdminAuth(NewFeature, 'requiredPermission');
```

2. **Add Route**:
```tsx
// In src/App.tsx
<Route path="new-feature" element={<NewFeature />} />
```

3. **Update Navigation**:
```tsx
// In src/components/admin/AdminLayout.tsx
{
  name: 'New Feature',
  href: '/admin/new-feature',
  icon: IconComponent,
  permission: 'requiredPermission' as const,
}
```

### Permission System

The admin context provides these permissions:
- `canManageUsers`: User management capabilities
- `canManagePrompts`: Prompt template management
- `canManageTools`: AI tools directory management
- `canViewAnalytics`: Access to analytics and metrics
- `canManageSettings`: Platform settings management
- `canManageRoles`: Role and permission management
- `canViewAuditLogs`: Access to audit logs

## Troubleshooting

### Common Issues

1. **Admin Panel Link Not Visible**
   - Ensure user has admin role in `admin_users` table
   - Refresh the page after adding admin role
   - Check browser console for authentication errors

2. **Permission Denied Errors**
   - Verify user role matches required permissions
   - Check if admin account is active (`is_active = true`)
   - Ensure proper role assignment (admin vs super_admin)

3. **Database Connection Issues**
   - Verify Supabase configuration in `.env`
   - Check database table existence and structure
   - Ensure proper RLS (Row Level Security) policies

### Support

For additional support or feature requests, please refer to the main application documentation or contact the development team.

## Future Enhancements

- **Advanced Analytics**: More detailed user behavior analysis
- **Bulk Operations**: Mass updates for templates and tools
- **API Management**: Direct API key and rate limit management
- **Notification System**: Admin alerts and notifications
- **Export Features**: Enhanced data export capabilities
- **Multi-language Support**: Internationalization for admin interface
