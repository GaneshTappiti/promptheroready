import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { onboardingService } from '@/services/onboardingService';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthStateChange = async (event: string, session: any) => {
      console.log('🔄 AuthCallback - Auth state changed:', event, session?.user?.email);

      if (event === 'SIGNED_IN' && session) {
        try {
          console.log('✅ User signed in, checking onboarding status...');

          // Check onboarding status with detailed logging
          const [hasCompletedBasic, hasConfiguredAI, hasCompletedFull] = await Promise.all([
            onboardingService.hasCompletedBasicOnboarding(session.user.id),
            onboardingService.hasConfiguredAI(session.user.id),
            onboardingService.hasCompletedOnboarding(session.user.id)
          ]);

          console.log('📊 Onboarding status:', {
            hasCompletedBasic,
            hasConfiguredAI,
            hasCompletedFull,
            userId: session.user.id
          });

          // Check for bypass parameter (for testing)
          const urlParams = new URLSearchParams(window.location.search);
          const bypassOnboarding = urlParams.get('bypass') === 'true';

          if (bypassOnboarding) {
            console.log('🚀 Bypassing onboarding checks, going directly to workspace');
            navigate('/workspace');
            return;
          }

          // More flexible redirect logic
          if (hasCompletedBasic && hasConfiguredAI) {
            console.log('🎯 Redirecting to workspace - user fully onboarded');
            navigate('/workspace');
          } else if (hasCompletedBasic && !hasConfiguredAI) {
            console.log('🔧 Redirecting to onboarding - needs AI configuration');
            navigate('/onboarding', { state: { needsAI: true } });
          } else {
            console.log('📝 Redirecting to onboarding - needs basic setup');
            navigate('/onboarding');
          }
        } catch (error) {
          console.error('❌ Error checking onboarding status:', error);
          // For existing users who might not have onboarding data, go to workspace
          console.log('🔄 Defaulting to workspace for existing user');
          navigate('/workspace');
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out, redirecting to auth');
        navigate('/auth');
      } else {
        console.log('🔄 No valid session, redirecting to auth');
        navigate('/auth');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => subscription.unsubscribe();
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