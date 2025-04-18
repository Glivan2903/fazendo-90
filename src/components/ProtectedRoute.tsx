
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: React.ReactNode;
  redirect?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles = [], 
  children, 
  redirect = '/auth'
}) => {
  const { user, loading, userRole } = useAuth();
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        setStatusLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setUserStatus(data.status);
      } catch (err) {
        console.error("Error checking user status:", err);
        setError("Erro ao verificar status do usuário");
      } finally {
        setStatusLoading(false);
      }
    };
    
    checkUserStatus();
  }, [user]);

  // Wait until auth is initialized and user status is checked
  if (loading || statusLoading) {
    return <LoadingSpinner />;
  }

  // Not logged in, redirect to login
  if (!user) {
    return <Navigate to={redirect} />;
  }

  // Check if user is active
  if (userStatus === 'Pendente') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Conta pendente de aprovação</AlertTitle>
            <AlertDescription>
              Sua conta foi criada, mas ainda está pendente de aprovação pelo administrador.
              Entre em contato com o suporte para mais informações.
            </AlertDescription>
          </Alert>
          
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold mb-4">Bem-vindo à Cross Box Fênix</h2>
            <p className="mb-6">
              Obrigado por se cadastrar! Seu perfil será analisado e aprovado em breve.
            </p>
            
            <button 
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no specific roles are required or user has appropriate role
  if (allowedRoles.length === 0 || (userRole && allowedRoles.includes(userRole))) {
    return <>{children}</>;
  }

  // User doesn't have required role
  return <Navigate to="/" />;
};

export default ProtectedRoute;
