import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { onboardingService } from '@/services/onboardingService';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          // Check if user has completed onboarding
          const hasCompletedOnboarding = await onboardingService.hasCompletedOnboarding(session.user.id);

          if (!hasCompletedOnboarding) {
            navigate('/onboarding');
          } else {
            navigate('/workspace');
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // Default to onboarding for safety
          navigate('/onboarding');
        }
      } else {
        navigate('/auth');
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
        <p className="text-gray-400">Completing authentication...</p>
      </div>
    </div>
  );
} 