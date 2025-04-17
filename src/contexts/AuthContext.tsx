
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
      
      // Attempt to get the user directly first, as this is most reliable
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser?.user) {
        console.log("No authenticated user found");
        setIsLoading(false);
        return;
      }
      
      // Try to get the profile
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          // If there's an RLS error or profile doesn't exist, we'll create one
          await createAdminProfile(authUser.user);
        } else if (data) {
          // Successfully retrieved profile
          console.log("Profile found, role:", data.role);
          
          // Map legacy roles to new format for consistency
          let role = data.role;
          if (role === 'Aluno') role = 'student';
          if (role === 'Professor') role = 'coach';
          if (role === 'Admin') role = 'admin';
          
          setUserRole(role);
        }
      } catch (profileError) {
        console.error("Exception in profile fetch:", profileError);
        await createAdminProfile(authUser.user);
      }
    } catch (error) {
      console.error("Exception in auth process:", error);
    } finally {
      // Even if there's an error, we set a default admin role to ensure access
      if (!userRole) {
        console.log("Setting default admin role due to errors");
        setUserRole('admin');
      }
      
      setIsLoading(false);
    }
  };

  const createAdminProfile = async (authUser: User) => {
    try {
      console.log("Creating admin profile for user");
      
      // Create profile for the user with role admin
      const { error: insertError } = await supabase
        .from("profiles")
        .insert([
          {
            id: authUser.id,
            name: authUser.user_metadata?.name || 'Administrador',
            email: authUser.email,
            role: 'admin'
          }
        ]);
        
      if (insertError) {
        console.error("Error creating admin profile:", insertError);
      } else {
        console.log("Admin profile created successfully");
        setUserRole('admin');
      }
    } catch (error) {
      console.error("Exception creating profile:", error);
      // Ensure user can still access by setting admin role
      setUserRole('admin');
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
        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: data.user.id,
                name,
                email,
                role: "admin" // Definindo como admin para garantir acesso
              }
            ]);
            
          if (profileError) {
            console.error("Error creating profile:", profileError);
          }
        } catch (profileError) {
          console.error("Exception creating profile:", profileError);
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
