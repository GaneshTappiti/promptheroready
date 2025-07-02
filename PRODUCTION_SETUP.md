# Production Setup Guide

This guide will help you deploy PromptHeroReady (Pitch Perfect Engine) to production.

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Domain name (optional but recommended)

## 1. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required environment variables in `.env`:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_ENCRYPTION_KEY`: Generate a secure 32+ character key
   - `VITE_DATABASE_URL`: Your database connection string

## 2. Database Setup

1. Create a new Supabase project at https://supabase.com
2. Run the database schema from `schema.sql`
3. Set up Row Level Security (RLS) policies
4. Configure authentication providers if needed

## 3. AI Provider Setup (Optional)

Configure API keys for the AI services you want to use:
- OpenAI: `VITE_OPENAI_API_KEY`
- Google Gemini: `VITE_GEMINI_API_KEY`
- Claude: `VITE_CLAUDE_API_KEY`

## 4. Build for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

## 5. Deployment Options

### Option A: Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Option B: Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Option C: Self-hosted
1. Build the application: `npm run build`
2. Serve the `dist` folder with a web server
3. Configure HTTPS and domain

## 6. Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Verify database connections
- [ ] Test AI provider integrations
- [ ] Check all features work without sample data
- [ ] Set up monitoring and analytics
- [ ] Configure backup strategies
- [ ] Test performance under load

## 7. Security Considerations

- Use HTTPS in production
- Rotate encryption keys regularly
- Monitor for security vulnerabilities
- Set up proper CORS policies
- Enable Supabase security features

## 8. Monitoring

Consider setting up:
- Error tracking (Sentry)
- Performance monitoring
- User analytics
- Database monitoring
- Uptime monitoring

## Support

For deployment issues, check:
1. Environment variables are correctly set
2. Database schema is properly applied
3. All required services are accessible
4. Build process completes without errors

The application is now ready for production use with no placeholder data!
