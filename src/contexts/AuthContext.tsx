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
  hasActiveSubscription: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
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
          await checkSubscription(initialSession.user.id);
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
        checkSubscription(currentSession.user.id);
      } else {
        setUserRole(null);
        setHasActiveSubscription(false);
      }
    });
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("get_user_role", {
        body: { user_id: userId },
      });

      if (error) {
        console.error("Erro ao obter role do usuário:", error);
        setUserRole("student");
      } else {
        setUserRole(data as string);
      }
    } catch (error) {
      console.error("Erro ao invocar função para obter role:", error);
      setUserRole("student");
    }
  };

  const checkActiveSubscription = useCallback(async (userId: string) => {
    const { data: payments, error } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('aluno_id', userId)
      .eq('status', 'pago')
      .order('data_vencimento', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error checking subscription:', error);
      return false;
    }

    if (!payments || payments.length === 0) {
      return false;
    }

    const lastPayment = payments[0];
    const today = new Date();
    const dueDate = new Date(lastPayment.data_vencimento);
    
    return dueDate >= today;
  }, []);

  const checkSubscription = async (userId: string) => {
    try {
      const isActive = await checkActiveSubscription(userId);
      setHasActiveSubscription(isActive);
    } catch (error) {
      console.error("Erro ao verificar assinatura:", error);
      setHasActiveSubscription(false);
    }
  };

  const signIn = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      toast.success("Verifique seu email para confirmar o login!");
    } catch (error: any) {
      console.error("Erro ao fazer login:", error.message);
      toast.error("Erro ao fazer login: " + error.message);
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
    hasActiveSubscription,
    signIn,
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
