
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
  }, [user, userRole, isLoading, allowedRoles, location]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Se não houver usuário autenticado, redirecionar para login
  if (!user) {
    console.log("Usuário não autenticado, redirecionando para /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Admin sempre tem acesso a todas as rotas
  if (userRole === 'admin') {
    console.log("Acesso permitido para admin em qualquer rota");
    return <>{children}</>;
  }

  // Se papéis específicos são necessários, verificar permissões
  if (allowedRoles && allowedRoles.length > 0 && userRole) {
    // Normalizar papéis para comparação sem distinção entre maiúsculas/minúsculas
    const normalizedUserRole = userRole.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
    
    // Mapeamento de equivalência de papéis para compatibilidade retroativa
    const roleEquivalents: Record<string, string[]> = {
      'admin': ['admin', 'administrador'],
      'coach': ['coach', 'professor'],
      'student': ['student', 'aluno'],
    };
    
    // Verificar se o papel do usuário é diretamente permitido
    const hasDirectAccess = normalizedAllowedRoles.includes(normalizedUserRole);
    
    // Verificar se o papel do usuário tem um equivalente que é permitido
    const hasEquivalentAccess = Object.entries(roleEquivalents).some(([role, equivalents]) => {
      return equivalents.includes(normalizedUserRole) && normalizedAllowedRoles.includes(role);
    });
    
    // Negar acesso se nem acesso direto nem equivalente for concedido
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
