
import React, { createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useAuthState } from "@/hooks/use-auth-state";
import { useAuthActions } from "@/hooks/use-auth-actions";

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
  const { session, user, userRole, isLoading } = useAuthState();
  const { signIn, signUp, signOut } = useAuthActions();

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
