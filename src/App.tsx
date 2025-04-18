import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CheckIn from "./pages/CheckIn";
import ClassDetail from "./pages/ClassDetail";
import NotFound from "./pages/NotFound";
import TeacherDashboard from "./pages/TeacherDashboard";
import Auth from "./pages/Auth";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import React from "react";
import UserProfile from "./pages/UserProfile";
import FinancialDashboard from "./pages/FinancialDashboard";
import UserProfileAdmin from "./pages/UserProfileAdmin";
import SidebarLayout from "./components/SidebarLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-center" />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Navigate to="/check-in" replace />} />
              <Route
                path="/check-in"
                element={
                  <ProtectedRoute>
                    <SidebarLayout>
                      <CheckIn />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/class/:classId"
                element={
                  <ProtectedRoute>
                    <SidebarLayout>
                      <ClassDetail />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin", "coach"]}>
                    <SidebarLayout>
                      <TeacherDashboard />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute>
                    <SidebarLayout>
                      <UserProfile />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financial"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <SidebarLayout>
                      <FinancialDashboard />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/perfil-usuario/:userId"
                element={
                  <ProtectedRoute allowedRoles={["admin", "coach"]}>
                    <SidebarLayout>
                      <UserProfileAdmin />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
