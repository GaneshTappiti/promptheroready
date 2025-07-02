export interface ChatMessage {
  id: number;
  sender_id: string;
  sender_name: string;
  content: string;
  avatar: string;
  country: string;
  is_authenticated: boolean;
  created_at: string;
  team_id: string;
  is_system_message: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  country: string;
  is_authenticated: boolean;
  is_online: boolean;
}

export interface TypingIndicator {
  user_id: string;
  user_name: string;
  team_id: string;
  timestamp: string;
}

export interface ChatState {
  messages: ChatMessage[];
  users: ChatUser[];
  typingUsers: TypingIndicator[];
  isConnected: boolean;
  isLoading: boolean;
}

export interface SendMessagePayload {
  sender_id: string;
  sender_name: string;
  content: string;
  avatar: string;
  country: string;
  is_authenticated: boolean;
  team_id: string;
  is_system_message?: boolean;
}

// Country code to flag emoji mapping
export const COUNTRY_FLAGS: Record<string, string> = {
  'US': '🇺🇸',
  'GB': '🇬🇧',
  'CA': '🇨🇦',
  'AU': '🇦🇺',
  'DE': '🇩🇪',
  'FR': '🇫🇷',
  'IT': '🇮🇹',
  'ES': '🇪🇸',
  'JP': '🇯🇵',
  'KR': '🇰🇷',
  'CN': '🇨🇳',
  'IN': '🇮🇳',
  'BR': '🇧🇷',
  'MX': '🇲🇽',
  'RU': '🇷🇺',
  'NL': '🇳🇱',
  'SE': '🇸🇪',
  'NO': '🇳🇴',
  'DK': '🇩🇰',
  'FI': '🇫🇮',
  'PL': '🇵🇱',
  'CZ': '🇨🇿',
  'AT': '🇦🇹',
  'CH': '🇨🇭',
  'BE': '🇧🇪',
  'PT': '🇵🇹',
  'GR': '🇬🇷',
  'TR': '🇹🇷',
  'IL': '🇮🇱',
  'SA': '🇸🇦',
  'AE': '🇦🇪',
  'EG': '🇪🇬',
  'ZA': '🇿🇦',
  'NG': '🇳🇬',
  'KE': '🇰🇪',
  'TH': '🇹🇭',
  'VN': '🇻🇳',
  'PH': '🇵🇭',
  'ID': '🇮🇩',
  'MY': '🇲🇾',
  'SG': '🇸🇬',
  'NZ': '🇳🇿',
  'AR': '🇦🇷',
  'CL': '🇨🇱',
  'CO': '🇨🇴',
  'PE': '🇵🇪',
  'UY': '🇺🇾',
  'EC': '🇪🇨',
  'VE': '🇻🇪',
  'DEFAULT': '🌍'
};

export const getCountryFlag = (countryCode: string): string => {
  return COUNTRY_FLAGS[countryCode.toUpperCase()] || COUNTRY_FLAGS.DEFAULT;
};

// Utility function to get user's country (simplified)
export const getUserCountry = (): string => {
  // In a real app, you'd use geolocation API or user preferences
  // For now, we'll use timezone to make a rough guess
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
  
  return timezoneToCountry[timezone] || 'US';
};
