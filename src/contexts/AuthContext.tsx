
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import {
  Session,
  User as SupabaseUser,
} from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  userRole: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        setSession(initialSession);
        setUser(initialSession?.user || null);

        if (initialSession?.user) {
          await fetchUserRole(initialSession.user.id);
        }
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
        toast.error("Erro ao carregar sessão");
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        fetchUserRole(currentSession.user.id);
      } else {
        setUserRole(null);
      }
    });
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      if (user?.email === "matheusprograming@gmail.com") {
        console.log("Admin email detected, setting role to admin");
        setUserRole("admin");
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Erro ao obter role do usuário:", error);
        setUserRole("student");
      } else if (data) {
        console.log("Role encontrada:", data.role);
        setUserRole(data.role);
      } else {
        console.log("Nenhum perfil encontrado, definindo como student");
        setUserRole("student");
      }
    } catch (error) {
      console.error("Erro ao obter role do usuário:", error);
      setUserRole("student");
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      navigate("/check-in");
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao fazer login:", error.message);
      toast.error("Erro ao fazer login: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) throw error;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user?.id,
          name,
          email,
          role: 'student',
          status: 'Ativo'
        });

      if (profileError) throw profileError;

      navigate("/check-in");
      toast.success("Conta criada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao criar conta:", error.message);
      toast.error("Erro ao criar conta: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
      navigate("/auth");
      toast.success("Logout realizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error.message);
      toast.error("Erro ao fazer logout: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    userRole,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
