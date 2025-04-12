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
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Fetch user role after auth state changes, but defer it
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserRole(currentSession.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
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
      // Primeiro, tentamos buscar com .single(), mas com tratamento de erro
      const { data, error } = await supabase
        .from("profiles")
        .select("role, name, email")
        .eq("id", userId)
        .maybeSingle();  // Usamos maybeSingle ao invés de single para não lançar erro se não encontrar
        
      if (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        
        // Se o perfil do usuário não existir, tentamos criá-lo
        if (error.code === "PGRST116") {  // "JSON object requested, multiple (or no) rows returned"
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            const { error: insertError } = await supabase
              .from("profiles")
              .insert([
                {
                  id: userId,
                  name: userData.user.user_metadata?.name || 'Usuário',
                  email: userData.user.email,
                  role: 'member' // Papel padrão
                }
              ]);
              
            if (insertError) {
              console.error("Erro ao criar perfil do usuário:", insertError);
            } else {
              setUserRole('member');
            }
          }
        }
      } else if (data) {
        // Define a função do usuário se o perfil for encontrado
        setUserRole(data.role || null);
        console.log("Perfil do usuário carregado:", data);
      } else {
        // Se não houver erro, mas também não houver dados, o perfil não existe
        console.log("Perfil do usuário não encontrado, definindo papel como 'member'");
        setUserRole('member');
      }
    } catch (error) {
      console.error("Exceção ao buscar papel do usuário:", error);
      setUserRole(null);
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
      
      // Create profile entry
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              name,
              email,
              role: "student" // Default role
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
