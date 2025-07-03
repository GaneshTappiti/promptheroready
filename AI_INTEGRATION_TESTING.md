# AI Integration Testing Guide

## Overview

This guide covers comprehensive testing of all AI-powered features in the application. The system supports multiple AI providers and includes various AI-driven functionalities.

## Supported AI Providers

### 1. **OpenAI** 
- **Models**: GPT-4, GPT-3.5-turbo
- **Features**: Text generation, conversation, code generation
- **Setup**: Requires OpenAI API key
- **Cost**: Pay-per-use (tokens)

### 2. **Google Gemini**
- **Models**: Gemini-2.0-flash, Gemini-Pro
- **Features**: Text generation, multimodal capabilities
- **Setup**: Requires Google AI API key
- **Cost**: Free tier available, then pay-per-use

### 3. **Anthropic Claude**
- **Models**: Claude-3-Sonnet, Claude-3-Haiku
- **Features**: Advanced reasoning, long context
- **Setup**: Requires Anthropic API key
- **Cost**: Pay-per-use (tokens)

### 4. **DeepSeek**
- **Models**: DeepSeek-Chat, DeepSeek-Coder
- **Features**: Cost-effective, coding capabilities
- **Setup**: Requires DeepSeek API key
- **Cost**: Very low cost per token

### 5. **Mistral AI**
- **Models**: Mistral-Large, Mistral-Medium
- **Features**: European AI provider, multilingual
- **Setup**: Requires Mistral API key
- **Cost**: Competitive pricing

## AI-Powered Features

### 1. **Startup Idea Analysis** 🚀
- **Location**: Workspace, IdeaForge
- **Function**: Analyzes startup ideas and provides validation
- **AI Tasks**:
  - Intent extraction
  - Market analysis
  - Risk assessment
  - Monetization strategy
  - Feature recommendations
  - Roadmap generation

### 2. **MVP Planning** 🛠️
- **Location**: MVP Studio
- **Function**: Generates comprehensive MVP plans
- **AI Tasks**:
  - Framework generation
  - Page structure creation
  - Feature prioritization
  - Technology recommendations
  - Timeline estimation

### 3. **Presentation Generation** 📊
- **Location**: Docs & Decks
- **Function**: Creates AI-powered presentations
- **AI Tasks**:
  - Outline generation
  - Slide content creation
  - Structure optimization
  - Content adaptation

### 4. **Document Creation** 📝
- **Location**: Various components
- **Function**: Generates business documents
- **AI Tasks**:
  - Template population
  - Content generation
  - Format optimization

## Testing Procedures

### 1. **Automated Testing**

#### Access the Test Suite
```
Navigate to: http://localhost:8081/ai-integration-test
```

#### Test Categories
- **Provider Connections**: Tests API connectivity for all providers
- **Direct AI Calls**: Tests basic AI request/response functionality
- **Feature Integration**: Tests AI-powered features end-to-end
- **Error Handling**: Tests graceful failure scenarios

#### Running Tests
1. Ensure you're logged in
2. Click "Run All AI Tests"
3. Monitor progress and results
4. Review detailed test report

### 2. **Manual Testing**

#### Setup AI Provider
1. Go to **Settings** → **AI Configuration**
2. Select your preferred provider
3. Enter API key
4. Test connection
5. Save configuration

#### Test Startup Idea Analysis
1. Navigate to **Workspace**
2. Enter a startup idea: "A mobile app for local food delivery"
3. Click "Analyze with AI"
4. Verify comprehensive analysis is generated
5. Check for: validation score, market analysis, features, risks

#### Test MVP Planning
1. Go to **MVP Studio**
2. Start MVP Wizard
3. Fill in project details
4. Select AI provider
5. Generate framework
6. Verify detailed MVP plan is created

#### Test Presentation Generation
1. Navigate to **Docs & Decks**
2. Click "Create Presentation"
3. Enter topic: "AI Startup Pitch"
4. Set parameters (slides, audience, etc.)
5. Generate presentation
6. Verify slides are created with relevant content

### 3. **Performance Testing**

