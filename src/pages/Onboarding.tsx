// Comprehensive Onboarding Page - Welcome new users and collect essential info
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ComprehensiveOnboarding, type OnboardingData } from '@/components/onboarding';
import { onboardingService } from '@/services/onboardingService';

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
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
