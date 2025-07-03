// Security Audit Service - Monitor and audit security-related activities

export interface SecurityEvent {
  id?: string;
  userId: string;
  eventType: SecurityEventType;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export type SecurityEventType = 
  | 'api_key_created'
  | 'api_key_updated'
  | 'api_key_deleted'
  | 'api_key_accessed'
  | 'connection_test_failed'
  | 'connection_test_succeeded'
  | 'encryption_failed'
  | 'decryption_failed'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'invalid_provider_config';

export class SecurityAuditService {
  /**
   * Log a security event
   */
  static async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const securityEvent: SecurityEvent = {
        ...event,
        timestamp: new Date().toISOString(),
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent
      };

      // In a production environment, you would:
      // 1. Send to a dedicated security logging service
      // 2. Use a separate database for audit logs
      // 3. Implement log rotation and retention policies
      // 4. Set up real-time alerting for critical events

      console.log('Security Event:', securityEvent);

      // For now, we'll store in a simple format
      // In production, create a proper security_audit_log table
      await this.storeSecurityEvent(securityEvent);
    } catch (error) {
      console.error('Failed to log security event:', error);
      // Don't throw - logging failures shouldn't break the main flow
    }
  }

  /**
   * Log API key creation
   */
  static async logApiKeyCreated(userId: string, provider: string): Promise<void> {
    await this.logSecurityEvent({
      userId,
      eventType: 'api_key_created',
      description: `API key created for provider: ${provider}`,
      metadata: { provider },
      severity: 'medium'
    });
  }

  /**
   * Log API key update
   */
  static async logApiKeyUpdated(userId: string, provider: string): Promise<void> {
    await this.logSecurityEvent({
      userId,
      eventType: 'api_key_updated',
      description: `API key updated for provider: ${provider}`,
      metadata: { provider },
      severity: 'medium'
    });
  }

  /**
   * Log API key deletion
   */
  static async logApiKeyDeleted(userId: string, provider: string): Promise<void> {
    await this.logSecurityEvent({
      userId,
      eventType: 'api_key_deleted',
      description: `API key deleted for provider: ${provider}`,
      metadata: { provider },
      severity: 'low'
    });
  }

  /**
   * Log connection test failure
   */
  static async logConnectionTestFailed(
    userId: string, 
    provider: string, 
    error: string
  ): Promise<void> {
    await this.logSecurityEvent({
      userId,
      eventType: 'connection_test_failed',
      description: `Connection test failed for provider: ${provider}`,
      metadata: { provider, error: this.sanitizeError(error) },
      severity: 'low'
    });
  }

  /**
   * Log encryption failure
   */
  static async logEncryptionFailed(userId: string, error: string): Promise<void> {
    await this.logSecurityEvent({
      userId,
      eventType: 'encryption_failed',
      description: 'API key encryption failed',
      metadata: { error: this.sanitizeError(error) },
      severity: 'high'
    });
  }

  /**
   * Log decryption failure
   */
  static async logDecryptionFailed(userId: string, error: string): Promise<void> {
    await this.logSecurityEvent({
      userId,
      eventType: 'decryption_failed',
      description: 'API key decryption failed',
      metadata: { error: this.sanitizeError(error) },
      severity: 'high'
    });
  }

  /**
   * Log suspicious activity
   */
  static async logSuspiciousActivity(
    userId: string, 
    description: string, 
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logSecurityEvent({
      userId,
      eventType: 'suspicious_activity',
      description,
      metadata,
      severity: 'critical'
    });
  }

  /**
   * Validate API key format for common providers
   */
  static validateApiKeyFormat(provider: string, apiKey: string): {
    valid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let valid = true;

    // Basic validation
    if (!apiKey || apiKey.length < 10) {
      valid = false;
      warnings.push('API key appears to be too short');
    }

    // Provider-specific validation
    switch (provider) {
      case 'openai':
        if (!apiKey.startsWith('sk-')) {
          warnings.push('OpenAI API keys typically start with "sk-"');
        }
        if (apiKey.length < 40) {
          warnings.push('OpenAI API keys are typically longer');
        }
        break;

      case 'gemini':
        if (apiKey.length < 30) {
          warnings.push('Gemini API keys are typically longer');
        }
        break;

      case 'claude':
        if (!apiKey.startsWith('sk-ant-')) {
          warnings.push('Claude API keys typically start with "sk-ant-"');
        }
        break;

      case 'deepseek':
        if (apiKey.length < 30) {
          warnings.push('DeepSeek API keys are typically longer');
        }
        break;
    }

    // Check for common mistakes
    if (apiKey.includes(' ')) {
      valid = false;
      warnings.push('API key contains spaces');
    }

    if (apiKey.toLowerCase().includes('your_api_key') || 
        apiKey.toLowerCase().includes('placeholder')) {
      valid = false;
      warnings.push('API key appears to be a placeholder');
    }

    return { valid, warnings };
  }

  /**
   * Check for potential security issues in configuration
   */
  static auditProviderConfig(config: any): string[] {
    const issues: string[] = [];

    // Check for insecure custom endpoints
    if (config.customEndpoint) {
      if (!config.customEndpoint.startsWith('https://')) {
        issues.push('Custom endpoint should use HTTPS');
      }
      
      if (config.customEndpoint.includes('localhost') || 
          config.customEndpoint.includes('127.0.0.1')) {
        issues.push('Custom endpoint points to localhost - ensure this is intentional');
      }
    }

    // Check for suspicious provider settings
    if (config.providerSettings) {
      if (config.providerSettings.debug === true) {
        issues.push('Debug mode is enabled - disable in production');
      }
      
      if (config.providerSettings.logRequests === true) {
        issues.push('Request logging is enabled - may expose sensitive data');
      }
    }

    return issues;
  }

  /**
   * Get client IP address (best effort)
   */
  private static async getClientIP(): Promise<string> {
    try {
      // In a real application, you'd get this from the server
      // For client-side, we can't reliably get the real IP
      return 'client-side';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Sanitize error messages to remove sensitive information
   */
  private static sanitizeError(error: string): string {
    // Remove potential API keys or sensitive data from error messages
    return error
      .replace(/sk-[a-zA-Z0-9]+/g, 'sk-***')
      .replace(/Bearer [a-zA-Z0-9]+/g, 'Bearer ***')
      .replace(/api[_-]?key[=:]\s*[a-zA-Z0-9]+/gi, 'api_key=***')
      .replace(/token[=:]\s*[a-zA-Z0-9]+/gi, 'token=***');
  }

  /**
   * Store security event (simplified implementation)
   */
  private static async storeSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // In production, create a dedicated security_audit_log table
      // For now, we'll use console logging and could extend to use Supabase
      
      // Example of what the table structure might look like:
      /*
      CREATE TABLE security_audit_log (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id),
        event_type TEXT NOT NULL,
        description TEXT NOT NULL,
        metadata JSONB,
        ip_address TEXT,
        user_agent TEXT,
        severity TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      */

      console.log(`[SECURITY AUDIT] ${event.severity.toUpperCase()}: ${event.description}`, {
        userId: event.userId,
        eventType: event.eventType,
        metadata: event.metadata
      });
    } catch (error) {
      console.error('Failed to store security event:', error);
    }
  }
}

// Export convenience functions
export const {
  logApiKeyCreated,
  logApiKeyUpdated,
  logApiKeyDeleted,
  logConnectionTestFailed,
  logEncryptionFailed,
  logDecryptionFailed,
  logSuspiciousActivity,
  validateApiKeyFormat,
  auditProviderConfig
} = SecurityAuditService;
