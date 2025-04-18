import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

interface AuthContextProps {
  user: User | null;
  userRole: string | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  userRole: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  setUserRole: () => {}
});

const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }

    return data?.role || null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signIn = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Check your email for the login link!');
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error fetching session:", error);
        setIsLoading(false);
        return;
      }
      
      if (data?.session?.user) {
        setUser(data.session.user);
        const userRole = await getUserRole(data.session.user.id);
        setUserRole(userRole);
        
        // Redirect admin users to teacher dashboard if they're at the root route
        if (userRole === 'admin' && window.location.pathname === '/') {
          window.location.href = '/teacher-dashboard';
        }
      }
      
      setIsLoading(false);
    };
    
    fetchSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
        if (session?.user) {
          const userRole = await getUserRole(session.user.id);
          setUserRole(userRole);
          
          // Redirect admin users to teacher dashboard after login
          if (userRole === 'admin') {
            window.location.href = '/teacher-dashboard';
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextProps = {
    user,
    userRole,
    isLoading,
    signIn,
    signOut,
    setUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
