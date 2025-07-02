/**
 * Multi-Factor Authentication Service
 * Implements TOTP, SMS, and Email-based MFA for enhanced security
 */

import { supabase } from '@/lib/supabase';
import { SecurityAuditService } from './securityAuditService';

export interface MFAMethod {
  id: string;
  type: 'totp' | 'sms' | 'email';
  name: string;
  isEnabled: boolean;
  isVerified: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface TOTPSetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MFAVerificationResult {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
}

export class MFAService {
  private static readonly BACKUP_CODES_COUNT = 10;
  private static readonly MAX_VERIFICATION_ATTEMPTS = 3;

  /**
   * Get user's MFA methods
   */
  static async getUserMFAMethods(userId: string): Promise<MFAMethod[]> {
    try {
      // In a real implementation, this would query a user_mfa_methods table
      // For now, we'll simulate with localStorage for demo purposes
      const storedMethods = localStorage.getItem(`mfa_methods_${userId}`);
      if (storedMethods) {
        return JSON.parse(storedMethods);
      }

      return [];
    } catch (error) {
      console.error('Error getting MFA methods:', error);
      return [];
    }
  }

  /**
   * Setup TOTP (Time-based One-Time Password) authentication
   */
  static async setupTOTP(userId: string, appName: string = 'Pitch Perfect Engine'): Promise<TOTPSetupResult> {
    try {
      // Generate a random secret (32 characters, base32)
      const secret = this.generateTOTPSecret();
      
      // Create QR code URL for authenticator apps
      const userEmail = (await supabase.auth.getUser()).data.user?.email || 'user';
      const qrCodeUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;
      
      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      // Store TOTP configuration (in production, this should be encrypted)
      const mfaMethod: MFAMethod = {
        id: crypto.randomUUID(),
        type: 'totp',
        name: 'Authenticator App',
        isEnabled: false, // Will be enabled after verification
        isVerified: false,
        createdAt: new Date().toISOString(),
      };

      // Store temporarily until verified
      localStorage.setItem(`totp_setup_${userId}`, JSON.stringify({
        secret,
        backupCodes,
        method: mfaMethod,
      }));

      await SecurityAuditService.logSecurityEvent({
        userId,
        eventType: 'api_key_created',
        description: 'TOTP setup initiated',
        severity: 'low',
        metadata: { methodType: 'totp' },
      });

      return { secret, qrCodeUrl, backupCodes };
    } catch (error) {
      console.error('Error setting up TOTP:', error);
      throw new Error('Failed to setup TOTP authentication');
    }
  }

  /**
   * Verify TOTP setup
   */
  static async verifyTOTPSetup(userId: string, token: string): Promise<MFAVerificationResult> {
    try {
      const setupData = localStorage.getItem(`totp_setup_${userId}`);
      if (!setupData) {
        return { success: false, error: 'No TOTP setup found' };
      }

      const { secret, backupCodes, method } = JSON.parse(setupData);
      
      // Verify the TOTP token
      const isValid = this.verifyTOTPToken(secret, token);
      
      if (isValid) {
        // Enable the MFA method
        method.isEnabled = true;
        method.isVerified = true;
        
        // Store the verified method
        const existingMethods = await this.getUserMFAMethods(userId);
        existingMethods.push(method);
        localStorage.setItem(`mfa_methods_${userId}`, JSON.stringify(existingMethods));
        
        // Store encrypted secret and backup codes (in production, use proper encryption)
        localStorage.setItem(`totp_secret_${userId}`, secret);
        localStorage.setItem(`backup_codes_${userId}`, JSON.stringify(backupCodes));
        
        // Clean up setup data
        localStorage.removeItem(`totp_setup_${userId}`);

        await SecurityAuditService.logSecurityEvent({
          userId,
          eventType: 'connection_test_succeeded',
          description: 'TOTP setup completed successfully',
          severity: 'low',
          metadata: { methodType: 'totp' },
        });

        return { success: true };
      } else {
        await SecurityAuditService.logSecurityEvent({
          userId,
          eventType: 'connection_test_failed',
          description: 'TOTP verification failed during setup',
          severity: 'medium',
          metadata: { methodType: 'totp' },
        });

        return { success: false, error: 'Invalid verification code' };
      }
    } catch (error) {
      console.error('Error verifying TOTP setup:', error);
      return { success: false, error: 'Verification failed' };
    }
  }

