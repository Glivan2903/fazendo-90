
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    console.log("ProtectedRoute: Verificando acesso", {
      user: !!user,
      userId: user?.id,
      userRole,
      isLoading,
      allowedRoles,
      path: location.pathname
    });
    
    if (user && !userRole && !isLoading) {
      console.warn("Usuário autenticado mas sem papel definido!");
    }
  }, [user, userRole, isLoading, allowedRoles, location]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // If no user is authenticated, redirect to login
  if (!user) {
    console.log("Usuário não autenticado, redirecionando para /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Force admin access - always grant access to all routes for admin
  // This ensures admin can always access everything even if role mappings have issues
  if (userRole === 'admin') {
    console.log("Acesso permitido para admin em qualquer rota");
    return <>{children}</>;
  }

  // If specific roles are required, check permissions
  if (allowedRoles && allowedRoles.length > 0 && userRole) {
    // Normalize roles for case-insensitive comparison
    const normalizedUserRole = userRole.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
    
    // Role equivalence mapping for backward compatibility
    const roleEquivalents: Record<string, string[]> = {
      'admin': ['admin', 'administrador'],
      'coach': ['coach', 'professor'],
      'student': ['student', 'aluno'],
    };
    
    // Check if user's role is directly allowed
    const hasDirectAccess = normalizedAllowedRoles.includes(normalizedUserRole);
    
    // Check if user's role has an equivalent that is allowed
    const hasEquivalentAccess = Object.entries(roleEquivalents).some(([role, equivalents]) => {
      return equivalents.includes(normalizedUserRole) && normalizedAllowedRoles.includes(role);
    });
    
    // Deny access if neither direct nor equivalent access is granted
    if (!hasDirectAccess && !hasEquivalentAccess) {
      console.log(`Acesso negado: usuário com papel '${userRole}' tentando acessar rota que requer ${allowedRoles.join(', ')}`);
      toast.error("Você não tem permissão para acessar esta página");
      return <Navigate to="/check-in" replace />;
    }
  }

  console.log("Acesso permitido para a rota:", location.pathname);
  return <>{children}</>;
};

export default ProtectedRoute;
