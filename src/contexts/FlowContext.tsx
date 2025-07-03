import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useActiveIdea, useIdeaStore } from '@/stores/ideaStore';

export type FlowStep = 'idea-vault' | 'ideaforge' | 'mvp-studio' | 'workshop' | 'vault' | 'mvpstudio';

interface FlowContextType {
  currentFlow: FlowStep;
  setCurrentFlow: (flow: FlowStep) => void;
  canNavigateToStep: (step: FlowStep) => boolean;
  navigateToStep: (step: FlowStep) => void;
  getStepStatus: (step: FlowStep) => 'pending' | 'current' | 'completed' | 'locked';
  getNextStep: () => FlowStep | null;
  getPreviousStep: () => FlowStep | null;
  isFlowComplete: boolean;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
};

interface FlowProviderProps {
  children: React.ReactNode;
}

export const FlowProvider: React.FC<FlowProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeIdea } = useActiveIdea();
  const hasActiveIdea = useIdeaStore((state) => state.hasActiveIdea);
  const [currentFlow, setCurrentFlowState] = useState<FlowStep>('workshop');

  // Flow order
  const flowSteps: FlowStep[] = ['idea-vault', 'ideaforge', 'mvp-studio'];

  // Update current flow based on location
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/idea-vault')) {
      setCurrentFlowState('idea-vault');
    } else if (path.includes('/ideaforge')) {
      setCurrentFlowState('ideaforge');
    } else if (path.includes('/mvp-studio')) {
      setCurrentFlowState('mvp-studio');
    }
  }, [location.pathname]);

  const setCurrentFlow = (flow: FlowStep) => {
    setCurrentFlowState(flow);
    // Update the store's current step as well with mapping
    const setCurrentStep = useIdeaStore.getState().setCurrentStep;
    const mappedStep = mapFlowStepToStoreStep(flow);
    setCurrentStep(mappedStep);
  };

  // Map FlowStep to store step format
  const mapFlowStepToStoreStep = (flow: FlowStep): 'workshop' | 'vault' | 'ideaforge' | 'mvpstudio' => {
    switch (flow) {
      case 'idea-vault':
        return 'vault';
      case 'ideaforge':
        return 'ideaforge';
      case 'mvp-studio':
        return 'mvpstudio';
      case 'workshop':
        return 'workshop';
      case 'vault':
        return 'vault';
      case 'mvpstudio':
        return 'mvpstudio';
      default:
        return 'workshop';
    }
  };

  const canNavigateToStep = (step: FlowStep): boolean => {
    switch (step) {
      case 'idea-vault':
        return true; // Always accessible - unlimited storage for all users

      case 'ideaforge':
        return hasActiveIdea && activeIdea !== null; // Requires active idea

      case 'mvp-studio':
        return hasActiveIdea && activeIdea !== null; // Requires active idea

      default:
        return false;
    }
  };

  const navigateToStep = (step: FlowStep) => {
    if (!canNavigateToStep(step)) {
      return;
    }

    const routes = {
      'workshop': '/workspace/workshop',
      'idea-vault': '/workspace/idea-vault',
      'ideaforge': '/workspace/ideaforge',
      'mvp-studio': '/workspace/mvp-studio'
    };

    navigate(routes[step]);
    setCurrentFlow(step);
  };

  const getStepStatus = (step: FlowStep): 'pending' | 'current' | 'completed' | 'locked' => {
    if (!canNavigateToStep(step)) {
      return 'locked';
    }

    if (step === currentFlow) {
      return 'current';
    }

    const stepIndex = flowSteps.indexOf(step);
    const currentIndex = flowSteps.indexOf(currentFlow);

    // Check completion based on data availability
    switch (step) {
      case 'workshop':
        return hasActiveIdea ? 'completed' : (stepIndex < currentIndex ? 'completed' : 'pending');
      
      case 'idea-vault':
        return hasActiveIdea ? 'completed' : (stepIndex < currentIndex ? 'completed' : 'pending');
      
      case 'ideaforge':
        // Check if user has completed some IdeaForge sections
        const ideaforgePrompts = useIdeaStore.getState().promptHistory.ideaforge;
        const hasIdeaforgeData = Object.keys(ideaforgePrompts).length > 0;
        return hasIdeaforgeData ? 'completed' : (stepIndex < currentIndex ? 'completed' : 'pending');
      
      case 'mvp-studio':
        // Check if user has generated MVP prompts
        const mvpPrompts = useIdeaStore.getState().promptHistory.mvpStudio;
        const hasMVPData = Object.keys(mvpPrompts).length > 0;
        return hasMVPData ? 'completed' : (stepIndex < currentIndex ? 'completed' : 'pending');
      
      default:
        return stepIndex < currentIndex ? 'completed' : 'pending';
    }
  };

  const getNextStep = (): FlowStep | null => {
    const currentIndex = flowSteps.indexOf(currentFlow);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= flowSteps.length) {
      return null;
    }
    
    const nextStep = flowSteps[nextIndex];
    return canNavigateToStep(nextStep) ? nextStep : null;
  };

  const getPreviousStep = (): FlowStep | null => {
    const currentIndex = flowSteps.indexOf(currentFlow);
    const prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
      return null;
    }
    
    return flowSteps[prevIndex];
  };

  const isFlowComplete = (): boolean => {
    return flowSteps.every(step => {
      const status = getStepStatus(step);
      return status === 'completed' || status === 'current';
    });
  };

  const value: FlowContextType = {
    currentFlow,
    setCurrentFlow,
    canNavigateToStep,
    navigateToStep,
    getStepStatus,
    getNextStep,
    getPreviousStep,
    isFlowComplete: isFlowComplete()
  };

  return (
    <FlowContext.Provider value={value}>
      {children}
    </FlowContext.Provider>
  );
};

export default FlowProvider;