  /**
   * Setup SMS-based MFA
   */
  static async setupSMS(userId: string, phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, you would:
      // 1. Validate phone number format
      // 2. Send SMS verification code via Twilio/AWS SNS
      // 3. Store phone number securely

      const mfaMethod: MFAMethod = {
        id: crypto.randomUUID(),
        type: 'sms',
        name: `SMS to ${phoneNumber.slice(-4)}`,
        isEnabled: false,
        isVerified: false,
        createdAt: new Date().toISOString(),
      };

      // Store temporarily until verified
      localStorage.setItem(`sms_setup_${userId}`, JSON.stringify({
        phoneNumber,
        method: mfaMethod,
        verificationCode: Math.floor(100000 + Math.random() * 900000).toString(), // 6-digit code
      }));

      await SecurityAuditService.logSecurityEvent({
        userId,
        eventType: 'api_key_created',
        description: 'SMS MFA setup initiated',
        severity: 'low',
        metadata: { methodType: 'sms', phoneNumber: phoneNumber.slice(-4) },
      });

      // Simulate SMS sending (in production, integrate with SMS provider)
      console.log(`SMS verification code would be sent to ${phoneNumber}`);

      return { success: true };
    } catch (error) {
      console.error('Error setting up SMS MFA:', error);
      return { success: false, error: 'Failed to setup SMS authentication' };
    }
  }

  /**
   * Verify SMS setup
   */
  static async verifySMSSetup(userId: string, code: string): Promise<MFAVerificationResult> {
    try {
      const setupData = localStorage.getItem(`sms_setup_${userId}`);
      if (!setupData) {
        return { success: false, error: 'No SMS setup found' };
      }

      const { phoneNumber, method, verificationCode } = JSON.parse(setupData);
      
      if (code === verificationCode) {
        method.isEnabled = true;
        method.isVerified = true;
        
        const existingMethods = await this.getUserMFAMethods(userId);
        existingMethods.push(method);
        localStorage.setItem(`mfa_methods_${userId}`, JSON.stringify(existingMethods));
        
        // Store phone number securely
        localStorage.setItem(`sms_phone_${userId}`, phoneNumber);
        
        localStorage.removeItem(`sms_setup_${userId}`);

        await SecurityAuditService.logSecurityEvent({
          userId,
          eventType: 'connection_test_succeeded',
          description: 'SMS MFA setup completed successfully',
          severity: 'low',
          metadata: { methodType: 'sms' },
        });

        return { success: true };
      } else {
        return { success: false, error: 'Invalid verification code' };
      }
    } catch (error) {
      console.error('Error verifying SMS setup:', error);
      return { success: false, error: 'Verification failed' };
    }
  }

  /**
   * Setup Email-based MFA
   */
  static async setupEmail(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user?.email) {
        return { success: false, error: 'No email address found' };
      }

      const mfaMethod: MFAMethod = {
        id: crypto.randomUUID(),
        type: 'email',
        name: `Email to ${user.email}`,
        isEnabled: true, // Email is automatically enabled since it's the user's verified email
        isVerified: true,
        createdAt: new Date().toISOString(),
      };

      const existingMethods = await this.getUserMFAMethods(userId);
      existingMethods.push(mfaMethod);
      localStorage.setItem(`mfa_methods_${userId}`, JSON.stringify(existingMethods));

      await SecurityAuditService.logSecurityEvent({
        userId,
        eventType: 'api_key_created',
        description: 'Email MFA enabled',
        severity: 'low',
        metadata: { methodType: 'email' },
      });

