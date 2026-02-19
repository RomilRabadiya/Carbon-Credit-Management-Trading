import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { MainLayout } from "@/layouts/MainLayout";
import { Loader2 } from "lucide-react";

// Pages
import LoginPage from "@/pages/Login";
import CompleteProfilePage from "@/pages/CompleteProfile";
import DashboardPage from "@/pages/Dashboard";
import WalletPage from "@/pages/Wallet";
import MarketplacePage from "@/pages/Marketplace";
import AuditPage from "@/pages/Audit";
import SettingsPage from "@/pages/Settings";
import VerifierDashboard from "@/pages/VerifierDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { checkSession, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!isLoading && user) {
      // If user exists but profile is not complete, redirect to complete-profile
      if (!user.isProfileComplete && location.pathname !== '/complete-profile') {
        navigate('/complete-profile');
      }
      // If user exists and profile IS complete, prevent accessing complete-profile
      if (user.isProfileComplete && location.pathname === '/complete-profile') {
        navigate('/dashboard');
      }
    }
  }, [isLoading, user, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

import { WebSocketProvider } from "@/context/WebSocketContext";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WebSocketProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthWrapper>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/complete-profile" element={<CompleteProfilePage />} />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <DashboardPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wallet"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <WalletPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/verifier-dashboard"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <VerifierDashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/marketplace"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <MarketplacePage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/audit"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <AuditPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SettingsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </WebSocketProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
