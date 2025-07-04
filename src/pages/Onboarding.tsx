// Comprehensive Onboarding Page - Welcome new users and collect essential info
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ComprehensiveOnboarding, type OnboardingData } from '@/components/onboarding';
import { onboardingService } from '@/services/onboardingService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [onboardingStatus, setOnboardingStatus] = useState<{
    loading: boolean;
    hasCompletedBasic: boolean;
    hasConfiguredAI: boolean;
    needsAI: boolean;
  }>({
    loading: true,
    hasCompletedBasic: false,
    hasConfiguredAI: false,
    needsAI: false
  });

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      try {
        const [hasCompletedBasic, hasConfiguredAI] = await Promise.all([
          onboardingService.hasCompletedBasicOnboarding(user.id),
          onboardingService.hasConfiguredAI(user.id)
        ]);

        const needsAI = location.state?.needsAI || false;

        setOnboardingStatus({
          loading: false,
          hasCompletedBasic,
          hasConfiguredAI,
          needsAI
        });

        // If user has completed basic onboarding and configured AI, redirect to workspace
        if (hasCompletedBasic && hasConfiguredAI && !needsAI) {
          navigate('/workspace');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setOnboardingStatus(prev => ({ ...prev, loading: false }));
      }
    };

    if (!loading && user) {
      checkOnboardingStatus();
    }
  }, [user, loading, navigate, location.state]);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    if (!user) return;

    try {
      // Save onboarding data to database
      const result = await onboardingService.saveOnboardingData(user.id, data);

      if (result.success) {
        toast({
          title: "Welcome to StartWise! 🎉",
          description: "Your preferences have been saved successfully.",
        });

        // Navigate to workspace after successful save
        navigate('/workspace', {
          state: {
            onboardingComplete: true,
            onboardingData: data
          }
        });
      } else {
        toast({
          title: "Error saving preferences",
          description: result.error || "Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading || onboardingStatus.loading) {
    return <LoadingSpinner fullScreen text="Checking onboarding status..." />;
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <ComprehensiveOnboarding
      onComplete={handleOnboardingComplete}
    />
  );
}
