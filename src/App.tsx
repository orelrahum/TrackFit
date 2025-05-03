import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import HomePage from "./pages/HomePage"
import NotFound from "./pages/NotFound"
import Login from "./pages/auth/Login"
import Callback from "./pages/auth/Callback"
import UserQuestionnaire from "./components/UserQuestionnaire"
import Header from "./components/Header" // Import the Header component

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <Header /> {/* Render the Header component here */}
            <Routes>
              {/* Public Routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/callback" element={<Callback />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
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
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App
