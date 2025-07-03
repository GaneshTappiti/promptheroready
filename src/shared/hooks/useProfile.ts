/**
 * useProfile Hook
 * React hook for managing user profile data, notifications, privacy, and security settings
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Profile data interfaces
interface ProfileData {
  id?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  bio?: string;
  company?: string;
  website?: string;
  location?: string;
  timezone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface NotificationData {
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  weekly_digest: boolean;
  idea_reminders: boolean;
  team_updates: boolean;
}

interface PrivacyData {
  profile_visibility: 'public' | 'private' | 'team';
  show_email: boolean;
  show_activity: boolean;
  data_sharing: boolean;
  analytics: boolean;
}

interface SecurityData {
  two_factor_enabled: boolean;
  session_timeout: number;
  login_alerts: boolean;
}

interface UseProfileData {
  profile: ProfileData | null;
  notifications: NotificationData | null;
  privacy: PrivacyData | null;
  security: SecurityData | null;
}

interface UseProfileReturn {
  data: UseProfileData;
  loading: boolean;
  error: string | null;
  updateProfile: (profileData: Partial<ProfileData>) => Promise<void>;
  updateNotifications: (notificationData: Partial<NotificationData>) => Promise<void>;
  updatePrivacy: (privacyData: Partial<PrivacyData>) => Promise<void>;
  updateSecurity: (securityData: Partial<SecurityData>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Mock API functions - replace with actual API calls
const fetchProfile = async (): Promise<{ success: boolean; data: ProfileData }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data
  return {
    success: true,
    data: {
      id: '1',
      first_name: '',
      last_name: '',
      username: '',
      bio: '',
      company: '',
      website: '',
      location: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      avatar_url: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  };
};

const fetchNotifications = async (): Promise<{ success: boolean; data: NotificationData }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: {
      email_notifications: true,
      push_notifications: true,
      marketing_emails: false,
      weekly_digest: true,
      idea_reminders: true,
      team_updates: true,
    }
  };
};

const fetchPrivacy = async (): Promise<{ success: boolean; data: PrivacyData }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: {
      profile_visibility: 'public',
      show_email: false,
      show_activity: true,
      data_sharing: false,
      analytics: true,
    }
  };
};

const fetchSecurity = async (): Promise<{ success: boolean; data: SecurityData }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: {
      two_factor_enabled: false,
      session_timeout: 30,
      login_alerts: true,
    }
  };
};

const updateProfileAPI = async (profileData: Partial<ProfileData>): Promise<{ success: boolean; data: ProfileData }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: {
      ...profileData,
      updated_at: new Date().toISOString(),
    } as ProfileData
  };
};

const updateNotificationsAPI = async (notificationData: Partial<NotificationData>): Promise<{ success: boolean; data: NotificationData }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: notificationData as NotificationData
  };
};

const updatePrivacyAPI = async (privacyData: Partial<PrivacyData>): Promise<{ success: boolean; data: PrivacyData }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: privacyData as PrivacyData
  };
};

const updateSecurityAPI = async (securityData: Partial<SecurityData>): Promise<{ success: boolean; data: SecurityData }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: securityData as SecurityData
  };
};

export function useProfile(): UseProfileReturn {
  const { user } = useAuth();
  const [data, setData] = useState<UseProfileData>({
    profile: null,
    notifications: null,
    privacy: null,
    security: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all profile data
  const loadProfileData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [profileRes, notificationsRes, privacyRes, securityRes] = await Promise.all([
        fetchProfile(),
        fetchNotifications(),
        fetchPrivacy(),
        fetchSecurity(),
      ]);

      setData({
        profile: profileRes.success ? profileRes.data : null,
        notifications: notificationsRes.success ? notificationsRes.data : null,
        privacy: privacyRes.success ? privacyRes.data : null,
        security: securityRes.success ? securityRes.data : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update profile
  const updateProfile = useCallback(async (profileData: Partial<ProfileData>) => {
    try {
      const response = await updateProfileAPI(profileData);
      if (response.success) {
        setData(prev => ({
          ...prev,
          profile: { ...prev.profile, ...response.data }
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  }, []);

  // Update notifications
  const updateNotifications = useCallback(async (notificationData: Partial<NotificationData>) => {
    try {
      const response = await updateNotificationsAPI(notificationData);
      if (response.success) {
        setData(prev => ({
          ...prev,
          notifications: { ...prev.notifications, ...response.data }
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notifications');
      throw err;
    }
  }, []);

  // Update privacy
  const updatePrivacy = useCallback(async (privacyData: Partial<PrivacyData>) => {
    try {
      const response = await updatePrivacyAPI(privacyData);
      if (response.success) {
        setData(prev => ({
          ...prev,
          privacy: { ...prev.privacy, ...response.data }
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update privacy settings');
      throw err;
    }
  }, []);

  // Update security
  const updateSecurity = useCallback(async (securityData: Partial<SecurityData>) => {
    try {
      const response = await updateSecurityAPI(securityData);
      if (response.success) {
        setData(prev => ({
          ...prev,
          security: { ...prev.security, ...response.data }
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update security settings');
      throw err;
    }
  }, []);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    await loadProfileData();
  }, [loadProfileData]);

  // Load data on mount and when user changes
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  return {
    data,
    loading,
    error,
    updateProfile,
    updateNotifications,
    updatePrivacy,
    updateSecurity,
    refreshProfile,
  };
}
