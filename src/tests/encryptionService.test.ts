// Encryption Service Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EncryptionService } from '@/services/encryptionService';

// Mock crypto.subtle for testing
const mockCrypto = {
  subtle: {
    importKey: vi.fn(),
    deriveKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    digest: vi.fn()
  },
  getRandomValues: vi.fn()
};

// Mock global crypto
Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true
});

describe('EncryptionService', () => {
  const testUserId = 'test-user-123';
  const testApiKey = 'sk-test-api-key-12345';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default crypto mocks
    mockCrypto.getRandomValues.mockImplementation((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    });

    mockCrypto.subtle.digest.mockResolvedValue(new ArrayBuffer(32));
    mockCrypto.subtle.importKey.mockResolvedValue({} as CryptoKey);
    mockCrypto.subtle.deriveKey.mockResolvedValue({} as CryptoKey);
    mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(32));
    mockCrypto.subtle.decrypt.mockResolvedValue(new TextEncoder().encode(testApiKey));
  });

  describe('encryptApiKey', () => {
    it('should encrypt API key successfully', async () => {
      const encrypted = await EncryptionService.encryptApiKey(testApiKey, testUserId);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
      expect(mockCrypto.subtle.encrypt).toHaveBeenCalled();
    });

    it('should handle missing API key', async () => {
      await expect(
        EncryptionService.encryptApiKey('', testUserId)
      ).rejects.toThrow('API key and user ID are required for encryption');
    });

    it('should handle missing user ID', async () => {
      await expect(
        EncryptionService.encryptApiKey(testApiKey, '')
      ).rejects.toThrow('API key and user ID are required for encryption');
    });

    it('should fallback to base64 when crypto.subtle is not available', async () => {
      // Temporarily remove crypto.subtle
      const originalSubtle = mockCrypto.subtle;
      delete (mockCrypto as any).subtle;

      const encrypted = await EncryptionService.encryptApiKey(testApiKey, testUserId);
      
      expect(encrypted).toBe(btoa(testApiKey));
      
      // Restore crypto.subtle
      mockCrypto.subtle = originalSubtle;
    });

    it('should fallback to base64 when encryption fails', async () => {
      mockCrypto.subtle.encrypt.mockRejectedValue(new Error('Encryption failed'));

      const encrypted = await EncryptionService.encryptApiKey(testApiKey, testUserId);
      
      expect(encrypted).toBe(btoa(testApiKey));
    });
  });

  describe('decryptApiKey', () => {
    it('should decrypt API key successfully', async () => {
      const decrypted = await EncryptionService.decryptApiKey('encrypted-key', testUserId);
      
      expect(decrypted).toBe(testApiKey);
      expect(mockCrypto.subtle.decrypt).toHaveBeenCalled();
    });

    it('should handle missing encrypted key', async () => {
      await expect(
        EncryptionService.decryptApiKey('', testUserId)
      ).rejects.toThrow('Encrypted API key and user ID are required for decryption');
    });

    it('should handle missing user ID', async () => {
      await expect(
        EncryptionService.decryptApiKey('encrypted-key', '')
      ).rejects.toThrow('Encrypted API key and user ID are required for decryption');
    });

    it('should fallback to base64 when crypto.subtle is not available', async () => {
      // Temporarily remove crypto.subtle
      const originalSubtle = mockCrypto.subtle;
      delete (mockCrypto as any).subtle;

      const base64Key = btoa(testApiKey);
      const decrypted = await EncryptionService.decryptApiKey(base64Key, testUserId);
      
      expect(decrypted).toBe(testApiKey);
      
      // Restore crypto.subtle
      mockCrypto.subtle = originalSubtle;
    });

    it('should handle fallback-encrypted keys', async () => {
      const base64Key = btoa(testApiKey);
      const decrypted = await EncryptionService.decryptApiKey(base64Key, testUserId);
      
      expect(decrypted).toBe(testApiKey);
    });

    it('should fallback when decryption fails', async () => {
      mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Decryption failed'));
      
      const base64Key = btoa(testApiKey);
      const decrypted = await EncryptionService.decryptApiKey(base64Key, testUserId);
      
      expect(decrypted).toBe(testApiKey);
    });
  });

  describe('validateEncryption', () => {
    it('should validate encryption successfully', async () => {
      const isValid = await EncryptionService.validateEncryption('encrypted-key', testUserId);
      
      expect(isValid).toBe(true);
    });

    it('should return false for invalid encryption', async () => {
      mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Invalid encryption'));
      
      const isValid = await EncryptionService.validateEncryption('invalid-key', testUserId);
      
      expect(isValid).toBe(false);
    });
  });

  describe('generateTestKey', () => {
    it('should generate a test key', () => {
      const testKey = EncryptionService.generateTestKey();
      
      expect(testKey).toBeDefined();
      expect(typeof testKey).toBe('string');
      expect(testKey.length).toBe(64); // 32 bytes * 2 (hex)
      expect(mockCrypto.getRandomValues).toHaveBeenCalled();
    });
  });

  describe('secureWipe', () => {
    it('should attempt to wipe sensitive string', () => {
      const sensitiveString = 'sensitive-data';
      
      // Should not throw
      expect(() => {
        EncryptionService.secureWipe(sensitiveString);
      }).not.toThrow();
    });
  });

  describe('encryption round-trip', () => {
    it('should encrypt and decrypt successfully', async () => {
      const originalKey = 'sk-original-api-key-123';
      
      const encrypted = await EncryptionService.encryptApiKey(originalKey, testUserId);
      const decrypted = await EncryptionService.decryptApiKey(encrypted, testUserId);
      
      expect(decrypted).toBe(originalKey);
    });

    it('should handle different user IDs', async () => {
      const user1 = 'user-1';
      const user2 = 'user-2';
      
      const encrypted1 = await EncryptionService.encryptApiKey(testApiKey, user1);
      const encrypted2 = await EncryptionService.encryptApiKey(testApiKey, user2);
      
      // Different users should produce different encrypted values
      expect(encrypted1).not.toBe(encrypted2);
      
      const decrypted1 = await EncryptionService.decryptApiKey(encrypted1, user1);
      const decrypted2 = await EncryptionService.decryptApiKey(encrypted2, user2);
      
      expect(decrypted1).toBe(testApiKey);
      expect(decrypted2).toBe(testApiKey);
    });
  });

  describe('error handling', () => {
    it('should handle crypto API errors gracefully', async () => {
      mockCrypto.subtle.deriveKey.mockRejectedValue(new Error('Key derivation failed'));
      
      const encrypted = await EncryptionService.encryptApiKey(testApiKey, testUserId);
      
      // Should fallback to base64
      expect(encrypted).toBe(btoa(testApiKey));
    });

    it('should handle invalid base64 in fallback decryption', async () => {
      // Temporarily remove crypto.subtle
      const originalSubtle = mockCrypto.subtle;
      delete (mockCrypto as any).subtle;

      await expect(
        EncryptionService.decryptApiKey('invalid-base64!@#', testUserId)
      ).rejects.toThrow('Failed to decrypt API key');
      
      // Restore crypto.subtle
      mockCrypto.subtle = originalSubtle;
    });
  });
});
