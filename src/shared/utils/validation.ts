/**
 * Validation Utilities
 * Common validation functions used across the application
 */

import { VALIDATION } from '../constants';

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
};

// Username validation
export const isValidUsername = (username: string): boolean => {
  return (
    username.length >= VALIDATION.USERNAME_MIN_LENGTH &&
    username.length <= VALIDATION.USERNAME_MAX_LENGTH &&
    /^[a-zA-Z0-9_-]+$/.test(username)
  );
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Phone number validation (basic)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// File validation
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const isValidFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

// Text validation
export const isValidLength = (text: string, min: number, max: number): boolean => {
  return text.length >= min && text.length <= max;
};

// Number validation
export const isValidNumber = (value: any): boolean => {
  return !isNaN(value) && isFinite(value);
};

export const isPositiveNumber = (value: number): boolean => {
  return isValidNumber(value) && value > 0;
};

// Date validation
export const isValidDate = (date: string | Date): boolean => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

export const isFutureDate = (date: string | Date): boolean => {
  const d = new Date(date);
  return isValidDate(date) && d > new Date();
};

export const isPastDate = (date: string | Date): boolean => {
  const d = new Date(date);
  return isValidDate(date) && d < new Date();
};

// JSON validation
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

// API Key validation patterns
export const validateApiKey = (key: string, provider: string): boolean => {
  const patterns: Record<string, RegExp> = {
    openai: /^sk-[a-zA-Z0-9]{48}$/,
    gemini: /^[a-zA-Z0-9_-]{39}$/,
    claude: /^sk-ant-[a-zA-Z0-9_-]+$/,
    deepseek: /^sk-[a-zA-Z0-9]{48}$/,
    mistral: /^[a-zA-Z0-9]{32}$/,
  };

  const pattern = patterns[provider.toLowerCase()];
  return pattern ? pattern.test(key) : key.length > 10;
};

// Form validation helper
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule[]>
): ValidationResult => {
  const errors: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];

    for (const rule of fieldRules) {
      const error = validateField(value, rule);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

const validateField = (value: any, rule: ValidationRule): string | null => {
  switch (rule.type) {
    case 'required':
      return !value || (typeof value === 'string' && value.trim() === '') 
        ? rule.message 
        : null;

    case 'email':
      return !isValidEmail(value) ? rule.message : null;

    case 'minLength':
      return value && value.length < rule.value ? rule.message : null;

    case 'maxLength':
      return value && value.length > rule.value ? rule.message : null;

    case 'pattern':
      return value && !rule.value.test(value) ? rule.message : null;

    case 'custom':
      return rule.validator && !rule.validator(value) ? rule.message : null;

    default:
      return null;
  }
};

// Sanitization helpers
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Password strength checker
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score++;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Include special characters');

  return {
    score,
    feedback,
    isStrong: score >= 4,
  };
};
