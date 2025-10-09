import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageProvider } from "@/hooks/usePage";
import ProtectedRoute from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";

// Route-level code splitting to reduce initial JS for public page
const Index = lazy(() => import("./pages/Index"));
const Preview = lazy(() => import("./pages/Preview"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const EditHeader = lazy(() => import("./pages/EditHeader"));
const Leads = lazy(() => import("./pages/Leads"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30,   // 30 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="popLayout">
      <motion.div key={location.pathname}>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-sm text-muted-foreground">Carregando...</div></div>}>
        <Routes location={location}>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/preview" element={<Preview />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <PageProvider>
                  <Index />
                </PageProvider>
              </ProtectedRoute>
            } />
            <Route path="/edit-header" element={
              <ProtectedRoute>
                <PageProvider>
                  <EditHeader />
                </PageProvider>
              </ProtectedRoute>
            } />
            <Route path="/leads" element={
              <ProtectedRoute>
                <PageProvider>
                  <Leads />
                </PageProvider>
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            {/* Public profile - must be last before catch-all */}
            <Route path="/:username" element={<PublicProfile />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_relativeSplatPath: true }}>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
