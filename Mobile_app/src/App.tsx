import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TutorialProvider } from "@/contexts/TutorialContext";
import { useSettings } from "@/hooks/useSettings";
import { DateProvider } from "@/contexts/DateContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import FoodLibrary from "./pages/FoodLibrary";
import Schedule from "./pages/Schedule";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import BarcodeScanner from "./pages/BarcodeScanner";
import VisionScan from "./pages/VisionScan";
import CampusRewards from "./pages/CampusRewards";
import NotFound from "./pages/NotFound";
import Payment from "./pages/Payment";
import Success from "./pages/Success";
import Onboarding from "./pages/Onboarding";


const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowGuest = false }: { children: React.ReactNode, allowGuest?: boolean }) => {
  const { user, isGuest } = useAuth();
  if (!user && !allowGuest) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const GlobalSplash = ({ children }: { children: React.ReactNode }) => {
  const { loading, user } = useAuth();
  const { settings } = useSettings();
  const [minSplashDone, setMinSplashDone] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);

  // Normal splash timer (0.8s)
  useEffect(() => {
    const timer = setTimeout(() => setMinSplashDone(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // skip splash if tutorial is active
  useEffect(() => {
    if (user && settings && settings.tutorial_completed === false) {
      setMinSplashDone(true);
      setIsFadingOut(true);
      setIsUnmounted(true);
    }
  }, [user, settings]);

  useEffect(() => {
    if (!loading && minSplashDone && !isUnmounted) {
      setIsFadingOut(true);
      const timer = setTimeout(() => setIsUnmounted(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loading, minSplashDone, isUnmounted]);

  return (
    <>
      {!isUnmounted && (
        <div 
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-background px-4 transition-opacity duration-500 ease-in-out ${isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-24 w-24">
              <img
                src="/fitnutt-logo.png"
                alt="Connecting"
                className="absolute inset-0 h-24 w-24 animate-logo-pump-up"
              />
              <img
                src="/fitnutt-logo-down.png"
                alt="Initializing"
                className="absolute inset-0 h-24 w-24 animate-logo-pump-down"
              />
            </div>
            <div className="text-center space-y-1">
              <h1
                className="text-2xl font-black text-foreground uppercase tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span className="font-bold text-xs text-foreground uppercase tracking-widest">Nutri sense</span>
              </h1>
              <p className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase opacity-70">Initializing Health Ecosystem</p>
            </div>
          </div>
        </div>
      )}
      {!loading && children}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <GlobalSplash>
            <BrowserRouter>
              <DateProvider>
                <TutorialProvider>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route
                      path="*"
                      element={
                        <Layout>
                          <Routes>
                            <Route
                              path="/"
                              element={
                                <ProtectedRoute allowGuest>
                                  <Index />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/foods"
                              element={
                                <ProtectedRoute allowGuest>
                                  <FoodLibrary />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/setup"
                              element={
                                <ProtectedRoute allowGuest>
                                  <Onboarding />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/schedule"
                              element={
                                <ProtectedRoute allowGuest>
                                  <Schedule />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/profile"
                              element={
                                <ProtectedRoute>
                                  <Profile />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/admin"
                              element={
                                <ProtectedRoute>
                                  <Admin />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/rewards"
                              element={
                                <ProtectedRoute allowGuest>
                                  <CampusRewards />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/payment"
                              element={
                                <ProtectedRoute>
                                  <Payment />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/vision-scan"
                              element={
                                <ProtectedRoute allowGuest>
                                  <VisionScan />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/scan"
                              element={
                                <ProtectedRoute allowGuest>
                                  <BarcodeScanner />
                                </ProtectedRoute>
                              }
                            />
                             <Route
                              path="/payment-success"
                              element={
                                <ProtectedRoute>
                                  <Success />
                                </ProtectedRoute>
                              }
                            />
                            <Route path="*" element={<NotFound />} />

                          </Routes>
                        </Layout>
                      }
                    />
                  </Routes>
                </TutorialProvider>
              </DateProvider>
            </BrowserRouter>
          </GlobalSplash>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
