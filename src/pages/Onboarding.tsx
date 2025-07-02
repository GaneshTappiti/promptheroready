// Onboarding Page - Welcome new users and set up AI provider
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AIProviderOnboarding } from '@/components/onboarding/AIProviderOnboarding';

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleOnboardingComplete = (configured: boolean) => {
    // Navigate to workspace after onboarding
    navigate('/workspace', { 
      state: { 
        onboardingComplete: true, 
        aiProviderConfigured: configured 
      } 
    });
  };

  const handleSkip = () => {
    // Navigate to workspace without AI provider setup
    navigate('/workspace', { 
      state: { 
        onboardingComplete: true, 
        aiProviderConfigured: false 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <AIProviderOnboarding
      onComplete={handleOnboardingComplete}
      onSkip={handleSkip}
    />
  );
}
