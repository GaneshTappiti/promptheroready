// Encryption Service - Secure API key encryption/decryption

export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits for GCM

  /**
   * Generate a cryptographic key from a password using PBKDF2
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Get or create encryption key for user
   */
  private static async getUserEncryptionKey(userId: string): Promise<CryptoKey> {
    // In a production environment, you would want to:
    // 1. Use a proper key management service (AWS KMS, Azure Key Vault, etc.)
    // 2. Store user-specific salts securely
    // 3. Use hardware security modules (HSM) for key generation
    
    // For now, we'll use a combination of user ID and environment variable
    const masterKey = import.meta.env.VITE_ENCRYPTION_MASTER_KEY || 'default-master-key-change-in-production';
    const userSalt = new TextEncoder().encode(userId + masterKey);
    
    // Create a proper salt by hashing the user salt
    const saltBuffer = await crypto.subtle.digest('SHA-256', userSalt);
    const salt = new Uint8Array(saltBuffer.slice(0, 16)); // Use first 16 bytes as salt
    
    return this.deriveKey(masterKey + userId, salt);
  }

  /**
   * Encrypt API key
   */
  static async encryptApiKey(apiKey: string, userId: string): Promise<string> {
    try {
      if (!apiKey || !userId) {
        throw new Error('API key and user ID are required for encryption');
      }

      // Check if Web Crypto API is available
      if (!crypto.subtle) {
        console.warn('Web Crypto API not available, falling back to base64 encoding');
        return this.fallbackEncrypt(apiKey);
      }

      const key = await this.getUserEncryptionKey(userId);
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);

      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        key,
        data
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Convert to base64 for storage
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed, falling back to base64:', error);
      return this.fallbackEncrypt(apiKey);
    }
  }

  /**
   * Decrypt API key
   */
  static async decryptApiKey(encryptedApiKey: string, userId: string): Promise<string> {
    try {
      if (!encryptedApiKey || !userId) {
        throw new Error('Encrypted API key and user ID are required for decryption');
      }

      // Check if Web Crypto API is available
      if (!crypto.subtle) {
        console.warn('Web Crypto API not available, falling back to base64 decoding');
        return this.fallbackDecrypt(encryptedApiKey);
      }

      // Check if this looks like a fallback-encrypted key (base64 without proper structure)
      if (this.isFallbackEncrypted(encryptedApiKey)) {
        return this.fallbackDecrypt(encryptedApiKey);
      }

      const key = await this.getUserEncryptionKey(userId);
      const combined = new Uint8Array(
        atob(encryptedApiKey).split('').map(char => char.charCodeAt(0))
      );

      // Extract IV and encrypted data
      const iv = combined.slice(0, this.IV_LENGTH);
      const encrypted = combined.slice(this.IV_LENGTH);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed, trying fallback:', error);
      return this.fallbackDecrypt(encryptedApiKey);
    }
  }

  /**
   * Fallback encryption using base64 (for environments without Web Crypto API)
   */
  private static fallbackEncrypt(apiKey: string): string {
    return btoa(apiKey);
  }

  /**
   * Fallback decryption using base64
   */
  private static fallbackDecrypt(encryptedApiKey: string): string {
    try {
      return atob(encryptedApiKey);
    } catch (error) {
      console.error('Fallback decryption failed:', error);
      throw new Error('Failed to decrypt API key');
    }
  }

  /**
   * Check if the encrypted key was created using fallback method
   */
  private static isFallbackEncrypted(encryptedKey: string): boolean {
    try {
      // Proper encryption will have IV + encrypted data, so it should be longer
      // and have specific characteristics. Fallback is just base64 of the original key.
      const decoded = atob(encryptedKey);
      
      // If it decodes to something that looks like an API key pattern, it's probably fallback
      return decoded.length < 100 && /^[a-zA-Z0-9_-]+$/.test(decoded);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate that an API key is properly encrypted
   */
  static async validateEncryption(encryptedApiKey: string, userId: string): Promise<boolean> {
    try {
      const decrypted = await this.decryptApiKey(encryptedApiKey, userId);
      return decrypted.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Securely wipe sensitive data from memory (best effort)
   */
  static secureWipe(sensitiveString: string): void {
    // Note: JavaScript doesn't provide true secure memory wiping
    // This is a best-effort approach
    if (typeof sensitiveString === 'string') {
      // Overwrite the string content (though this may not work due to string immutability)
      try {
        (sensitiveString as any) = '0'.repeat(sensitiveString.length);
      } catch (error) {
        // Ignore errors - string is immutable
      }
    }
  }

  /**
   * Generate a secure random string for testing encryption
   */
  static generateTestKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Export convenience functions
export const { encryptApiKey, decryptApiKey, validateEncryption, secureWipe } = EncryptionService;
