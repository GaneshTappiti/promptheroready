/**
 * Storage Utilities
 * Utilities for localStorage, sessionStorage, and other storage operations
 */

import { STORAGE_KEYS } from '../constants';

// Type-safe storage interface
interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

// Generic storage class
class Storage {
  private storage: globalThis.Storage;

  constructor(storage: globalThis.Storage) {
    this.storage = storage;
  }

  // Set item with optional expiration
  set<T>(key: string, value: T, expirationMs?: number): void {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiresAt: expirationMs ? Date.now() + expirationMs : undefined,
      };
      
      this.storage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  }

  // Get item with expiration check
  get<T>(key: string): T | null {
    try {
      const itemStr = this.storage.getItem(key);
      if (!itemStr) return null;

      const item: StorageItem<T> = JSON.parse(itemStr);
      
      // Check expiration
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.remove(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  // Remove item
  remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }

  // Clear all items
  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }

  // Check if item exists and is not expired
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Get all keys
  keys(): string[] {
    try {
      return Object.keys(this.storage);
    } catch (error) {
      console.error('Storage keys error:', error);
      return [];
    }
  }

  // Get storage size in bytes (approximate)
  size(): number {
    try {
      let total = 0;
      for (let key in this.storage) {
        if (this.storage.hasOwnProperty(key)) {
          total += this.storage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      console.error('Storage size error:', error);
      return 0;
    }
  }
}

// Create storage instances
export const localStorage = new Storage(globalThis.localStorage);
export const sessionStorage = new Storage(globalThis.sessionStorage);

// Specific storage utilities for common use cases
export const authStorage = {
  setToken: (token: string) => {
    localStorage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },
  
  getToken: (): string | null => {
    return localStorage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  },
  
  removeToken: () => {
    localStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
  },
  
  hasToken: (): boolean => {
    return localStorage.has(STORAGE_KEYS.AUTH_TOKEN);
  },
};

export const preferencesStorage = {
  set: (preferences: Record<string, any>) => {
    localStorage.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
  },
  
  get: (): Record<string, any> | null => {
    return localStorage.get<Record<string, any>>(STORAGE_KEYS.USER_PREFERENCES);
  },
  
  update: (updates: Record<string, any>) => {
    const current = preferencesStorage.get() || {};
    preferencesStorage.set({ ...current, ...updates });
  },
  
  remove: () => {
    localStorage.remove(STORAGE_KEYS.USER_PREFERENCES);
  },
};

export const themeStorage = {
  set: (theme: 'light' | 'dark' | 'system') => {
    localStorage.set(STORAGE_KEYS.THEME, theme);
  },
  
  get: (): 'light' | 'dark' | 'system' | null => {
    return localStorage.get<'light' | 'dark' | 'system'>(STORAGE_KEYS.THEME);
  },
  
  remove: () => {
    localStorage.remove(STORAGE_KEYS.THEME);
  },
};

export const sidebarStorage = {
  setCollapsed: (collapsed: boolean) => {
    localStorage.set(STORAGE_KEYS.SIDEBAR_STATE, { collapsed });
  },
  
  isCollapsed: (): boolean => {
    const state = localStorage.get<{ collapsed: boolean }>(STORAGE_KEYS.SIDEBAR_STATE);
    return state?.collapsed ?? false;
  },
};

export const recentIdeasStorage = {
  add: (idea: { id: string; title: string; timestamp: number }) => {
    const recent = recentIdeasStorage.get();
    const updated = [idea, ...recent.filter(i => i.id !== idea.id)].slice(0, 10);
    localStorage.set(STORAGE_KEYS.RECENT_IDEAS, updated);
  },
  
  get: (): Array<{ id: string; title: string; timestamp: number }> => {
    return localStorage.get<Array<{ id: string; title: string; timestamp: number }>>(STORAGE_KEYS.RECENT_IDEAS) || [];
  },
  
  remove: (id: string) => {
    const recent = recentIdeasStorage.get();
    const updated = recent.filter(i => i.id !== id);
    localStorage.set(STORAGE_KEYS.RECENT_IDEAS, updated);
  },
  
  clear: () => {
    localStorage.remove(STORAGE_KEYS.RECENT_IDEAS);
  },
};

// Cache utilities with TTL
export const cache = {
  set: <T>(key: string, value: T, ttlMs: number = 5 * 60 * 1000) => {
    sessionStorage.set(key, value, ttlMs);
  },
  
  get: <T>(key: string): T | null => {
    return sessionStorage.get<T>(key);
  },
  
  remove: (key: string) => {
    sessionStorage.remove(key);
  },
  
  clear: () => {
    sessionStorage.clear();
  },
};

// Storage event listeners
export const addStorageListener = (callback: (event: StorageEvent) => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

// Storage quota utilities
export const getStorageQuota = async (): Promise<{ used: number; total: number } | null> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        total: estimate.quota || 0,
      };
    } catch (error) {
      console.error('Storage quota error:', error);
    }
  }
  return null;
};

// Check if storage is available
export const isStorageAvailable = (type: 'localStorage' | 'sessionStorage'): boolean => {
  try {
    const storage = window[type];
    const test = '__storage_test__';
    storage.setItem(test, test);
    storage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Migrate storage data
export const migrateStorage = (migrations: Array<{ version: string; migrate: () => void }>) => {
  const currentVersion = localStorage.get<string>('__storage_version__') || '0.0.0';
  
  migrations.forEach(({ version, migrate }) => {
    if (compareVersions(version, currentVersion) > 0) {
      try {
        migrate();
        localStorage.set('__storage_version__', version);
        console.log(`Storage migrated to version ${version}`);
      } catch (error) {
        console.error(`Storage migration failed for version ${version}:`, error);
      }
    }
  });
};

// Simple version comparison
const compareVersions = (a: string, b: string): number => {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    
    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }
  
  return 0;
};
