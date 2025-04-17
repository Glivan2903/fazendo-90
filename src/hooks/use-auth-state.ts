
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: Setting up auth listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, !!currentSession);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
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
      
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser?.user) {
          console.log("Usuário existe na auth, mas sem perfil. Criando perfil.");
          
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([
              {
                id: userId,
                name: authUser.user.user_metadata?.name || 'Usuário',
                email: authUser.user.email,
                role: 'student'
              }
            ]);
            
          if (insertError) {
            console.error("Erro ao criar perfil do usuário:", insertError);
          } else {
            console.log("Perfil criado com sucesso como 'student'");
            setUserRole('student');
          }
        }
      } else if (data) {
        console.log("Perfil encontrado, papel:", data.role);
        setUserRole(data.role);
      }
    } catch (error) {
      console.error("Exceção ao buscar papel do usuário:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { session, user, userRole, isLoading };
};
