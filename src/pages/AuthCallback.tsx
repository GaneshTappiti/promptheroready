import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { hasProviderConfigured } from '@/services/userAIPreferencesService';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check if user has AI provider configured
        const hasAIProvider = await hasProviderConfigured(session.user.id);

        // Check if this is a new user (created recently)
        const userCreatedAt = new Date(session.user.created_at);
        const now = new Date();
        const isNewUser = (now.getTime() - userCreatedAt.getTime()) < 5 * 60 * 1000; // 5 minutes

        // Redirect new users without AI provider to onboarding
        if (isNewUser && !hasAIProvider) {
          navigate('/onboarding');
        } else {
          navigate('/workspace');
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