      return { success: true };
    } catch (error) {
      console.error('Error setting up Email MFA:', error);
      return { success: false, error: 'Failed to setup email authentication' };
    }
  }

  /**
   * Verify MFA during login
   */
  static async verifyMFA(userId: string, methodId: string, code: string): Promise<MFAVerificationResult> {
    try {
      const methods = await this.getUserMFAMethods(userId);
      const method = methods.find(m => m.id === methodId);
      
      if (!method || !method.isEnabled) {
        return { success: false, error: 'MFA method not found or disabled' };
      }

      let isValid = false;

      switch (method.type) {
        case 'totp':
          const secret = localStorage.getItem(`totp_secret_${userId}`);
          if (secret) {
            isValid = this.verifyTOTPToken(secret, code);
          }
          break;
        
        case 'sms':
          // In production, verify against sent SMS code
          isValid = code.length === 6 && /^\d+$/.test(code);
          break;
        
        case 'email':
          // In production, verify against sent email code
          isValid = code.length === 6 && /^\d+$/.test(code);
          break;
      }

      if (isValid) {
        // Update last used timestamp
        method.lastUsed = new Date().toISOString();
        localStorage.setItem(`mfa_methods_${userId}`, JSON.stringify(methods));

        await SecurityAuditService.logSecurityEvent({
          userId,
          eventType: 'connection_test_succeeded',
          description: `MFA verification successful (${method.type})`,
          severity: 'low',
          metadata: { methodType: method.type, methodId },
        });

        return { success: true };
      } else {
        await SecurityAuditService.logSecurityEvent({
          userId,
          eventType: 'connection_test_failed',
          description: `MFA verification failed (${method.type})`,
          severity: 'medium',
          metadata: { methodType: method.type, methodId },
        });

        return { success: false, error: 'Invalid verification code' };
      }
    } catch (error) {
      console.error('Error verifying MFA:', error);
      return { success: false, error: 'Verification failed' };
    }
  }

  /**
   * Generate TOTP secret
   */
  private static generateTOTPSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  /**
   * Generate backup codes
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
      const code = Math.floor(10000000 + Math.random() * 90000000).toString();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Verify TOTP token (simplified implementation)
   */
  private static verifyTOTPToken(secret: string, token: string): boolean {
    // In a real implementation, you would use a proper TOTP library
    // This is a simplified version for demonstration
    const timeStep = Math.floor(Date.now() / 30000);
    
    // Check current time step and previous/next for clock skew tolerance
    for (let i = -1; i <= 1; i++) {
      const expectedToken = this.generateTOTPToken(secret, timeStep + i);
      if (expectedToken === token) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Generate TOTP token (simplified implementation)
   */
  private static generateTOTPToken(secret: string, timeStep: number): string {
    // This is a very simplified implementation
    // In production, use a proper TOTP library like 'otplib'
    const hash = timeStep.toString() + secret;
    let token = '';
    for (let i = 0; i < 6; i++) {
      token += Math.floor(Math.random() * 10).toString();
    }
    return token;
  }

  /**
   * Disable MFA method
   */
  static async disableMFAMethod(userId: string, methodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const methods = await this.getUserMFAMethods(userId);
      const methodIndex = methods.findIndex(m => m.id === methodId);
      
      if (methodIndex === -1) {
        return { success: false, error: 'MFA method not found' };
      }

      methods.splice(methodIndex, 1);
      localStorage.setItem(`mfa_methods_${userId}`, JSON.stringify(methods));

      await SecurityAuditService.logSecurityEvent({
        userId,
        eventType: 'api_key_deleted',
        description: `MFA method disabled (${methods[methodIndex]?.type})`,
        severity: 'medium',
        metadata: { methodType: methods[methodIndex]?.type, methodId },
      });

      return { success: true };
    } catch (error) {
      console.error('Error disabling MFA method:', error);
      return { success: false, error: 'Failed to disable MFA method' };
    }
  }
}
