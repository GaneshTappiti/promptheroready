import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import EnhancedUpgradePrompt from './EnhancedUpgradePrompt';
import { Loader2 } from 'lucide-react';

interface FeatureGateProps {
  children: React.ReactNode;
  feature: string;
  action: 'create_idea' | 'generate_prompt' | 'make_ai_call';
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  upgradePromptVariant?: 'card' | 'banner' | 'modal' | 'inline';
  description?: string;
  onRestricted?: () => void;
}

const FeatureGate: React.FC<FeatureGateProps> = ({
  children,
  feature,
  action,
  fallback,
  showUpgradePrompt = true,
  upgradePromptVariant = 'card',
  description,
  onRestricted
}) => {
  const { canPerformAction, loading } = useSubscription();
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const [restrictionReason, setRestrictionReason] = useState<string>('');
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;
      
      try {
        const result = await canPerformAction(action);
        setCanAccess(result.allowed);
        setRestrictionReason(result.reason || '');
        setUpgradeRequired(result.upgradeRequired || false);
        
        if (!result.allowed && onRestricted) {
          onRestricted();
        }
      } catch (error) {
        console.error('Error checking feature access:', error);
        setCanAccess(false);
        setRestrictionReason('Error checking permissions');
      }
    };

    checkAccess();
  }, [action, canPerformAction, loading, onRestricted]);

  if (loading || canAccess === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Checking permissions...</span>
      </div>
    );
  }

  if (!canAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgradePrompt && upgradeRequired) {
      return (
        <EnhancedUpgradePrompt
          feature={feature}
          description={description || restrictionReason}
          variant={upgradePromptVariant}
          action={action}
          showUsageStats={true}
        />
      );
    }

    return (
      <div className="text-center p-8 text-gray-400">
        <p>{restrictionReason || `Access to ${feature} is restricted`}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default FeatureGate;
