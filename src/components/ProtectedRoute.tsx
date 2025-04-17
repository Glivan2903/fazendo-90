
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

  if (!user) {
    console.log("Usuário não autenticado, redirecionando para /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Special case for admin email
  const isAdminEmail = user.email === "matheusprograming@gmail.com";
  if (isAdminEmail) {
    console.log("Admin email detected, bypassing role check");
    return <>{children}</>;
  }

  // Verificação de permissão com base no role do usuário
  if (allowedRoles && allowedRoles.length > 0) {
    console.log(`Verificando se o papel '${userRole}' está entre os permitidos:`, allowedRoles);
    
    // Se userRole estiver definido como null mesmo depois do carregamento, 
    // considerar como "student" para fins de compatibilidade
    const effectiveRole = userRole || "student";
    
    if (!allowedRoles.includes(effectiveRole)) {
      console.log(`Acesso negado: usuário com papel '${effectiveRole}' tentando acessar rota que requer ${allowedRoles.join(', ')}`);
      toast.error("Você não tem permissão para acessar esta página");
      return <Navigate to="/check-in" replace />;
    }
  }

  console.log("Acesso permitido para a rota:", location.pathname);
  return <>{children}</>;
};

export default ProtectedRoute;
