// Protected Route component that ensures users complete onboarding before accessing the app
// BETA MODE: Onboarding checks are disabled for beta testing
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

  // BETA MODE: Skip all onboarding checks and allow direct access
  console.log('🚀 Beta mode: Bypassing onboarding checks for', location.pathname);

  // Show loading while checking auth
  if (authLoading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  // In beta mode, we don't require authentication for most routes
  // This allows testing without going through the full auth flow
  console.log('🚀 Beta mode: Allowing access', user ? `for ${user.email}` : 'without authentication');

  // Always render the protected content in beta mode
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
