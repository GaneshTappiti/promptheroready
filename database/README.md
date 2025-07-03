# 🗄️ Database Structure - PromptHeroReady

This directory contains all database-related files for the PromptHeroReady application, organized for optimal maintainability and deployment.

## 📁 Directory Structure

```
database/
├── README.md                           # This file
├── deploy-simple.js                    # Simple deployment script
├── verify-simple.js                    # Database verification script
├── setup-environment.js               # Environment setup helper
├── schemas/                           # Database schema definitions
│   └── clean_schema.sql              # Production-ready schema (42 tables)
├── DEPLOYMENT_GUIDE.md               # Deployment instructions
└── MIGRATION_GUIDE.md                # Migration guide
```

## 🚀 Quick Start

### 1. Environment Setup
Ensure your `.env` file contains:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Deployment
Run the following files in your Supabase SQL Editor in this order:

1. **Complete Schema**: `schemas/complete_schema.sql`
2. **Initial Setup**: `setup/initial_setup.sql`
3. **Performance Optimizations**: `utilities/performance_optimization.sql`
4. **Real-time Chat**: `setup/realtime_chat_setup.sql`
5. **Migrations**: Run all files in `migrations/` directory in numerical order

### 3. Application Integration
The `supabase-connection-helpers.ts` file contains all necessary TypeScript helpers for:
- User management and authentication
- Application core features (Ideas, MVP Studio, etc.)
- Team collaboration
- Real-time functionality
- Admin panel operations

## 📊 Database Schema Overview

### Core Tables (42 total)
- **User Management**: user_profiles, user_onboarding_profiles, user_ai_preferences, user_subscriptions, etc.
- **Application Core**: ideas, wiki_pages, journey_entries, feedback_items, mvps, prompt_history, ai_tools, documents
- **Team Collaboration**: teams, team_members, team_tasks, team_messages, messages, team_meetings
- **Project Management**: projects, tasks, project_phases, phase_tasks
- **Business Features**: investors, funding_rounds, pitch_scripts, pitch_decks, pitch_videos
- **System & Admin**: admin_roles, system_announcements, security_audit_log, notifications

### Key Features
- ✅ Row Level Security (RLS) enabled on all user-specific tables
- ✅ Real-time subscriptions for collaborative features
- ✅ Comprehensive indexes for performance optimization
- ✅ Triggers and functions for automated data management
- ✅ Full TypeScript integration with helper functions

## 🔧 Migration Strategy

### Migration File Naming Convention
```
XXX_descriptive_name.sql
```
Where XXX is a 3-digit number (001, 002, etc.)

### Creating New Migrations
1. Create a new file in `migrations/` with the next sequential number
2. Include rollback instructions in comments
3. Test thoroughly before deployment
4. Update this README with migration details

## 🛠️ Development Workflow

### Local Development
1. Use the complete schema for local development
2. Test all features with the connection helpers
3. Verify real-time functionality works correctly

### Production Deployment
1. Run schema files in Supabase SQL Editor
2. Execute setup scripts
3. Apply migrations in order
4. Verify all RLS policies are active
5. Test application functionality

## 📝 File Descriptions

### Schemas
- `complete_schema.sql`: Full database schema with all 42 tables, indexes, RLS policies, and relationships
- `main_schema.sql`: Original schema file (kept for reference)

### Setup Files
- `initial_setup.sql`: Basic Supabase configuration and core tables
- `realtime_chat_setup.sql`: Real-time chat functionality setup
- `simple_chat_setup.sql`: Simple chat implementation

### Utilities
- `performance_optimization.sql`: Database performance improvements, indexes, and optimization functions

### Connection Helpers
- `supabase-connection-helpers.ts`: Comprehensive TypeScript helpers for all database operations

## 🔒 Security Features

- Row Level Security (RLS) enabled on all user-specific tables
- Secure authentication flow with PKCE
- Audit logging for security events
- User activity tracking
- Admin role management

## 📈 Performance Optimizations

- Strategic database indexes for fast queries
- Connection pooling configuration
- Materialized views for frequently accessed data
- Query optimization functions
- Real-time event rate limiting

## 🚨 Important Notes

1. **Always backup** your database before running migrations
2. **Test migrations** in a development environment first
3. **Follow the deployment order** specified in this README
4. **Verify RLS policies** are working correctly after deployment
5. **Monitor performance** after applying optimizations

## 🆘 Troubleshooting

### Common Issues
1. **Connection errors**: Check environment variables
2. **RLS policy errors**: Verify user authentication
3. **Migration failures**: Check for table dependencies
4. **Performance issues**: Review indexes and query patterns

### Support
- Check the main project documentation
- Review Supabase logs for detailed error messages
- Verify all environment variables are correctly set
