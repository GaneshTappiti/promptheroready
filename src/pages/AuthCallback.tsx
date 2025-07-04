import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { isPredefinedAdmin } from '@/utils/setupSpecificAdmin';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Redirecting to dashboard...');

  useEffect(() => {
    const handleDirectRedirect = async () => {
      try {
        setStatus('Authentication successful! Redirecting to dashboard...');
        console.log('🚀 Beta mode: Direct redirect to dashboard');

        // Get the current session (optional check)
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          console.log('✅ User authenticated:', session.user.email);

          // Check if admin for routing, but default to workspace
          const isAdmin = isPredefinedAdmin(session.user.email || '');

          if (isAdmin) {
            console.log('👑 Admin user - redirecting to admin panel');
            navigate('/admin');
          } else {
            console.log('🎯 User - redirecting to workspace dashboard');
            navigate('/workspace');
          }
        } else {
          console.log('🚀 Beta mode: No session but redirecting to dashboard anyway');
          // For beta, redirect to dashboard even without session
          navigate('/workspace');
        }
      } catch (error) {
        console.error('❌ Error in auth callback:', error);
        console.log('🚀 Beta mode: Error occurred but redirecting to dashboard anyway');
        navigate('/workspace');
      }
    };

    // Direct redirect without complex auth state checking
    handleDirectRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
        <p className="text-gray-300">{status}</p>
        <p className="text-gray-400 text-sm mt-2">Beta Version - Direct Dashboard Access</p>
      </div>
    </div>
  );
}