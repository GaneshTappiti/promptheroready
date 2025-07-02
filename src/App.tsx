/**
 * Main Application Component
 * Root component that sets up providers, routing, and error boundaries
 */

import React, { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { config } from "@/config";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

// Lazy load page components for better performance
const Auth = lazy(() => import("@/pages/Auth"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Workspace = lazy(() => import("@/pages/Workspace"));

const IdeaVault = lazy(() => import("@/pages/IdeaVault"));
const IdeaDetails = lazy(() => import("@/pages/IdeaDetails"));
const IdeaForge = lazy(() => import("@/pages/IdeaForge"));
const MVPStudio = lazy(() => import("@/pages/MVPStudio"));
const DocsDecks = lazy(() => import("@/pages/DocsDecks"));
const DocumentEditor = lazy(() => import("@/pages/DocumentEditor"));
const TeamSpace = lazy(() => import("@/pages/TeamSpace"));
const InvestorRadar = lazy(() => import("@/pages/InvestorRadar"));
const PitchPerfect = lazy(() => import("@/pages/PitchPerfect"));
const IdeaWiki = lazy(() => import("@/pages/IdeaWiki"));
const WikiPage = lazy(() => import("@/pages/WikiPage"));
const WikiPageEditor = lazy(() => import("@/pages/WikiPageEditor"));
const TaskPlanner = lazy(() => import("@/pages/TaskPlanner"));
const BlueprintZone = lazy(() => import("@/pages/BlueprintZone"));
const Profile = lazy(() => import("@/pages/Profile"));
const Account = lazy(() => import("@/pages/Account"));
const AIToolsPage = lazy(() => import("@/pages/AIToolsPage"));
const FeaturesPage = lazy(() => import("@/pages/Features"));
const About = lazy(() => import("@/pages/About"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AIResponseDemo = lazy(() => import("@/components/demo/AIResponseDemo"));
const PromptGuide = lazy(() => import("@/components/prompting/PromptGuide"));
const PromptBuilder = lazy(() => import("@/components/prompting/PromptBuilder"));

// Create QueryClient with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: config.cache.defaultTTL,
      retry: config.api.retryAttempts,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/reset-password" element={<Auth />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <Workspace />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/workspace" />} />

      <Route path="/workspace/idea-vault" element={
        <ProtectedRoute>
          <IdeaVault />
        </ProtectedRoute>
      } />
      <Route path="/workspace/idea-vault/:ideaId" element={
        <ProtectedRoute>
          <IdeaDetails />
        </ProtectedRoute>
      } />
      <Route path="/workspace/ideaforge" element={
        <ProtectedRoute>
          <IdeaForge />
        </ProtectedRoute>
      } />
      <Route path="/workspace/ideaforge/:ideaId" element={
        <ProtectedRoute>
          <IdeaForge />
        </ProtectedRoute>
      } />

      <Route path="/workspace/mvp-studio" element={
        <ProtectedRoute>
          <MVPStudio />
        </ProtectedRoute>
      } />
      <Route path="/workspace/docs-decks" element={
        <ProtectedRoute>
          <DocsDecks />
        </ProtectedRoute>
      } />
      <Route path="/workspace/docs-decks/editor/:docId" element={
        <ProtectedRoute>
          <DocumentEditor />
        </ProtectedRoute>
      } />
      <Route path="/workspace/teamspace" element={
        <ProtectedRoute>
          <TeamSpace />
        </ProtectedRoute>
      } />
      <Route path="/workspace/investor-radar" element={
        <ProtectedRoute>
          <InvestorRadar />
        </ProtectedRoute>
      } />
      <Route path="/workspace/pitch-perfect" element={
        <ProtectedRoute>
          <PitchPerfect />
        </ProtectedRoute>
      } />
      <Route path="/workspace/pitch-perfect/editor/:type/:id" element={
        <ProtectedRoute>
          <DocumentEditor />
        </ProtectedRoute>
      } />
      <Route path="/workspace/idea-wiki" element={
        <ProtectedRoute>
          <IdeaWiki />
        </ProtectedRoute>
      } />
      <Route path="/workspace/idea-wiki/:pageId" element={
        <ProtectedRoute>
          <WikiPage />
        </ProtectedRoute>
      } />
      <Route path="/workspace/idea-wiki/:pageId/edit" element={
        <ProtectedRoute>
          <WikiPageEditor />
        </ProtectedRoute>
      } />

      <Route path="/workspace/ai-tools" element={
        <ProtectedRoute>
          <AIToolsPage />
        </ProtectedRoute>
      } />
      <Route path="/workspace/task-planner" element={
        <ProtectedRoute>
          <TaskPlanner />
        </ProtectedRoute>
      } />
      <Route path="/workspace/blueprint-zone" element={
        <ProtectedRoute>
          <BlueprintZone />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/account" element={
        <ProtectedRoute>
          <Account />
        </ProtectedRoute>
      } />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/demo/ai-responses" element={<AIResponseDemo />} />
      <Route path="/prompting/guide" element={<PromptGuide />} />
      <Route path="/prompting/builder" element={<PromptBuilder />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  console.log('App component rendering...');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Router>
              <Suspense fallback={<LoadingSpinner fullScreen text="Loading application..." />}>
                <AppRoutes />
              </Suspense>
              <Toaster />
              <Sonner />
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
