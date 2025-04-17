
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
  signUp: (email: string, password: string, name: string, plan: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasActiveSubscription: boolean;
  checkSubscriptionStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const navigate = useNavigate();

  // Check if the user has an active subscription
  const checkSubscriptionStatus = async (userId?: string) => {
    try {
      const id = userId || user?.id;
      if (!id) return false;

      // Check for active subscription with valid payment
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          end_date,
          payments (
            status
          )
        `)
        .eq('user_id', id)
        .gte('end_date', today)
        .order('end_date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error checking subscription:", error);
        return false;
      }

      if (!data) {
        console.log("No active subscription found");
        return false;
      }

      // Check if the subscription has at least one payment with status 'paid'
      const hasPaidPayment = data.payments && 
        Array.isArray(data.payments) && 
        data.payments.some(p => p.status === 'paid');

      console.log("Subscription check result:", { 
        subscriptionId: data.id, 
        endDate: data.end_date, 
        hasPaidPayment 
      });

      setHasActiveSubscription(hasPaidPayment);
      return hasPaidPayment;
    } catch (error) {
      console.error("Exception checking subscription:", error);
      setHasActiveSubscription(false);
      return false;
    }
  };

  useEffect(() => {
    console.log("AuthProvider: Setting up auth listener");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, !!currentSession);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Fetch user role after auth state changes, but defer it
        if (currentSession?.user) {
          setTimeout(async () => {
            await fetchUserRole(currentSession.user.id);
            // Check subscription status after fetching role
            await checkSubscriptionStatus(currentSession.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setHasActiveSubscription(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log("Initial session check:", !!currentSession);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await fetchUserRole(currentSession.user.id);
        // Check subscription status after initial session check
        await checkSubscriptionStatus(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log("Fetching user role for:", userId);
      
      // Special case for admin email
      const { data: userEmail } = await supabase.auth.getUser();
      if (userEmail?.user?.email === "matheusprograming@gmail.com") {
        console.log("Admin email detected, setting role as admin");
        setUserRole("admin");
        setIsLoading(false);
        return;
      }
      
      // Query the profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("Error fetching user role:", error);
        
        // Verify if the user exists but doesn't have a profile
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser?.user) {
          console.log("User exists in auth, but no profile. Creating profile.");
          
          // Create profile for user with default role
          const defaultRole = 'student'; // Using student as default role
          
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([
              {
                id: userId,
                name: authUser.user.user_metadata?.name || 'User',
                email: authUser.user.email,
                role: defaultRole,
                status: 'Inativo' // Default to inactive until subscription is verified
              }
            ]);
            
          if (insertError) {
            console.error("Error creating user profile:", insertError);
          } else {
            console.log(`Profile created successfully with role '${defaultRole}'`);
            setUserRole(defaultRole);
          }
        }
      } else if (data) {
        console.log("Profile found, role:", data.role, "status:", data.status);
        setUserRole(data.role);
        
        // If user status is Inativo, force check subscription
        if (data.status === 'Inativo') {
          const isActive = await checkSubscriptionStatus(userId);
          
          // Update user status if subscription is active
          if (isActive) {
            await supabase
              .from("profiles")
              .update({ status: 'Ativo' })
              .eq('id', userId);
          }
        }
      }
    } catch (error) {
      console.error("Exception when fetching user role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      // Check if user has active subscription
      const isActive = await checkSubscriptionStatus(data.user.id);
      
      if (!isActive && data.user.email !== "matheusprograming@gmail.com") {
        // Automatically log out if subscription is not active
        await supabase.auth.signOut();
        toast.error("Sua assinatura não está ativa. Entre em contato com o administrador.");
        setUser(null);
        setSession(null);
        return;
      }
      
      toast.success("Login realizado com sucesso!");
      navigate("/check-in");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, plan: string = 'Mensal') => {
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
      
      // Create profile entry with selected plan
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              name,
              email,
              role: "student",
              plan,
              status: 'Ativo' // Initially active when subscription is created
            }
          ]);
          
        if (profileError) throw profileError;

        // Create initial subscription
        const start = new Date();
        const end = new Date();
        
        // Set end date based on plan
        switch (plan) {
          case 'Trimestral':
            end.setMonth(end.getMonth() + 3);
            break;
          case 'Anual':
            end.setMonth(end.getMonth() + 12);
            break;
          default: // Mensal
            end.setMonth(end.getMonth() + 1);
        }

        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert([
            {
              user_id: data.user.id,
              start_date: start.toISOString().split('T')[0],
              end_date: end.toISOString().split('T')[0]
            }
          ]);

        if (subscriptionError) throw subscriptionError;
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
        signOut,
        hasActiveSubscription,
        checkSubscriptionStatus
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
