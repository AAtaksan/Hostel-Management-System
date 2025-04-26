import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

// Define types
interface User {
  id: string;
  email: string;
  name?: string;
  profilePic?: string;
  phone?: string;
  address?: string;
  department?: string;
  yearOfStudy?: number;
  user_metadata?: {
    name?: string;
    role?: 'student' | 'admin';
  };
}

interface AuthContextType {
  user: User | null;
  session: any;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'student' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: false,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  isAdmin: false,
  isStudent: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize session
    const initializeSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (data.session) {
        setSession(data.session);
        const userData = data.session.user as User;
        
        // Add name from metadata for easier access
        if (userData.user_metadata?.name) {
          userData.name = userData.user_metadata.name;
        }
        
        setUser(userData);
      }
    };

    initializeSession();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session?.user) {
        const userData = session.user as User;
        
        // Add name from metadata for easier access
        if (userData.user_metadata?.name) {
          userData.name = userData.user_metadata.name;
        }
        
        setUser(userData);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'student' | 'admin'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) throw error;
      
      // In a real app, you would create a record in a profiles or users table
      if (data.user) {
        await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              name,
              role,
            },
          ]);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'An error occurred during logout');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = user?.user_metadata?.role === 'admin';
  const isStudent = user?.user_metadata?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        error,
        login,
        signup,
        logout,
        isAdmin,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};