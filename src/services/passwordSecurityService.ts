/**
 * Password Security Service
 * Implements HaveIBeenPwned integration and password strength validation
 */

import { supabase } from '@/lib/supabase';
import { SecurityAuditService } from './securityAuditService';

export interface PasswordValidationResult {
  isValid: boolean;
  isCompromised: boolean;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  issues: string[];
  suggestions: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  checkHaveIBeenPwned: boolean;
  maxAge: number; // days
}

export class PasswordSecurityService {
  private static readonly DEFAULT_POLICY: PasswordPolicy = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    checkHaveIBeenPwned: true,
    maxAge: 90,
  };

  private static readonly COMMON_PASSWORDS = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    'dragon', 'master', 'shadow', 'superman', 'michael',
    'football', 'baseball', 'liverpool', 'jordan', 'princess'
  ];

  /**
   * Check if password has been compromised using HaveIBeenPwned API
   */
  static async checkHaveIBeenPwned(password: string): Promise<{ isCompromised: boolean; count: number }> {
    try {
      // Create SHA-1 hash of password
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

      // Use k-anonymity model - send only first 5 characters
      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Pitch-Perfect-Engine-Security-Check',
        },
      });

      if (!response.ok) {
        console.warn('HaveIBeenPwned API unavailable, skipping check');
        return { isCompromised: false, count: 0 };
      }

      const text = await response.text();
      const lines = text.split('\n');

      for (const line of lines) {
        const [hashSuffix, count] = line.split(':');
        if (hashSuffix === suffix) {
          return { isCompromised: true, count: parseInt(count, 10) };
        }
      }

      return { isCompromised: false, count: 0 };
    } catch (error) {
      console.error('Error checking HaveIBeenPwned:', error);
      // Fail open - don't block user if service is unavailable
      return { isCompromised: false, count: 0 };
    }
  }

  /**
   * Calculate password strength score
   */
  static calculatePasswordStrength(password: string): { score: number; strength: PasswordValidationResult['strength'] } {
    let score = 0;
    const length = password.length;

    // Length scoring
    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;
    if (length >= 20) score += 1;

    // Character variety scoring
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 1; // Sequential patterns
    if (/password|admin|login/i.test(password)) score -= 2; // Common words

    // Ensure score is within bounds
    score = Math.max(0, Math.min(8, score));

    let strength: PasswordValidationResult['strength'];
    if (score <= 2) strength = 'weak';
    else if (score <= 4) strength = 'medium';
    else if (score <= 6) strength = 'strong';
    else strength = 'very-strong';

    return { score, strength };
  }

  /**
   * Validate password against policy
   */
  static async validatePassword(
    password: string, 
    policy: Partial<PasswordPolicy> = {}
  ): Promise<PasswordValidationResult> {
    const fullPolicy = { ...this.DEFAULT_POLICY, ...policy };
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Length check
    if (password.length < fullPolicy.minLength) {
      issues.push(`Password must be at least ${fullPolicy.minLength} characters long`);
      suggestions.push(`Add ${fullPolicy.minLength - password.length} more characters`);
    }

    // Character requirements
    if (fullPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter');
      suggestions.push('Add an uppercase letter (A-Z)');
    }

    if (fullPolicy.requireLowercase && !/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter');
      suggestions.push('Add a lowercase letter (a-z)');
    }

    if (fullPolicy.requireNumbers && !/[0-9]/.test(password)) {
      issues.push('Password must contain at least one number');
      suggestions.push('Add a number (0-9)');
    }

    if (fullPolicy.requireSpecialChars && !/[^a-zA-Z0-9]/.test(password)) {
      issues.push('Password must contain at least one special character');
      suggestions.push('Add a special character (!@#$%^&*)');
    }

    // Common password check
    if (fullPolicy.preventCommonPasswords) {
      const lowerPassword = password.toLowerCase();
      if (this.COMMON_PASSWORDS.some(common => lowerPassword.includes(common))) {
        issues.push('Password contains common words or patterns');
        suggestions.push('Avoid common words like "password", "admin", or "123456"');
      }
    }

    // Calculate strength
    const { score, strength } = this.calculatePasswordStrength(password);

    // HaveIBeenPwned check
    let isCompromised = false;
    if (fullPolicy.checkHaveIBeenPwned && issues.length === 0) {
      const pwnedResult = await this.checkHaveIBeenPwned(password);
      isCompromised = pwnedResult.isCompromised;
      
      if (isCompromised) {
        issues.push(`This password has been found in ${pwnedResult.count.toLocaleString()} data breaches`);
        suggestions.push('Choose a completely different password that has never been compromised');
      }
    }

    const isValid = issues.length === 0 && !isCompromised;

    return {
      isValid,
      isCompromised,
      strength,
      score,
      issues,
      suggestions,
    };
  }

  /**
   * Enhanced sign up with password validation
   */
  static async secureSignUp(email: string, password: string, userData?: any) {
    try {
      // Validate password first
      const validation = await this.validatePassword(password);
      
      if (!validation.isValid) {
        return {
          data: null,
          error: {
            message: 'Password does not meet security requirements',
            details: validation,
          },
        };
      }

      // Log security event
      await SecurityAuditService.logSecurityEvent({
        userId: 'anonymous',
        eventType: 'api_key_created',
        description: 'User attempting secure sign up',
        severity: 'low',
        metadata: {
          email,
          passwordStrength: validation.strength,
          passwordScore: validation.score,
        },
      });

      // Proceed with Supabase sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: userData,
        },
      });

      if (error) {
        await SecurityAuditService.logSecurityEvent({
          userId: 'anonymous',
          eventType: 'connection_test_failed',
          description: `Sign up failed: ${error.message}`,
          severity: 'medium',
          metadata: { email, error: error.message },
        });
      } else {
        await SecurityAuditService.logSecurityEvent({
          userId: data.user?.id || 'unknown',
          eventType: 'connection_test_succeeded',
          description: 'User signed up successfully with secure password',
          severity: 'low',
          metadata: { email, passwordStrength: validation.strength },
        });
      }

      return { data, error };
    } catch (error) {
      console.error('Error in secure sign up:', error);
      return {
        data: null,
        error: {
          message: 'An unexpected error occurred during sign up',
          details: error,
        },
      };
    }
  }

  /**
   * Enhanced sign in with security monitoring
   */
  static async secureSignIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await SecurityAuditService.logSecurityEvent({
          userId: 'anonymous',
          eventType: 'connection_test_failed',
          description: `Sign in failed: ${error.message}`,
          severity: 'medium',
          metadata: { email, error: error.message },
        });
      } else {
        await SecurityAuditService.logSecurityEvent({
          userId: data.user?.id || 'unknown',
          eventType: 'connection_test_succeeded',
          description: 'User signed in successfully',
          severity: 'low',
          metadata: { email },
        });
      }

      return { data, error };
    } catch (error) {
      console.error('Error in secure sign in:', error);
      return {
        data: null,
        error: {
          message: 'An unexpected error occurred during sign in',
          details: error,
        },
      };
    }
  }

  /**
   * Check if user needs to update password based on age
   */
  static async checkPasswordAge(userId: string): Promise<{ needsUpdate: boolean; daysOld: number }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { needsUpdate: false, daysOld: 0 };
      }

      // In a real implementation, you'd store password creation/update dates
      // For now, we'll use the user's created_at date as a proxy
      const createdAt = new Date(user.user.created_at);
      const now = new Date();
      const daysOld = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      const needsUpdate = daysOld > this.DEFAULT_POLICY.maxAge;

      return { needsUpdate, daysOld };
    } catch (error) {
      console.error('Error checking password age:', error);
      return { needsUpdate: false, daysOld: 0 };
    }
  }
}
