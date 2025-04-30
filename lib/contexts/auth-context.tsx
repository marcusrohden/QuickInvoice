'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  signIn as nextAuthSignIn, 
  signOut as nextAuthSignOut,
  useSession
} from "next-auth/react";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type AuthContextType = {
  user: User | null;
  status: 'authenticated' | 'loading' | 'unauthenticated';
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  const user = session?.user as User || null;

  // Sign in with credentials
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        return false;
      }

      return true;
    } catch (error) {
      setError('An error occurred during sign in');
      return false;
    }
  };

  // Register a new user
  const signUp = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred during registration');
        return false;
      }

      // Auto sign in after successful registration
      const signInResult = await signIn(email, password);
      return signInResult;
    } catch (error) {
      setError('An error occurred during registration');
      return false;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await nextAuthSignOut({ redirect: false });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        status: status as 'authenticated' | 'loading' | 'unauthenticated',
        signIn,
        signUp,
        signOut,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}