# Real-time Features Testing Guide

## Overview

This guide covers comprehensive testing of all real-time features and WebSocket connections in the application. The system uses Supabase real-time subscriptions for live collaboration features.

## Real-time Features

### 1. **Global Chat** 💬
- **Location**: Workspace, TeamSpace
- **Function**: Public messaging for all users
- **Technology**: Supabase real-time subscriptions
- **Table**: `messages`
- **Features**:
  - Live message updates
  - User authentication status
  - Country/location display
  - Message history with pagination
  - Scroll-to-bottom functionality

### 2. **Team Chat** 👥
- **Location**: TeamSpace → Messages tab
- **Function**: Private team messaging
- **Technology**: Filtered real-time subscriptions
- **Table**: `team_messages`
- **Features**:
  - Team-specific message filtering
  - Member-only access
  - Message threading
  - File sharing capabilities
  - Team member avatars

### 3. **Presence Tracking** 🟢
- **Location**: Team collaboration areas
- **Function**: Show who's online
- **Technology**: Supabase presence API
- **Features**:
  - Real-time online/offline status
  - User activity tracking
  - Last seen timestamps
  - Active user indicators

### 4. **Typing Indicators** ⌨️
- **Location**: Chat interfaces
- **Function**: Show when users are typing
- **Technology**: Broadcast channels
- **Features**:
  - Real-time typing status
  - User-specific indicators
  - Auto-timeout for stale indicators
  - Multiple user support

### 5. **Live Task Updates** ✅
- **Location**: TaskPlanner, TeamSpace
- **Function**: Real-time task status changes
- **Technology**: Database change subscriptions
- **Table**: `tasks`, `team_tasks`
- **Features**:
  - Status change notifications
  - Assignment updates
  - Progress tracking
  - Collaborative task management

### 6. **Live Notifications** 🔔
- **Location**: Throughout application
- **Function**: Real-time user notifications
- **Technology**: Database subscriptions
- **Table**: `notifications`
- **Features**:
  - Instant notification delivery
  - Read/unread status
  - Notification categories
  - Auto-dismissal

## Testing Procedures

### 1. **Automated Testing**

#### Access the Test Suite
```
Navigate to: http://localhost:8081/realtime-test
```

#### Test Categories
- **Connection Tests**: Basic WebSocket connectivity
- **Messaging Tests**: Global and team messaging
- **Presence Tests**: Online status tracking
- **Collaboration Tests**: Multi-user scenarios
- **Performance Tests**: Concurrent connections

#### Running Tests
1. Ensure you're logged in
2. Click "Run All Real-time Tests"
3. Monitor progress and connection status
4. Review detailed test results

### 2. **Manual Testing**

#### Test Global Chat
1. Navigate to **Workspace**
2. Scroll down to find the global chat
3. Send a test message
4. Open another browser/incognito window
5. Login as different user
6. Verify message appears in real-time

#### Test Team Chat
1. Go to **TeamSpace** → **Messages**
2. Send a team message
3. Invite another user to team
4. Verify team-specific messaging works
5. Check message filtering by team

#### Test Presence Tracking
1. Open **TeamSpace** in multiple browsers
2. Login as different team members
3. Verify online status indicators
4. Test presence sync across sessions

#### Test Typing Indicators
1. Start typing in team chat
2. Verify typing indicator appears for other users
3. Stop typing and verify indicator disappears
4. Test multiple users typing simultaneously

### 3. **Live Testing**

#### Real-time Message Stream
```javascript
// Test live message subscription
const channel = supabase
  .channel('live_test')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

#### Connection Monitoring
```javascript
// Monitor connection status
channel.subscribe((status) => {
  console.log('Connection status:', status);
  // SUBSCRIBED = connected
  // CHANNEL_ERROR = failed
  // CLOSED = disconnected
});
```

## Performance Testing

### 1. **Connection Limits**
- Test maximum concurrent connections
- Monitor memory usage
- Check for connection leaks
- Verify cleanup on disconnect

### 2. **Message Throughput**
- Test high-frequency messaging
- Monitor latency and delivery time
- Check message ordering
- Verify no message loss

### 3. **Scalability Testing**
```javascript
// Test multiple concurrent channels
const channels = [];
for (let i = 0; i < 10; i++) {
  const channel = supabase.channel(`test_${i}`);
  channels.push(channel);
  channel.subscribe();
}
```

## Database Configuration

### Real-time Publication Setup
```sql
-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE team_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE team_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE user_activity;
```

### Row Level Security
```sql
-- Ensure RLS policies allow real-time access
-- Global messages (public read)
CREATE POLICY "Anyone can read messages" ON messages FOR SELECT USING (true);

