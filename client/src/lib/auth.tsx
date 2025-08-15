import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData?: any
  ) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (
    updates: any
  ) => Promise<{ user: User | null; error: AuthError | null }>;
  resendVerificationEmail: (
    email: string
  ) => Promise<{ error: AuthError | null }>;
  clearInvalidSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Note: We no longer sync immediately on sign in
      // User sync will happen via database triggers or when needed
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync Supabase user with our custom users table
  const syncUserWithDatabase = async (authUser: User) => {
    try {
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            (
              await supabase.auth.getSession()
            ).data.session?.access_token
          }`,
        },
        body: JSON.stringify({
          id: authUser.id,
          email: authUser.email,
          firstName: authUser.user_metadata?.first_name || "",
          lastName: authUser.user_metadata?.last_name || "",
          profileImageUrl: authUser.user_metadata?.avatar_url || "",
          role: authUser.user_metadata?.role || "patron",
        }),
      });

      if (!response.ok) {
        console.error("Failed to sync user with database");
      }
    } catch (error) {
      console.error("Error syncing user:", error);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log("Attempting Supabase signup with:", { email, userData });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData?.first_name || "",
            last_name: userData?.last_name || "",
            role: userData?.role || "patron",
            profile_image_url: userData?.profile_image_url || "",
          },
        },
      });

      if (error) {
        console.error("Supabase signup error:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.status,
          statusCode: error.status,
        });
      } else {
        console.log("Supabase signup successful:", data);
      }

      return { user: data.user, error };
    } catch (err) {
      console.error("Unexpected signup error:", err);
      return {
        user: null,
        error: {
          message: `Unexpected error: ${
            err instanceof Error ? err.message : "Unknown error"
          }`,
          status: 500,
        } as any,
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { user: data.user, error };
  };

  const signOut = async () => {
    try {
      console.log("Starting sign out process...");

      // Clear local state first
      setSession(null);
      setUser(null);

      // Clear all Supabase-related storage items
      const allKeys = Object.keys(localStorage);
      const supabaseKeys = allKeys.filter(
        (key) =>
          key.includes("supabase") ||
          key.includes("sb-") ||
          key.includes("auth-token") ||
          key.includes("jjcjmuxjbrubdwuxvovy")
      );

      supabaseKeys.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Also clear sessionStorage
      const sessionKeys = Object.keys(sessionStorage);
      const supabaseSessionKeys = sessionKeys.filter(
        (key) =>
          key.includes("supabase") ||
          key.includes("sb-") ||
          key.includes("auth-token") ||
          key.includes("jjcjmuxjbrubdwuxvovy")
      );

      supabaseSessionKeys.forEach((key) => {
        sessionStorage.removeItem(key);
      });

      // Sign out from Supabase after clearing storage
      const { error } = await supabase.auth.signOut({
        scope: "global", // Sign out from all sessions
      });

      if (error) {
        console.error("Supabase sign out error:", error);
      }

      console.log("Sign out completed successfully");
      return { error };
    } catch (err) {
      console.error("Unexpected error during sign out:", err);

      // Even if there's an error, ensure local state is cleared
      setSession(null);
      setUser(null);

      return { error: err as any };
    }
  };

  const updateProfile = async (updates: any) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    return { user: data.user, error };
  };

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    return { error };
  };

  const clearInvalidSession = async () => {
    console.log("Manually clearing invalid session...");

    try {
      // Try to sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during Supabase sign out:", error);
    }

    // Clear local state
    setSession(null);
    setUser(null);

    // Clear only auth-related storage items
    try {
      const authKeys = [
        "supabase.auth.token",
        "sb-jjcjmuxjbrubdwuxvovy-auth-token",
        "sb-auth-token",
      ];

      authKeys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      console.log("Invalid session cleared successfully");
    } catch (storageError) {
      console.error("Error clearing storage:", storageError);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resendVerificationEmail,
    clearInvalidSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook to get the current user's profile from our database
export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setProfile(null);
      setLoading(false);
      setError(null);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${
            (
              await supabase.auth.getSession()
            ).data.session?.access_token
          }`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const userData = await response.json();
        console.log("User profile from database:", userData);
        setProfile(userData);
      } else {
        console.warn(
          "Failed to fetch user profile:",
          response.status,
          response.statusText
        );
        setError(`Failed to load profile: ${response.status}`);
        // Don't throw error, just set profile to null and continue
        setProfile(null);
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      if (error.name === "AbortError") {
        setError("Profile loading timed out");
      } else {
        setError("Failed to load profile");
      }
      // Set profile to null so the app can continue
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, refetch: fetchUserProfile };
}
