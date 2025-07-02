// Security Audit Service Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecurityAuditService } from '@/services/securityAuditService';

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
};

Object.defineProperty(global, 'console', {
  value: mockConsole,
  writable: true
});

describe('SecurityAuditService', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateApiKeyFormat', () => {
    it('should validate OpenAI API key format', () => {
      const validKey = 'sk-1234567890abcdef1234567890abcdef1234567890abcdef';
      const result = SecurityAuditService.validateApiKeyFormat('openai', validKey);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn about invalid OpenAI key format', () => {
      const invalidKey = 'invalid-key';
      const result = SecurityAuditService.validateApiKeyFormat('openai', invalidKey);
      
      expect(result.valid).toBe(false);
      expect(result.warnings).toContain('OpenAI API keys typically start with "sk-"');
      expect(result.warnings).toContain('OpenAI API keys are typically longer');
    });

    it('should validate Claude API key format', () => {
      const validKey = 'sk-ant-1234567890abcdef1234567890abcdef1234567890abcdef';
      const result = SecurityAuditService.validateApiKeyFormat('claude', validKey);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn about invalid Claude key format', () => {
      const invalidKey = 'sk-1234567890abcdef';
      const result = SecurityAuditService.validateApiKeyFormat('claude', invalidKey);
      
      expect(result.warnings).toContain('Claude API keys typically start with "sk-ant-"');
    });

    it('should validate Gemini API key format', () => {
      const validKey = 'AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI';
      const result = SecurityAuditService.validateApiKeyFormat('gemini', validKey);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn about short Gemini keys', () => {
      const shortKey = 'short-key';
      const result = SecurityAuditService.validateApiKeyFormat('gemini', shortKey);
      
      expect(result.warnings).toContain('Gemini API keys are typically longer');
    });

    it('should detect placeholder keys', () => {
      const placeholderKey = 'your_api_key_here';
      const result = SecurityAuditService.validateApiKeyFormat('openai', placeholderKey);
      
      expect(result.valid).toBe(false);
      expect(result.warnings).toContain('API key appears to be a placeholder');
    });

    it('should detect keys with spaces', () => {
      const keyWithSpaces = 'sk-123 456 789';
      const result = SecurityAuditService.validateApiKeyFormat('openai', keyWithSpaces);
      
      expect(result.valid).toBe(false);
      expect(result.warnings).toContain('API key contains spaces');
    });

    it('should handle empty or very short keys', () => {
      const emptyKey = '';
      const result = SecurityAuditService.validateApiKeyFormat('openai', emptyKey);
      
      expect(result.valid).toBe(false);
      expect(result.warnings).toContain('API key appears to be too short');
    });
  });

  describe('auditProviderConfig', () => {
    it('should detect insecure HTTP endpoints', () => {
      const config = {
        customEndpoint: 'http://insecure-endpoint.com/api'
      };
      
      const issues = SecurityAuditService.auditProviderConfig(config);
      
      expect(issues).toContain('Custom endpoint should use HTTPS');
    });

    it('should detect localhost endpoints', () => {
      const config = {
        customEndpoint: 'https://localhost:3000/api'
      };
      
      const issues = SecurityAuditService.auditProviderConfig(config);
      
      expect(issues).toContain('Custom endpoint points to localhost - ensure this is intentional');
    });

    it('should detect debug mode enabled', () => {
      const config = {
        providerSettings: {
          debug: true
        }
      };
      
      const issues = SecurityAuditService.auditProviderConfig(config);
      
      expect(issues).toContain('Debug mode is enabled - disable in production');
    });

    it('should detect request logging enabled', () => {
      const config = {
        providerSettings: {
          logRequests: true
        }
      };
      
      const issues = SecurityAuditService.auditProviderConfig(config);
      
      expect(issues).toContain('Request logging is enabled - may expose sensitive data');
    });

    it('should return no issues for secure config', () => {
      const config = {
        customEndpoint: 'https://secure-endpoint.com/api',
        providerSettings: {
          debug: false,
          logRequests: false
        }
      };
      
      const issues = SecurityAuditService.auditProviderConfig(config);
      
      expect(issues).toHaveLength(0);
    });
  });

  describe('logging methods', () => {
    it('should log API key creation', async () => {
      await SecurityAuditService.logApiKeyCreated(testUserId, 'openai');
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY AUDIT] MEDIUM: API key created for provider: openai'),
        expect.objectContaining({
          userId: testUserId,
          eventType: 'api_key_created'
        })
      );
    });

    it('should log API key update', async () => {
      await SecurityAuditService.logApiKeyUpdated(testUserId, 'gemini');
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY AUDIT] MEDIUM: API key updated for provider: gemini'),
        expect.objectContaining({
          userId: testUserId,
          eventType: 'api_key_updated'
        })
      );
    });

    it('should log API key deletion', async () => {
      await SecurityAuditService.logApiKeyDeleted(testUserId, 'claude');
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY AUDIT] LOW: API key deleted for provider: claude'),
        expect.objectContaining({
          userId: testUserId,
          eventType: 'api_key_deleted'
        })
      );
    });

    it('should log connection test failure', async () => {
      const error = 'Invalid API key';
      await SecurityAuditService.logConnectionTestFailed(testUserId, 'openai', error);
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY AUDIT] LOW: Connection test failed for provider: openai'),
        expect.objectContaining({
          userId: testUserId,
          eventType: 'connection_test_failed',
          metadata: expect.objectContaining({
            provider: 'openai',
            error: 'Invalid API key'
          })
        })
      );
    });

    it('should log encryption failure', async () => {
      const error = 'Encryption algorithm not supported';
      await SecurityAuditService.logEncryptionFailed(testUserId, error);
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY AUDIT] HIGH: API key encryption failed'),
        expect.objectContaining({
          userId: testUserId,
          eventType: 'encryption_failed'
        })
      );
    });

    it('should log decryption failure', async () => {
      const error = 'Invalid encryption key';
      await SecurityAuditService.logDecryptionFailed(testUserId, error);
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY AUDIT] HIGH: API key decryption failed'),
        expect.objectContaining({
          userId: testUserId,
          eventType: 'decryption_failed'
        })
      );
    });

    it('should log suspicious activity', async () => {
      const description = 'Multiple failed login attempts';
      const metadata = { attempts: 5, timeframe: '5 minutes' };
      
      await SecurityAuditService.logSuspiciousActivity(testUserId, description, metadata);
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY AUDIT] CRITICAL: Multiple failed login attempts'),
        expect.objectContaining({
          userId: testUserId,
          eventType: 'suspicious_activity',
          metadata
        })
      );
    });

    it('should handle logging errors gracefully', async () => {
      // Mock console.log to throw an error
      mockConsole.log.mockImplementation(() => {
        throw new Error('Logging failed');
      });

      // Should not throw
      await expect(
        SecurityAuditService.logApiKeyCreated(testUserId, 'openai')
      ).resolves.not.toThrow();
    });
  });

  describe('error sanitization', () => {
    it('should sanitize API keys from error messages', () => {
      const errorWithKey = 'Authentication failed with key sk-1234567890abcdef';
      
      // Access private method for testing
      const sanitized = (SecurityAuditService as any).sanitizeError(errorWithKey);
      
      expect(sanitized).toBe('Authentication failed with key sk-***');
    });

    it('should sanitize Bearer tokens', () => {
      const errorWithToken = 'Invalid Bearer abc123def456';
      
      const sanitized = (SecurityAuditService as any).sanitizeError(errorWithToken);
      
      expect(sanitized).toBe('Invalid Bearer ***');
    });

    it('should sanitize API key parameters', () => {
      const errorWithParam = 'Request failed: api_key=sk-1234567890abcdef';
      
      const sanitized = (SecurityAuditService as any).sanitizeError(errorWithParam);
      
      expect(sanitized).toBe('Request failed: api_key=***');
    });

    it('should sanitize token parameters', () => {
      const errorWithToken = 'Authentication error: token=abc123def456';
      
      const sanitized = (SecurityAuditService as any).sanitizeError(errorWithToken);
      
      expect(sanitized).toBe('Authentication error: token=***');
    });
  });
});
