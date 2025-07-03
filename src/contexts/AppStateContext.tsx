import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Types
export interface ActiveIdea {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'archived' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ActiveProject {
  id: string;
  name: string;
  ideaId: string;
  type: 'mvp' | 'prototype' | 'full-app';
  status: 'planning' | 'development' | 'testing' | 'deployed';
  createdAt: string;
  updatedAt: string;
}

export interface NavigationState {
  currentPage: string;
  previousPage?: string;
  breadcrumbs: Array<{
    label: string;
    path: string;
    icon?: React.ReactNode;
  }>;
}

export interface AppState {
  activeIdea: ActiveIdea | null;
  activeProject: ActiveProject | null;
  navigation: NavigationState;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string | null;
}

// Action types
type AppAction =
  | { type: 'SET_ACTIVE_IDEA'; payload: ActiveIdea | null }
  | { type: 'SET_ACTIVE_PROJECT'; payload: ActiveProject | null }
  | { type: 'UPDATE_NAVIGATION'; payload: Partial<NavigationState> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SYNC_SUCCESS'; payload: string }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  activeIdea: null,
  activeProject: null,
  navigation: {
    currentPage: '/',
    breadcrumbs: []
  },
  isLoading: false,
  error: null,
  lastSyncTime: null
};

// Reducer
const appStateReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_ACTIVE_IDEA':
      return {
        ...state,
        activeIdea: action.payload,
        // Clear active project if idea changes
        activeProject: action.payload?.id !== state.activeIdea?.id ? null : state.activeProject
      };

    case 'SET_ACTIVE_PROJECT':
      return {
        ...state,
        activeProject: action.payload
      };

    case 'UPDATE_NAVIGATION':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          ...action.payload
        }
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'SYNC_SUCCESS':
      return {
        ...state,
        lastSyncTime: action.payload,
        error: null
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
};

// Context
interface AppStateContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Convenience methods
  setActiveIdea: (idea: ActiveIdea | null) => void;
  setActiveProject: (project: ActiveProject | null) => void;
  updateNavigation: (navigation: Partial<NavigationState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
  
  // Computed values
  hasActiveIdea: boolean;
  hasActiveProject: boolean;
  isIdeaActive: (ideaId: string) => boolean;
  isProjectActive: (projectId: string) => boolean;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Provider component
export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appStateReducer, initialState);
  const { user } = useAuth();

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = () => {
      try {
        const persistedState = localStorage.getItem(`appState_${user?.id}`);
        if (persistedState) {
          const parsed = JSON.parse(persistedState);
          
          // Restore active idea and project
          if (parsed.activeIdea) {
            dispatch({ type: 'SET_ACTIVE_IDEA', payload: parsed.activeIdea });
          }
          if (parsed.activeProject) {
            dispatch({ type: 'SET_ACTIVE_PROJECT', payload: parsed.activeProject });
          }
        }
      } catch (error) {
        console.error('Failed to load persisted app state:', error);
      }
    };

    if (user?.id) {
      loadPersistedState();
    }
  }, [user?.id]);

  // Persist state changes
  useEffect(() => {
    if (user?.id) {
      const stateToSave = {
        activeIdea: state.activeIdea,
        activeProject: state.activeProject,
        lastSyncTime: state.lastSyncTime
      };
      
      localStorage.setItem(`appState_${user.id}`, JSON.stringify(stateToSave));
    }
  }, [state.activeIdea, state.activeProject, state.lastSyncTime, user?.id]);

  // Reset state when user logs out
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'RESET_STATE' });
    }
  }, [user]);

  // Convenience methods
  const setActiveIdea = (idea: ActiveIdea | null) => {
    dispatch({ type: 'SET_ACTIVE_IDEA', payload: idea });
  };

  const setActiveProject = (project: ActiveProject | null) => {
    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project });
  };

  const updateNavigation = (navigation: Partial<NavigationState>) => {
    dispatch({ type: 'UPDATE_NAVIGATION', payload: navigation });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  // Computed values
  const hasActiveIdea = state.activeIdea !== null;
  const hasActiveProject = state.activeProject !== null;
  
  const isIdeaActive = (ideaId: string) => {
    return state.activeIdea?.id === ideaId;
  };

  const isProjectActive = (projectId: string) => {
    return state.activeProject?.id === projectId;
  };

  const value: AppStateContextType = {
    state,
    dispatch,
    setActiveIdea,
    setActiveProject,
    updateNavigation,
    setLoading,
    setError,
    resetState,
    hasActiveIdea,
    hasActiveProject,
    isIdeaActive,
    isProjectActive
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

// Hook to use app state
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

// Hook for navigation state specifically
export const useNavigation = () => {
  const { state, updateNavigation } = useAppState();
  
  const setBreadcrumbs = (breadcrumbs: NavigationState['breadcrumbs']) => {
    updateNavigation({ breadcrumbs });
  };

  const setCurrentPage = (currentPage: string, previousPage?: string) => {
    updateNavigation({ 
      currentPage, 
      previousPage: previousPage || state.navigation.currentPage 
    });
  };

  return {
    navigation: state.navigation,
    setBreadcrumbs,
    setCurrentPage,
    updateNavigation
  };
};

// Hook for active idea management
export const useActiveIdea = () => {
  const { state, setActiveIdea } = useAppState();
  
  return {
    activeIdea: state.activeIdea,
    setActiveIdea,
    hasActiveIdea: state.activeIdea !== null,
    isIdeaActive: (ideaId: string) => state.activeIdea?.id === ideaId
  };
};

// Hook for active project management
export const useActiveProject = () => {
  const { state, setActiveProject } = useAppState();
  
  return {
    activeProject: state.activeProject,
    setActiveProject,
    hasActiveProject: state.activeProject !== null,
    isProjectActive: (projectId: string) => state.activeProject?.id === projectId
  };
};

export default AppStateContext;