-- Team messages (team members only)
CREATE POLICY "Team members can read team messages" ON team_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_messages.team_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);
```

## Common Issues & Solutions

### 1. **Connection Issues**
**Problem**: WebSocket connection fails
**Solutions**:
- Check Supabase project settings
- Verify real-time is enabled
- Check network/firewall settings
- Validate authentication tokens

### 2. **Message Delivery Issues**
**Problem**: Messages not appearing in real-time
**Solutions**:
- Verify table is in real-time publication
- Check RLS policies
- Confirm subscription filters
- Test database triggers

### 3. **Performance Issues**
**Problem**: Slow or delayed updates
**Solutions**:
- Optimize database queries
- Reduce subscription scope
- Implement message batching
- Check server resources

### 4. **Memory Leaks**
**Problem**: Increasing memory usage
**Solutions**:
- Properly cleanup channels
- Remove event listeners
- Unsubscribe on component unmount
- Monitor active connections

## Monitoring & Debugging

### Browser DevTools
```javascript
// Check active channels
console.log('Active channels:', supabase.getChannels());

// Monitor connection events
channel.on('system', {}, (payload) => {
  console.log('System event:', payload);
});

// Debug subscription status
channel.subscribe((status) => {
  console.log('Subscription status:', status);
});
```

### Network Monitoring
- Monitor WebSocket connections in Network tab
- Check for connection drops/reconnects
- Verify message payload sizes
- Track connection timing

### Database Monitoring
```sql
-- Check real-time publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Monitor active connections
SELECT * FROM pg_stat_activity WHERE application_name LIKE '%realtime%';

-- Check table activity
SELECT schemaname, tablename, n_tup_ins, n_tup_upd 
FROM pg_stat_user_tables 
WHERE tablename IN ('messages', 'team_messages', 'notifications');
```

## Best Practices

### 1. **Connection Management**
- Always cleanup channels on unmount
- Use connection pooling for multiple subscriptions
- Implement reconnection logic
- Monitor connection health

### 2. **Message Handling**
- Validate message structure
- Implement message deduplication
- Handle out-of-order messages
- Use message acknowledgments

### 3. **Performance Optimization**
- Limit subscription scope with filters
- Batch multiple updates
- Use efficient data structures
- Implement message pagination

### 4. **Error Handling**
- Graceful degradation on connection loss
- User-friendly error messages
- Automatic retry mechanisms
- Fallback to polling if needed

## Testing Checklist

### Pre-Testing
- [ ] Supabase real-time enabled
- [ ] Database tables in publication
- [ ] RLS policies configured
- [ ] Test users created

### Connection Tests
- [ ] Basic WebSocket connection
- [ ] Multiple concurrent connections
- [ ] Connection cleanup
- [ ] Reconnection handling

### Messaging Tests
- [ ] Global message delivery
- [ ] Team message filtering
- [ ] Message ordering
- [ ] Message persistence

### Collaboration Tests
- [ ] Presence tracking
- [ ] Typing indicators
- [ ] Multi-user scenarios
- [ ] Conflict resolution

### Performance Tests
- [ ] High-frequency messaging
- [ ] Large message payloads
- [ ] Memory usage monitoring
- [ ] Connection limits

## Troubleshooting Commands

```javascript
// Test real-time connection
await window.realtimeTest.runTests('user-id', 'team-id');

// Check connection status
const status = supabase.realtime.connection.connectionState;
console.log('Connection state:', status);

// Monitor channel events
channel.on('system', {}, (payload) => {
  console.log('Channel event:', payload);
});

// Test message subscription
const testChannel = supabase
  .channel('debug_test')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, 
    (payload) => console.log('Message event:', payload))
  .subscribe();
```

## Security Considerations

### 1. **Authentication**
- Verify user authentication for all subscriptions
- Implement proper session management
- Use secure token validation

### 2. **Authorization**
- Enforce team-based access controls
- Validate user permissions for channels
- Implement rate limiting

### 3. **Data Protection**
- Sanitize message content
- Prevent XSS in real-time messages
- Encrypt sensitive data

### 4. **Abuse Prevention**
- Implement message rate limiting
- Monitor for spam/abuse
- Provide user blocking features
