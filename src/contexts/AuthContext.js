'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Create the authentication context
const AuthContext = createContext();

/**
 * AuthProvider component to manage authentication state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from Supabase session
  useEffect(() => {
    // Get current session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (email, password) => {
    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (error) {
        throw error;
      }
  
      // Update user info in the users table
      if (data.user) {
        // Extract the email prefix (e.g., "john" from "john@example.com")
        let baseUsername = data.user.email.split('@')[0].toLowerCase();
        let username = baseUsername;
        let suffix = 1;
  
        // Check if the username already exists, and append a suffix if needed
        while (true) {
          const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single();
  
          if (checkError && checkError.code !== 'PGRST116') {
            throw checkError; // Handle unexpected errors
          }
  
          if (!existingUser) {
            break; // Username is unique, proceed with it
          }
  
          // Username exists, append a suffix and try again
          username = `${baseUsername}_${suffix}`;
          suffix++;
        }
  
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            username: username, // Use the unique username
            full_name: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
  
        if (profileError) {
          console.error('Error creating/updating profile:', profileError.message, profileError.details, profileError);
          throw profileError;
        }
      }
  
      return data;
    } catch (error) {
      console.error('Error signing up:', error.message, error.details, error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Get user profile
  const getUserProfile = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Context value
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getUserProfile,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
