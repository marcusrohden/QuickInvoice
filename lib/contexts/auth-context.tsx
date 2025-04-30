'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react';

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

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const [error, setError] = useState<string | null>(null);
  
  // Map NextAuth session status to our status type
  const status = sessionStatus === 'loading' 
    ? 'loading' 
    : sessionStatus === 'authenticated' 
      ? 'authenticated' 
      : 'unauthenticated';
  
  // Make user property from session if available
  const user = session?.user as User | null;
  
  // Clear error on status change
  useEffect(() => {
    if (status !== 'unauthenticated') {
      setError(null);
    }
  }, [status]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (response?.error) {
        setError(response.error);
        return false;
      }
      
      return true;
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign in error:', err);
      return false;
    }
  };
  
  // Sign up function
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
        setError(data.error || 'Registration failed');
        return false;
      }
      
      // Auto sign in after successful registration
      return await signIn(email, password);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign up error:', err);
      return false;
    }
  };
  
  // Sign out function
  const signOut = async () => {
    try {
      await nextAuthSignOut({ redirect: false });
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, status, signIn, signUp, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}