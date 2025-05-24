import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import HomePage from "./pages/HomePage"
import NotFound from "./pages/NotFound"
import Login from "./pages/auth/Login"
import Callback from "./pages/auth/Callback"
import UserQuestionnaire from "./components/UserQuestionnaire"
import Header from "./components/Header"
import Index from "./pages/Index"
import { useAuth } from "./context/AuthContext"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <>
      <Header />
      <Routes>
        {/* Root redirect based on auth status */}
        <Route path="/" element={
          <Navigate to={user ? "/home" : "/welcome"} replace />
        } />
        
        {/* Welcome/Landing page */}
        <Route path="/welcome" element={<Index />} />
        
        {/* Auth Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/callback" element={<Callback />} />
        
        {/* Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/questionnaire" element={
          <ProtectedRoute>
            <UserQuestionnaire />
          </ProtectedRoute>
        } />
        
        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter basename="/TrackFit">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