#### Load Testing
```javascript
// Console test for multiple concurrent requests
const testConcurrentRequests = async () => {
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(
      window.aiIntegrationTest.runTests('user-id')
    );
  }
  const results = await Promise.all(promises);
  console.log('Concurrent test results:', results);
};
```

#### Response Time Testing
- Monitor AI response times in test results
- Acceptable ranges:
  - Simple requests: < 5 seconds
  - Complex analysis: < 15 seconds
  - Presentation generation: < 30 seconds

## Environment Setup

### Development Environment
```bash
# Required environment variables
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_CLAUDE_API_KEY=your_claude_key_here
VITE_DEEPSEEK_API_KEY=your_deepseek_key_here
VITE_MISTRAL_API_KEY=your_mistral_key_here
```

### Database Configuration
```sql
-- Ensure AI preferences table exists
SELECT * FROM user_ai_preferences WHERE user_id = 'your-user-id';

-- Check AI usage tracking
SELECT * FROM ai_provider_usage WHERE user_id = 'your-user-id' ORDER BY created_at DESC LIMIT 10;
```

## Common Issues & Solutions

### 1. **API Key Issues**
**Problem**: "No API key configured" error
**Solution**: 
- Check environment variables
- Verify API key in user settings
- Test connection in AI configuration

### 2. **Rate Limiting**
**Problem**: "Rate limit exceeded" error
**Solution**:
- Implement request queuing
- Add retry logic with exponential backoff
- Monitor usage in provider dashboard

### 3. **Response Quality**
**Problem**: Poor or irrelevant AI responses
**Solution**:
- Improve system prompts
- Adjust temperature settings
- Use more specific prompts
- Try different models

### 4. **Timeout Issues**
**Problem**: Requests timing out
**Solution**:
- Increase timeout limits
- Optimize prompt length
- Use streaming responses for long content

## Monitoring & Analytics

### Key Metrics to Track
- **Response Time**: Average time for AI requests
- **Success Rate**: Percentage of successful AI calls
- **Token Usage**: Cost tracking per provider
- **Error Rate**: Failed requests by provider
- **User Satisfaction**: Quality ratings for AI responses

### Monitoring Tools
- Browser DevTools for request inspection
- Application logs for error tracking
- Provider dashboards for usage analytics
- Custom analytics in admin panel

## Best Practices

### 1. **Prompt Engineering**
- Use clear, specific prompts
- Include context and examples
- Set appropriate temperature values
- Limit response length when needed

### 2. **Error Handling**
- Implement graceful fallbacks
- Provide meaningful error messages
- Log errors for debugging
- Retry failed requests appropriately

### 3. **Cost Management**
- Monitor token usage
- Set usage limits
- Choose cost-effective providers
- Optimize prompt efficiency

### 4. **Security**
- Encrypt API keys in database
- Validate user inputs
- Implement rate limiting
- Audit AI usage

## Testing Checklist

### Pre-Testing
- [ ] Environment variables configured
- [ ] Database schema up to date
- [ ] User account with AI provider setup
- [ ] Test data prepared

### Core Functionality
- [ ] AI provider connections working
- [ ] Startup idea analysis functional
- [ ] MVP planning generates results
- [ ] Presentation creation works
- [ ] Error handling graceful

### Performance
- [ ] Response times acceptable
- [ ] Concurrent requests handled
- [ ] Memory usage reasonable
- [ ] No memory leaks detected

### User Experience
- [ ] Loading states shown
- [ ] Progress indicators working
- [ ] Error messages clear
- [ ] Results properly formatted

### Security
- [ ] API keys encrypted
- [ ] User data protected
- [ ] Rate limiting active
- [ ] Audit logging enabled

## Troubleshooting Commands

```javascript
// Test AI provider service directly
await window.aiIntegrationTest.runTests('user-id');

// Check user AI preferences
const prefs = await aiProviderService.getUserPreferences('user-id');
console.log('User AI preferences:', prefs);

// Test specific provider
const result = await aiProviderService.testConnection('user-id');
console.log('Connection test:', result);

// Generate test response
const response = await aiProviderService.generateResponse('user-id', {
  prompt: 'Test prompt',
  temperature: 0.7,
  maxTokens: 100
});
console.log('AI response:', response);
```
