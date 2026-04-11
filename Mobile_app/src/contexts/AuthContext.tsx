import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  setIsAuthenticating: (val: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isGuest: true,
  loading: true,
  setIsAuthenticating: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Subscribe to auth state changes first so we don't miss any events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Timeout fallback for white-screen safety
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Supabase session fetch timed out - defaulting to guest mode.");
        setLoading(false);
      }
    }, 3000);

    // Then get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeoutId);
      setSession(session);
      setLoading(false);
    }).catch((err) => {
      clearTimeout(timeoutId);
      console.error("Supabase getSession error:", err);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user: session?.user ?? null, 
      isGuest: !loading && !session?.user,
      loading: loading || isAuthenticating, 
      setIsAuthenticating, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
