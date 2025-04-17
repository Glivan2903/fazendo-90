
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
        
        // Fetch user role after auth state changes, but defer it
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserRole(currentSession.user.id);
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
        fetchUserRole(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log("Fetching user role for:", userId);
      
      // Use type assertion for the RPC function
      const { data, error } = await supabase
        .rpc('get_user_role', { user_id: userId }) as { data: string | null, error: any };
      
      if (error) {
        console.error("Erro ao buscar papel do usuário via RPC:", error);
        
        // Fallback para consulta direta à tabela profiles
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();
        
        if (profileError) {
          console.error("Erro ao buscar perfil do usuário:", profileError);
          
          // Verificar se o usuário existe mas não tem perfil
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser?.user) {
            console.log("Usuário existe na auth, mas sem perfil. Criando perfil.");
            
            // Criar perfil para o usuário com role padrão
            const defaultRole = 'admin'; // Temporariamente definindo como admin para diagnóstico
            
            const { error: insertError } = await supabase
              .from("profiles")
              .insert([
                {
                  id: userId,
                  name: authUser.user.user_metadata?.name || 'Usuário',
                  email: authUser.user.email,
                  role: defaultRole
                }
              ]);
              
            if (insertError) {
              console.error("Erro ao criar perfil do usuário:", insertError);
            } else {
              console.log(`Perfil criado com sucesso como '${defaultRole}'`);
              setUserRole(defaultRole);
            }
          }
        } else if (profileData) {
          console.log("Perfil encontrado, papel:", profileData.role);
          setUserRole(profileData.role);
        }
      } else {
        console.log("Papel obtido via RPC:", data);
        if (typeof data === 'string') {
          setUserRole(data);
        } else if (data === null) {
          setUserRole(null);
        } else {
          // Converting unexpected types to string
          console.warn("Unexpected data type from RPC:", typeof data);
          setUserRole(String(data));
        }
      }
    } catch (error) {
      console.error("Exceção ao buscar papel do usuário:", error);
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
      
      // Create profile entry with admin role for testing
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              name,
              email,
              role: "admin" // Temporariamente definindo todos novos usuários como admin
            }
          ]);
          
        if (profileError) throw profileError;
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
