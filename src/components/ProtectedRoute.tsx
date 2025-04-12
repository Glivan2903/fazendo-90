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
    console.log("ProtectedRoute: ", {
      user: !!user,
      userRole,
      isLoading,
      allowedRoles
    });
  }, [user, userRole, isLoading, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    console.log(`Acesso negado: usuário com papel ${userRole} tentando acessar rota que requer ${allowedRoles.join(', ')}`);
    toast.error("Você não tem permissão para acessar esta página");
    return <Navigate to="/check-in" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
