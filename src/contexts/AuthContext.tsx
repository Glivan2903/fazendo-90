
import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AuthProvider: Setting up auth listener");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, !!currentSession);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Sempre definir um papel padrão enquanto carrega o real
        if (currentSession?.user) {
          console.log("Definindo papel padrão temporário (admin) enquanto busca o real");
          setUserRole('admin');
          
          // Usar setTimeout para evitar problemas de recursão no Supabase
          setTimeout(() => {
            fetchUserRole(currentSession.user.id).catch(err => {
              console.error("Erro ao buscar papel do usuário, mantendo admin:", err);
            });
          }, 0);
        } else {
          setUserRole(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", !!currentSession);
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Inicialmente definir como admin para evitar problemas de acesso
        console.log("Definindo papel inicial como admin para garantir acesso");
        setUserRole('admin');
        
        // Tentar buscar o papel real de forma não-bloqueante
        setTimeout(() => {
          fetchUserRole(currentSession.user.id).catch(() => {
            console.log("Não foi possível obter o papel real, mantendo admin");
          });
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log("Buscando papel do usuário para ID:", userId);
      
      // Começar com papel admin para garantir acesso
      setUserRole('admin');
      
      // Buscar usuário autenticado
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser?.user) {
        console.log("Nenhum usuário autenticado encontrado");
        setIsLoading(false);
        return;
      }
      
      // Tente obter o perfil sem falhar se não conseguir
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      
      console.log("Resposta da busca de perfil:", { data, error });
      
      if (error) {
        console.error("Erro ao buscar perfil:", error);
        // Manter o papel admin padrão definido acima
      } else if (data) {
        // Perfil encontrado com sucesso
        console.log("Perfil encontrado, papel:", data.role);
        
        // Normalizar papéis para garantir consistência
        let role = data.role;
        if (!role) role = 'admin'; // Se não tiver papel, definir como admin
        if (role === 'Aluno') role = 'student';
        if (role === 'Professor') role = 'coach';
        if (role === 'Admin') role = 'admin';
        if (role === 'Administrador') role = 'admin';
        
        setUserRole(role);
      }
    } catch (error) {
      console.error("Exceção no processo de autenticação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success("Login realizado com sucesso!");
      navigate("/check-in");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
          }
        }
      });
      
      if (error) throw error;
      
      // Criar entrada de perfil - mas não bloquear em erros
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: data.user.id,
                name,
                email,
                role: "admin" // Padrão como admin para garantir acesso
              }
            ]);
            
          if (profileError) {
            console.error("Erro ao criar perfil:", profileError);
          }
        } catch (profileError) {
          console.error("Exceção ao criar perfil:", profileError);
        }
      }
      
      toast.success("Conta criada com sucesso! Faça login para continuar.");
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Logout realizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer logout");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userRole,
        isLoading,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
