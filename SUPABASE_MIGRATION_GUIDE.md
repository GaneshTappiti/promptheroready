# 🚀 PromptHeroReady - Supabase Migration Guide

This guide will help you migrate your application from local storage to Supabase database step by step.

## 📋 Prerequisites

1. **Supabase Account**: Create account at [supabase.com](https://supabase.com)
2. **Project Setup**: Create a new Supabase project
3. **Environment Variables**: Have your Supabase URL and anon key ready

## 🗄️ Step 1: Database Schema Migration

### 1.1 Run the Main Schema
```sql
-- Copy and paste the entire content of supabase-migration-schema.sql
-- into your Supabase SQL Editor and execute it
```

### 1.2 Verify Tables Created
Check that all these tables were created successfully:

**Core User & Auth Tables:**
- ✅ user_profiles
- ✅ user_onboarding_profiles
- ✅ user_ai_preferences
- ✅ user_preferences
- ✅ subscription_plans
- ✅ user_subscriptions
- ✅ usage_tracking

**Application Core Tables:**
- ✅ ideas
- ✅ wiki_pages
- ✅ journey_entries
- ✅ feedback_items
- ✅ mvps
- ✅ prompt_history
- ✅ ai_tools
- ✅ documents
- ✅ document_templates

**Team Collaboration Tables:**
- ✅ teams
- ✅ team_members
- ✅ team_tasks
- ✅ team_messages
- ✅ messages
- ✅ team_meetings

**Project Management Tables:**
- ✅ projects
- ✅ tasks
- ✅ project_phases
- ✅ phase_tasks

**Investor & Pitch Tables:**
- ✅ investors
- ✅ funding_rounds
- ✅ pitch_scripts
- ✅ pitch_decks
- ✅ pitch_videos

**System & Admin Tables:**
- ✅ admin_roles
- ✅ user_admin_roles
- ✅ system_announcements
- ✅ prompt_templates
- ✅ security_audit_log
- ✅ user_activity
- ✅ system_metrics
- ✅ ai_provider_usage
- ✅ notifications
- ✅ file_attachments

## 🔧 Step 2: Environment Configuration

### 2.1 Update .env File
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2.2 Update Supabase Client Configuration
Ensure your `src/lib/supabase.ts` file has the correct configuration:

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

## 📝 Step 3: Generate TypeScript Types

### 3.1 Install Supabase CLI
```bash
npm install -g supabase
```

### 3.2 Generate Types
```bash
# Login to Supabase
supabase login

# Generate TypeScript types
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

### 3.3 Create Database Types File
Create `src/types/database.ts` with the generated types from Supabase.

## 🔄 Step 4: Page-by-Page Migration

### 4.1 Replace Helper Functions
Copy the helper functions from `supabase-connection-helpers.ts` into your existing helper files or create new ones.

### 4.2 Update Each Page Component

#### Workspace Page
```typescript
import { workspaceHelpers } from '@/lib/supabase-helpers'

// Replace local storage calls with:
const { activeIdeas, totalPrompts, subscription } = await workspaceHelpers.getDashboardStats(user.id)
```

#### Idea Vault Page
```typescript
import { ideaVaultHelpers } from '@/lib/supabase-helpers'

// Replace local storage calls with:
const { data: ideas } = await ideaVaultHelpers.getIdeas(user.id, filters)
```

#### IdeaForge Page
```typescript
import { ideaForgeHelpers } from '@/lib/supabase-helpers'

// Replace local storage calls with:
const { idea, wiki, journey, feedback } = await ideaForgeHelpers.getIdeaWithDetails(ideaId)
```

#### MVP Studio Page
```typescript
import { mvpStudioHelpers } from '@/lib/supabase-helpers'

// Replace local storage calls with:
const { data: mvps } = await mvpStudioHelpers.getMVPs(user.id)
const { data: promptHistory } = await mvpStudioHelpers.getPromptHistory(ideaId)
```

#### Team Space Page
```typescript
import { teamSpaceHelpers } from '@/lib/supabase-helpers'

// Replace local storage calls with:
const { data: team } = await teamSpaceHelpers.getOrCreateTeam(user.id, user.email)
const { data: messages } = await teamSpaceHelpers.getTeamMessages(teamId)
```

#### Investor Radar Page
```typescript
import { investorRadarHelpers } from '@/lib/supabase-helpers'

// Replace local storage calls with:
const { data: investors } = await investorRadarHelpers.getInvestors(user.id, filters)
const { data: fundingRounds } = await investorRadarHelpers.getFundingRounds(user.id)
```

#### Pitch Perfect Page
```typescript
import { pitchPerfectHelpers } from '@/lib/supabase-helpers'

// Replace local storage calls with:
const { data: scripts } = await pitchPerfectHelpers.getPitchScripts(user.id)
const { data: decks } = await pitchPerfectHelpers.getPitchDecks(user.id)
const { data: videos } = await pitchPerfectHelpers.getPitchVideos(user.id)
```

#### Task Planner Page
```typescript
import { taskPlannerHelpers } from '@/lib/supabase-helpers'

// Replace local storage calls with:
const { data: projects } = await taskPlannerHelpers.getProjects(user.id)
const { data: tasks } = await taskPlannerHelpers.getTasks(user.id, filters)
```

#### Blueprint Zone Page
```typescript
import { blueprintZoneHelpers } from '@/lib/supabase-helpers'

// Replace local storage calls with:
const { data: phases } = await blueprintZoneHelpers.getProjectPhases(user.id, projectId)
const { data: phaseTasks } = await blueprintZoneHelpers.getPhaseTasks(phaseId)
```

#### Workshop Page
```typescript
import { workshopHelpers } from '@/lib/supabase-helpers'

// Replace local storage calls with:
const { data: validatedIdea } = await workshopHelpers.validateAndSaveIdea(ideaData, validationResults, user.id)
const { data: history } = await workshopHelpers.getValidationHistory(user.id)
```

#### AI Provider Dashboard
```typescript
import { aiProviderHelpers } from '@/lib/supabase-helpers'

// Replace local storage calls with:
const { data: usageStats } = await aiProviderHelpers.getAIUsageStats(user.id, 'month')
const { data: providerUsage } = await aiProviderHelpers.getUsageByProvider(user.id)
```

## 🔐 Step 5: Authentication Setup

### 5.1 Configure Auth Providers
In your Supabase dashboard, go to Authentication > Providers and configure:
- Email/Password (enabled by default)
- Google OAuth (optional)
- GitHub OAuth (optional)

### 5.2 Update Auth Context
Your existing auth context should work with minimal changes. Ensure it uses the Supabase client.

### 5.3 Set Up Email Templates
Configure email templates in Supabase Dashboard > Authentication > Email Templates

## 🔒 Step 6: Row Level Security (RLS) Testing

### 6.1 Test User Isolation
1. Create test users
2. Verify users can only see their own data
3. Test team collaboration features

### 6.2 Test Admin Access
1. Create admin user
2. Assign admin role
3. Test admin panel access

## 📊 Step 7: Real-time Features Setup

### 7.1 Enable Realtime
The schema already enables realtime for:
- team_messages
- messages  
- team_tasks
- user_activity

### 7.2 Test Real-time Chat
1. Open team space in multiple browser tabs
2. Send messages and verify real-time updates
3. Test global chat functionality

## 🎯 Step 8: Data Migration (Optional)

If you have existing local data to migrate:

### 8.1 Export Local Data
```typescript
// Create migration script to export existing localStorage data
const exportLocalData = () => {
  const ideas = JSON.parse(localStorage.getItem('ideaforge_ideas') || '[]')
  const prompts = JSON.parse(localStorage.getItem('prompt_history') || '[]')
  // Export other data...
  
  return { ideas, prompts, /* other data */ }
}
```

### 8.2 Import to Supabase
```typescript
// Create import script using the helper functions
const importData = async (localData) => {
  for (const idea of localData.ideas) {
    await ideaVaultHelpers.createIdea({
      ...idea,
      user_id: currentUser.id
    })
  }
  // Import other data...
}
```

## 🧪 Step 9: Testing Checklist

### 9.1 Core Functionality
- [ ] User registration/login
- [ ] Profile management
- [ ] Idea creation/editing
- [ ] IdeaForge features (wiki, journey, feedback)
- [ ] MVP Studio prompt generation
- [ ] Team collaboration
- [ ] Real-time chat
- [ ] Document management
- [ ] Subscription management

### 9.2 Security Testing
- [ ] RLS policies working
- [ ] Users can't access other users' data
- [ ] Admin features restricted to admins
- [ ] API key encryption working

### 9.3 Performance Testing
- [ ] Page load times acceptable
- [ ] Real-time updates working smoothly
- [ ] Database queries optimized

## 🚀 Step 10: Production Deployment

### 10.1 Environment Setup
1. Set up production Supabase project
2. Configure production environment variables
3. Set up database backups

### 10.2 Monitoring Setup
1. Enable Supabase monitoring
2. Set up error tracking
3. Configure performance monitoring

## 🔧 Troubleshooting

### Common Issues

#### RLS Policy Errors
```sql
-- If you get RLS errors, check policies:
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';
```

#### Real-time Not Working
1. Check if realtime is enabled for tables
2. Verify channel subscriptions
3. Check browser console for errors

#### Performance Issues
1. Check if indexes are created
2. Analyze slow queries
3. Consider query optimization

### Getting Help
- Supabase Documentation: https://supabase.com/docs
- Community Discord: https://discord.supabase.com
- GitHub Issues: Create issues for specific problems

## 📈 Next Steps

After successful migration:
1. Monitor application performance
2. Set up automated backups
3. Implement additional security measures
4. Consider adding more real-time features
5. Optimize database queries based on usage patterns

---

**🎉 Congratulations!** Your PromptHeroReady application is now fully connected to Supabase with a robust, scalable database backend.
