# Supabase Manual Security Configuration Guide

## 🚨 CRITICAL: Manual Actions Required

After running the `fix-remaining-security-issues.sql` script, you must complete these manual configuration steps in your Supabase Dashboard to fully resolve all 19 security issues.

## 📋 Manual Configuration Steps

### 1. Enable HaveIBeenPwned Password Checking (HIGH PRIORITY)

**Issue**: Supabase Auth prevents the use of compromised passwords by checking against HaveIBeenPwned.org. Enable this feature to enhance security.

**Steps**:
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll down to **Security** section
4. Find **"Check for compromised passwords"** option
5. **Enable** this setting
6. Click **Save**

**Impact**: Prevents users from using passwords that have been compromised in data breaches.

### 2. Enable Additional MFA Options (HIGH PRIORITY)

**Issue**: Your project has too few MFA options enabled, which may weaken account security.

**Steps**:
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll down to **Multi-Factor Authentication** section
4. Enable the following options:
   - ✅ **TOTP (Time-based One-Time Password)**
   - ✅ **SMS Authentication** (if you have SMS provider configured)
   - ✅ **Email Authentication**
5. Configure any required provider settings (e.g., Twilio for SMS)
6. Click **Save**

**Impact**: Provides users with multiple secure authentication options, significantly improving account security.

### 3. Configure Session Security Settings (MEDIUM PRIORITY)

**Recommended Steps**:
1. Go to **Authentication** → **Settings**
2. Configure **JWT Settings**:
   - Set **JWT expiry** to appropriate value (default: 3600 seconds)
   - Enable **Refresh token rotation** for enhanced security
3. Set **Session timeout** to reasonable duration
4. Configure **Password requirements**:
   - Minimum length: 8+ characters
   - Require special characters
   - Require numbers and uppercase letters

### 4. Enable Rate Limiting (MEDIUM PRIORITY)

**Steps**:
1. Go to **Authentication** → **Settings**
2. Scroll to **Rate Limiting** section
3. Configure limits for:
   - **Login attempts**: 5-10 per minute
   - **Password reset requests**: 3-5 per hour
   - **Signup attempts**: 10-20 per hour
4. Enable **CAPTCHA** for additional protection
5. Click **Save**

### 5. Additional Security Recommendations

#### Email Templates Security
1. Go to **Authentication** → **Email Templates**
2. Review and customize:
   - **Confirmation email**
   - **Password reset email**
   - **Magic link email**
3. Ensure templates don't expose sensitive information

#### Database Security
1. Go to **Settings** → **Database**
2. Review **Connection pooling** settings
3. Enable **SSL enforcement**
4. Configure **IP restrictions** if needed

#### API Security
1. Go to **Settings** → **API**
2. Review **API keys** and rotate if necessary
3. Configure **CORS settings** appropriately
4. Set up **API rate limiting**

## 🔍 Verification Steps

After completing the manual configuration:

1. **Test Authentication Flow**:
   - Try logging in with a compromised password (should be blocked)
   - Test MFA setup process
   - Verify session timeout works correctly

2. **Run Security Check**:
   ```sql
   SELECT * FROM get_security_recommendations();
   ```

3. **Monitor Security Logs**:
   ```sql
   SELECT * FROM security_audit_log 
   WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
   ORDER BY created_at DESC;
   ```

## 📊 Security Status Summary

### ✅ Automated Fixes Completed (17/19 issues)
- Fixed SECURITY DEFINER view
- Fixed 16 functions with mutable search_path
- All functions now use secure search_path settings

### ⚠️ Manual Configuration Required (2/19 issues)
- [ ] Enable HaveIBeenPwned password checking
- [ ] Enable additional MFA options

## 🛡️ Security Impact

Completing these manual steps will:
- **Prevent** users from using compromised passwords
- **Enhance** account security with multiple MFA options
- **Reduce** risk of unauthorized access
- **Improve** overall security posture
- **Comply** with security best practices

## 📞 Support

If you encounter any issues during configuration:
1. Check Supabase documentation: https://supabase.com/docs/guides/auth
2. Review your project's authentication logs
3. Contact Supabase support if needed

## ✅ Completion Checklist

- [ ] Enabled HaveIBeenPwned password checking
- [ ] Configured TOTP MFA
- [ ] Configured SMS MFA (if applicable)
- [ ] Configured Email MFA
- [ ] Set appropriate session timeouts
- [ ] Enabled rate limiting
- [ ] Tested authentication flow
- [ ] Verified security recommendations function
- [ ] Monitored security audit logs

**Once all items are checked, your Supabase project will have resolved all 19 security issues!**
