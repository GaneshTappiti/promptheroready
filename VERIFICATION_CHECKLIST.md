# 🔍 Real-time Chat Verification Checklist

Use this checklist to ensure your real-time chat implementation is working correctly.

## ✅ Pre-Setup Verification

### Environment Variables
- [ ] `.env` file exists in project root
- [ ] `VITE_SUPABASE_URL` is set correctly
- [ ] `VITE_SUPABASE_KEY` is set correctly
- [ ] Environment variables are loaded (restart dev server if needed)

### Dependencies
- [ ] `@supabase/supabase-js` is installed
- [ ] All UI components are available
- [ ] TypeScript compilation passes without errors

## 🗄️ Database Setup

### 1. Run SQL Setup Script
- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Copy and paste content from `setup-realtime-chat.sql`
- [ ] Execute the script
- [ ] Verify no errors in the output
- [ ] Check that success messages appear

### 2. Verify Table Creation
- [ ] Go to Database → Tables
- [ ] Confirm `messages` table exists
- [ ] Check table structure matches expected schema:
  ```
  - id (bigint, primary key)
  - username (varchar, not null)
  - text (text, not null)
  - country (varchar, nullable)
  - is_authenticated (boolean, default false)
  - timestamp (timestamp, default now())
  ```

### 3. Enable Realtime (CRITICAL)
- [ ] Go to Database → Replication
- [ ] Find the `messages` table in the list
- [ ] Toggle "Enable Realtime" to ON
- [ ] Verify the toggle shows as enabled

### 4. Check RLS Policies
- [ ] Go to Authentication → Policies
- [ ] Verify policies exist for `messages` table:
  - [ ] "Anyone can read messages" (SELECT)
  - [ ] "Anyone can insert messages" (INSERT)
  - [ ] "Users can update their own messages" (UPDATE)
  - [ ] "Users can delete their own messages" (DELETE)

## 🧪 Application Testing

### 1. Start Development Server
```bash
npm run dev
```

### 2. Navigate to Chat
- [ ] Go to TeamSpace page
- [ ] Click on Messages tab
- [ ] Verify you see the chat interface

### 3. Use Debug Panel
- [ ] Click on "Debug" tab in Messages
- [ ] Click "Run Tests" button
- [ ] Verify all tests pass:
  - [ ] Supabase Connection ✅
  - [ ] Messages Table ✅
  - [ ] Insert Message ✅
  - [ ] Realtime Subscription ✅
  - [ ] Authentication ✅

### 4. Test Basic Chat Functionality
- [ ] Type a message and send it
- [ ] Verify message appears in chat
- [ ] Check that timestamp is displayed
- [ ] Verify country flag appears (if geolocation works)

### 5. Test Real-time Features
- [ ] Open chat in two browser windows/tabs
- [ ] Send message from one window
- [ ] Verify message appears instantly in other window
- [ ] Test with different usernames

### 6. Test UI Features
- [ ] Scroll up to load more messages
- [ ] Test auto-scroll to bottom
- [ ] Verify unread message counter works
- [ ] Test responsive design on mobile

## 🔧 Troubleshooting

### If Tests Fail:

#### Supabase Connection Fails
- [ ] Check environment variables
- [ ] Verify Supabase project URL and API key
- [ ] Check network connectivity
- [ ] Verify Supabase project is active

#### Messages Table Access Fails
- [ ] Confirm table exists in database
- [ ] Check RLS policies are set correctly
- [ ] Verify API key has correct permissions

#### Insert Message Fails
- [ ] Check RLS policies allow INSERT
- [ ] Verify table schema is correct
- [ ] Check for any database constraints

#### Realtime Subscription Fails
- [ ] Ensure Realtime is enabled for messages table
- [ ] Check if table is in supabase_realtime publication
- [ ] Verify WebSocket connections are allowed

#### Authentication Issues
- [ ] Check if user is properly authenticated
- [ ] Verify auth configuration in Supabase
- [ ] Test both authenticated and anonymous modes

### Common Issues:

1. **Messages not appearing in real-time**
   - Most common cause: Realtime not enabled for table
   - Solution: Go to Database → Replication → Enable Realtime

2. **Country flags not showing**
   - This is normal if geolocation API fails
   - Falls back to timezone-based detection

3. **TypeScript errors**
   - Run `npm run build` to check for compilation errors
   - Ensure all imports are correct

4. **Environment variables not loading**
   - Restart development server after changing .env
   - Check file is named exactly `.env` (not `.env.local`)

## 🎯 Success Criteria

Your implementation is working correctly if:

- [ ] All debug tests pass
- [ ] Messages send and appear instantly
- [ ] Real-time updates work across multiple browser tabs
- [ ] UI is responsive and user-friendly
- [ ] No console errors appear
- [ ] Country flags and authentication badges display correctly

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Review Supabase dashboard for any alerts
3. Verify all checklist items above
4. Test with the debug panel
5. Check network tab for failed requests

## 🚀 Next Steps

Once verification is complete:

- [ ] Test with multiple users
- [ ] Consider adding team-specific chat rooms
- [ ] Implement additional features (file upload, reactions, etc.)
- [ ] Set up monitoring and analytics
- [ ] Deploy to production environment

---

**Note**: This checklist ensures your real-time chat is production-ready and follows best practices for Supabase integration.
