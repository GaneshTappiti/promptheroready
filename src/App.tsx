/**
 * Main Application Component
 * Root component that sets up providers, routing, and error boundaries
 */

import React, { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppStateProvider } from "@/contexts/AppStateContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { BreadcrumbProvider } from "@/components/BreadcrumbNavigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { DeviceInfoProvider } from "@/components/ui/mobile-responsive";
import { BetaBanner } from "@/components/ui/beta-banner";
import { BetaRibbon } from "@/components/ui/beta-ribbon";
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
const PresentationViewer = lazy(() => import("@/components/presentation/PresentationViewer"));
const TeamSpace = lazy(() => import("@/pages/TeamSpace"));
const InvestorRadar = lazy(() => import("@/pages/InvestorRadar"));
const PitchPerfect = lazy(() => import("@/pages/PitchPerfect"));
const IdeaWiki = lazy(() => import("@/pages/IdeaWiki"));
const WikiPage = lazy(() => import("@/pages/WikiPage"));
const WikiPageEditor = lazy(() => import("@/pages/WikiPageEditor"));
const TaskPlanner = lazy(() => import("@/pages/TaskPlanner"));
const BlueprintZone = lazy(() => import("@/pages/BlueprintZone"));
const Workshop = lazy(() => import("@/pages/Workshop"));
const Profile = lazy(() => import("@/pages/Profile"));
const Account = lazy(() => import("@/pages/Account"));
const Settings = lazy(() => import("@/pages/Settings"));
const AIToolsPage = lazy(() => import("@/pages/AIToolsPage"));
const FeaturesPage = lazy(() => import("@/pages/Features"));
const About = lazy(() => import("@/pages/About"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const SignupTest = lazy(() => import("@/pages/SignupTest"));
const AdminPermissionTest = lazy(() => import("@/pages/AdminPermissionTest"));
const AIIntegrationTest = lazy(() => import("@/pages/AIIntegrationTest"));
const RealtimeTest = lazy(() => import("@/pages/RealtimeTest"));
const PerformanceTest = lazy(() => import("@/pages/PerformanceTest"));

const PromptGuide = lazy(() => import("@/components/prompting/PromptGuide"));
const PromptBuilder = lazy(() => import("@/components/prompting/PromptBuilder"));

// Admin Components
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout"));
const ProtectedAdminRoute = lazy(() => import("@/components/admin/ProtectedAdminRoute"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const UserAnalytics = lazy(() => import("@/pages/admin/UserAnalytics"));
const SubscriptionAnalytics = lazy(() => import("@/pages/admin/SubscriptionAnalytics"));
const PromptTemplates = lazy(() => import("@/pages/admin/PromptTemplates"));
const AIToolsDirectory = lazy(() => import("@/pages/admin/AIToolsDirectory"));
const PlatformSettings = lazy(() => import("@/pages/admin/PlatformSettings"));
const AdminSetupDemo = lazy(() => import("@/components/admin/AdminSetupDemo"));
const AdminTest = lazy(() => import("@/pages/AdminTest"));
const AuthTest = lazy(() => import("@/pages/AuthTest"));
const DatabaseTest = lazy(() => import("@/pages/DatabaseTest"));
const RoleManagement = lazy(() => import("@/pages/admin/RoleManagement"));
const DatabasePerformance = lazy(() => import("@/pages/admin/DatabasePerformance"));

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
      <Route path="/signup-test" element={<SignupTest />} />
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
      <Route path="/workspace/docs-decks/presentation/:id" element={
        <ProtectedRoute>
          <PresentationViewer />
        </ProtectedRoute>
      } />
      <Route path="/workspace/docs-decks/presentation/:id/edit" element={
        <ProtectedRoute>
          <PresentationViewer />
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
      <Route path="/workspace/workshop" element={
        <ProtectedRoute>
          <Workshop />
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
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/about" element={<About />} />

      <Route path="/prompting/guide" element={<PromptGuide />} />
      <Route path="/prompting/builder" element={<PromptBuilder />} />
      <Route path="/admin-setup" element={<AdminSetupDemo />} />
      <Route path="/admin-test" element={<AdminTest />} />
      <Route path="/auth-test" element={<AuthTest />} />
      <Route path="/database-test" element={<DatabaseTest />} />
      <Route path="/admin-permission-test" element={<AdminPermissionTest />} />
      <Route path="/ai-integration-test" element={<AIIntegrationTest />} />
      <Route path="/realtime-test" element={<RealtimeTest />} />
      <Route path="/performance-test" element={<PerformanceTest />} />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <AdminLayout>
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ProtectedAdminRoute requiredPermission="canViewAnalytics" superAdminOnly><UserAnalytics /></ProtectedAdminRoute>} />
            <Route path="subscriptions" element={<ProtectedAdminRoute requiredPermission="canViewAnalytics"><SubscriptionAnalytics /></ProtectedAdminRoute>} />
            <Route path="prompts" element={<ProtectedAdminRoute requiredPermission="canManagePrompts"><PromptTemplates /></ProtectedAdminRoute>} />
            <Route path="tools" element={<ProtectedAdminRoute requiredPermission="canManageTools"><AIToolsDirectory /></ProtectedAdminRoute>} />
            <Route path="settings" element={<ProtectedAdminRoute requiredPermission="canManageSettings" superAdminOnly><PlatformSettings /></ProtectedAdminRoute>} />
            <Route path="roles" element={<ProtectedAdminRoute requiredPermission="canManageRoles" superAdminOnly><RoleManagement /></ProtectedAdminRoute>} />
            <Route path="performance" element={<ProtectedAdminRoute requiredPermission="canViewAnalytics" superAdminOnly><DatabasePerformance /></ProtectedAdminRoute>} />
          </Routes>
        </AdminLayout>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  console.log('🎨 App component rendering...');

  try {
    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AdminProvider>
              <AppStateProvider>
                <BreadcrumbProvider>
                  <TooltipProvider>
                    <DeviceInfoProvider>
                      <Router>
                        <BetaBanner
                          variant="warning"
                          dismissible={true}
                          persistent={false}
                          message="🚧 BETA VERSION: PromptHeroReady is currently in beta testing. Expect frequent updates and potential bugs."
                          className="sticky top-0 z-50"
                        />
                        <Suspense fallback={<LoadingSpinner fullScreen text="Loading application..." />}>
                          <AppRoutes />
                        </Suspense>
                        <BetaRibbon
                          position="top-right"
                          variant="warning"
                          text="BETA"
                          size="default"
                          animate={false}
                          shine={true}
                        />
                        <Toaster />
                        <Sonner />
                      </Router>
                    </DeviceInfoProvider>
                  </TooltipProvider>
                </BreadcrumbProvider>
              </AppStateProvider>
            </AdminProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('🔥 Error in App component:', error);
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #dc2626, #991b1b)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        zIndex: 9999
      }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h1>🔥 App Component Error</h1>
          <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: 'white',
              color: '#dc2626',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default App;
