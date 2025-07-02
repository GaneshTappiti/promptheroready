// Utility functions for the real-time chat feature

export const truncateText = (text: string, maxLength: number = 500): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getCountryCode = async (): Promise<string> => {
  try {
    // First check localStorage
    const storedCountryCode = localStorage.getItem('countryCode');
    if (storedCountryCode && storedCountryCode !== 'undefined') {
      return storedCountryCode;
    }

    // Try to get from API
    const res = await fetch('https://api.db-ip.com/v2/free/self');
    const { countryCode, error } = await res.json();
    
    if (error) throw new Error(error);
    
    localStorage.setItem('countryCode', countryCode);
    return countryCode;
  } catch (error) {
    console.error('Error getting location from api.db-ip.com:', error);
    
    // Fallback: try to guess from timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneToCountry: Record<string, string> = {
      'America/New_York': 'US',
      'America/Los_Angeles': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'Europe/London': 'GB',
      'Europe/Paris': 'FR',
      'Europe/Berlin': 'DE',
      'Europe/Rome': 'IT',
      'Europe/Madrid': 'ES',
      'Asia/Tokyo': 'JP',
      'Asia/Seoul': 'KR',
      'Asia/Shanghai': 'CN',
      'Asia/Kolkata': 'IN',
      'Australia/Sydney': 'AU',
      'America/Toronto': 'CA',
      'America/Sao_Paulo': 'BR',
      'Europe/Amsterdam': 'NL',
      'Europe/Stockholm': 'SE',
      'Europe/Oslo': 'NO',
      'Europe/Copenhagen': 'DK',
      'Europe/Helsinki': 'FI',
    };
    
    const countryCode = timezoneToCountry[timezone] || 'US';
    localStorage.setItem('countryCode', countryCode);
    return countryCode;
  }
};

export const generateRandomUsername = (): string => {
  return `@user${Date.now().toString().slice(-4)}`;
};

export const getCountryFlag = (countryCode: string): string => {
  if (!countryCode || countryCode === 'undefined') return '🌍';
  
  // Convert country code to flag emoji
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};

export const isValidMessage = (text: string): boolean => {
  return text.trim().length > 0 && text.length <= 500;
};

export const sanitizeMessage = (text: string): string => {
  // Basic sanitization - remove potentially harmful content
  return text
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .substring(0, 500);
};
