# API Key Testing Guide

This guide explains how to verify that your user-provided API keys are working properly throughout the application.

## Overview

The application relies entirely on user-provided API keys for AI functionality. This testing system ensures that:

1. ✅ API keys are properly formatted
2. ✅ API keys are securely stored and encrypted
3. ✅ API keys can successfully connect to the provider
4. ✅ API keys can generate AI responses
5. ✅ The entire application workflow functions correctly

## Testing Methods

### 1. Web Interface (Recommended)

Navigate to `/api-key-test` in your application to access the comprehensive testing interface.

**Features:**
- Visual test results with detailed breakdowns
- Real-time progress indicators
- Troubleshooting recommendations
- Quick access to API key management

**Steps:**
1. Log into your application
2. Go to the API Key Test page (available in the sidebar)
3. Click "Run API Key Test"
4. Review the detailed results

### 2. Browser Console Testing

Open your browser's developer console and use the built-in testing functions:

```javascript
// Test current user's configured API key
testAPIKey()

// Test a specific API key without saving it
testSpecificAPIKey('openai', 'sk-your-api-key-here')

// Run full application health check
healthCheck()
```

### 3. Component Integration

Use the `APIKeyTester` component in your React application:

```tsx
import { APIKeyTester } from '@/components/APIKeyTester';

function MyPage() {
  return (
    <div>
      <APIKeyTester />
    </div>
  );
}
```

## What Gets Tested

### 1. API Key Format Validation
- **OpenAI**: Must start with `sk-` and be at least 40 characters
- **Google Gemini**: Must be at least 30 characters, no spaces
- **Anthropic Claude**: Must start with `sk-ant-` and be at least 40 characters
- **DeepSeek**: Must start with `sk-` and be at least 40 characters
- **Mistral**: Must be at least 30 characters, no spaces
- **Custom**: Must be at least 10 characters

### 2. Storage & Encryption
- Verifies API key can be saved to the database
- Confirms encryption is working properly
- Tests retrieval and decryption

### 3. Provider Connection
- Makes a test connection to the AI provider
- Verifies API key has proper permissions
- Checks for quota/rate limiting issues

### 4. AI Response Generation
- Sends a test prompt to the AI provider
- Verifies the response is received correctly
- Measures response time

## Common Issues & Solutions

### ❌ Invalid API Key Format
**Problem**: API key doesn't match expected format
**Solution**: 
- Check you copied the full API key
- Verify you're using the correct provider
- Get a new API key from the provider's dashboard

### ❌ Connection Failed
**Problem**: Can't connect to the AI provider
**Solutions**:
- Check your internet connection
- Verify the API key is active
- Ensure your account has sufficient credits
- Check if the provider is experiencing outages

### ❌ Quota Exceeded
**Problem**: API key has reached usage limits
**Solutions**:
- Check your provider's usage dashboard
- Upgrade your plan if needed
- Wait for quota reset (usually monthly)

### ❌ Permission Denied
**Problem**: API key doesn't have required permissions
**Solutions**:
- Regenerate your API key
- Check your account settings with the provider
- Ensure your account is in good standing

## Provider-Specific Setup

### OpenAI (ChatGPT)
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)
4. Add billing information if required

### Google Gemini
1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key
4. Note: Has generous free tier

### Anthropic Claude
1. Go to [console.anthropic.com/account/keys](https://console.anthropic.com/account/keys)
2. Create a new API key
3. Copy the key (starts with `sk-ant-`)
4. Add billing information

### DeepSeek
1. Go to [platform.deepseek.com/api-keys](https://platform.deepseek.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)
4. Very cost-effective option

## Troubleshooting Commands

### Check Application Health
```javascript
healthCheck()
```

### Test Without Saving
```javascript
testSpecificAPIKey('openai', 'sk-test-key-here')
```

### View Current Configuration
```javascript
// In browser console
console.log('Current user:', await supabase.auth.getUser())
```

## Security Notes

- ✅ API keys are encrypted before storage
- ✅ Keys are never logged in plain text
- ✅ Test connections use minimal data
- ✅ Failed tests don't expose key details
- ✅ All communication uses HTTPS

## Support

If you continue to experience issues:

1. Check the troubleshooting section in the app
2. Review your provider's documentation
3. Contact support with test results
4. Include error messages and provider type

## Development Notes

For developers working on this system:

- Test utilities are in `src/utils/apiKeyValidationTest.ts`
- React components are in `src/components/APIKeyTester.tsx`
- Console functions are in `src/scripts/testAPIKey.ts`
- Main test page is at `src/pages/APIKeyTestPage.tsx`

The testing system is designed to be comprehensive yet user-friendly, providing clear feedback on what's working and what needs attention.
