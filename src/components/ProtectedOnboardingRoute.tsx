// Protected Route component that ensures users complete onboarding before accessing the app
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { onboardingService } from '@/services/onboardingService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ProtectedOnboardingRouteProps {
  children: React.ReactNode;
  requiresAI?: boolean; // Whether this route requires AI configuration
}

export function ProtectedOnboardingRoute({ 
  children, 
  requiresAI = true 
}: ProtectedOnboardingRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [onboardingStatus, setOnboardingStatus] = useState<{
    loading: boolean;
    hasCompletedBasic: boolean;
    hasConfiguredAI: boolean;
    hasCompletedFull: boolean;
  }>({
    loading: true,
    hasCompletedBasic: false,
    hasConfiguredAI: false,
    hasCompletedFull: false
  });

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setOnboardingStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const [hasCompletedBasic, hasConfiguredAI, hasCompletedFull] = await Promise.all([
          onboardingService.hasCompletedBasicOnboarding(user.id),
          onboardingService.hasConfiguredAI(user.id),
          onboardingService.hasCompletedOnboarding(user.id)
        ]);

        setOnboardingStatus({
          loading: false,
          hasCompletedBasic,
          hasConfiguredAI,
          hasCompletedFull
        });
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setOnboardingStatus({
          loading: false,
          hasCompletedBasic: false,
          hasConfiguredAI: false,
          hasCompletedFull: false
        });
      }
    };

    if (!authLoading) {
      checkOnboardingStatus();
    }
  }, [user, authLoading]);

  // Show loading while checking auth or onboarding status
  if (authLoading || onboardingStatus.loading) {
    return <LoadingSpinner fullScreen text="Checking onboarding status..." />;
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Allow access to onboarding page itself
  if (location.pathname === '/onboarding') {
    return <>{children}</>;
  }

  // Check if user needs to complete basic onboarding
  if (!onboardingStatus.hasCompletedBasic) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // Check if route requires AI and user hasn't configured it
  if (requiresAI && !onboardingStatus.hasConfiguredAI) {
    return <Navigate to="/onboarding" state={{ from: location, needsAI: true }} replace />;
  }

  // All checks passed, render the protected content
  return <>{children}</>;
}

// Higher-order component for easier usage
export function withOnboardingProtection<P extends object>(
  Component: React.ComponentType<P>,
  requiresAI = true
) {
  return function OnboardingProtectedComponent(props: P) {
    return (
      <ProtectedOnboardingRoute requiresAI={requiresAI}>
        <Component {...props} />
      </ProtectedOnboardingRoute>
    );
  };
}
