"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { api } from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: "candidate" | "recruiter";
  isGuest?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  authError: string;
  authLoading: boolean;
  setAuthError: (err: string) => void;
  signIn: (email: string, pass: string) => Promise<boolean>;
  signUp: (email: string, pass: string, username?: string, role?: "candidate" | "recruiter") => Promise<boolean>;
  signOut: () => Promise<void>;
  enterSandboxMode: () => void;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (newUsername: string) => Promise<boolean>;
  setUserRole: (role: "candidate" | "recruiter") => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  authError: "",
  authLoading: false,
  setAuthError: () => {},
  signIn: async () => false,
  signUp: async () => false,
  signOut: async () => {},
  enterSandboxMode: () => {},
  signInWithGoogle: async () => {},
  updateProfile: async () => false,
  setUserRole: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Sync token state to the api client automatically
  useEffect(() => {
    api.setToken(token);
  }, [token]);

  // Load guest user or saved auth user on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Check if real user is saved
      const savedUser = localStorage.getItem("mock_auth_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          const t = `mock_token:${parsed.id}:${parsed.email}:${parsed.username}`;
          setToken(t);
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem("mock_auth_user");
        }
      }

      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase!.auth.getSession();
        if (session) {
          const t = session.access_token;
          setToken(t);
          api.setToken(t);
          const parsedUser = {
            id: session.user.id,
            email: session.user.email ?? "",
            username: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "",
            role: (session.user.user_metadata?.role as "candidate" | "recruiter") || "candidate",
            isGuest: false
          };
          setUser(parsedUser);
          setLoading(false);
          return;
        }
      }

      // Default: load or generate Guest session
      let guestId = localStorage.getItem("guest_user_id");
      if (!guestId) {
        guestId = "guest_" + Math.random().toString(36).substring(2, 11);
        localStorage.setItem("guest_user_id", guestId);
      }
      const guestUser = {
        id: guestId,
        email: `${guestId}@hunterai.local`,
        username: "Guest User",
        role: "candidate" as const,
        isGuest: true
      };
      const guestToken = `mock_token:${guestUser.id}:${guestUser.email}:${guestUser.username}`;
      setUser(guestUser);
      setToken(guestToken);
      api.setToken(guestToken);
      setLoading(false);
    };

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          const t = session.access_token;
          setToken(t);
          api.setToken(t);
          const parsedUser = {
            id: session.user.id,
            email: session.user.email ?? "",
            username: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "",
            role: (session.user.user_metadata?.role as "candidate" | "recruiter") || "candidate",
            isGuest: false
          };
          setUser(parsedUser);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email: string, pass: string): Promise<boolean> => {
    if (!email || !pass) return false;
    setAuthError("");
    setAuthLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase!.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        if (data.session && data.user) {
          const t = data.session.access_token;
          setToken(t);
          api.setToken(t);
          const newUser = {
            id: data.user.id,
            email: data.user.email ?? "",
            username: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split("@")[0] || "",
            role: (data.user.user_metadata?.role as "candidate" | "recruiter") || "candidate",
            isGuest: false
          };
          setUser(newUser);
          // Fetch role from backend profile
          try {
            const profile = await api.getProfile();
            if (profile.role) {
              newUser.role = profile.role;
              setUser({ ...newUser });
            }
          } catch (e) { /* ignore */ }
          return true;
        }
      } else {
        // Mock login
        const newUser = {
          id: `mock_user_${email.replace(/[^a-zA-Z0-9]/g, "")}`,
          email,
          username: email.split("@")[0],
          role: "candidate" as const,
          isGuest: false
        };
        const t = `mock_token:${newUser.id}:${newUser.email}:${newUser.username}`;
        setUser(newUser);
        setToken(t);
        api.setToken(t);
        localStorage.setItem("mock_auth_user", JSON.stringify(newUser));
        // Fetch role from backend
        try {
          const profile = await api.getProfile();
          if (profile.role) {
            newUser.role = profile.role;
            setUser({ ...newUser });
            localStorage.setItem("mock_auth_user", JSON.stringify(newUser));
          }
        } catch (e) { /* ignore */ }
        return true;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to sign in";
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
    return false;
  };

  const signUp = async (email: string, pass: string, username?: string, role?: "candidate" | "recruiter"): Promise<boolean> => {
    if (!email || !pass) return false;
    setAuthError("");
    setAuthLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase!.auth.signUp({
          email,
          password: pass,
          options: {
            data: {
              name: username || email.split("@")[0],
              username: username || email.split("@")[0],
            }
          }
        });
        if (error) throw error;
        if (data.session && data.user) {
          const t = data.session.access_token;
          setToken(t);
          api.setToken(t);
          const newUser = {
            id: data.user.id,
            email: data.user.email ?? "",
            username: data.user.user_metadata?.username || data.user.user_metadata?.name || data.user.email?.split("@")[0] || "",
            role: role || "candidate",
            isGuest: false
          };
          setUser(newUser);
          // Set role on backend
          if (role) {
            try { await api.saveProfile({ role }); } catch (e) { /* ignore */ }
          }
          return true;
        } else {
          setAuthError("Verification email sent! Please check your inbox.");
          return false;
        }
      } else {
        // Mock sign up
        const newUser = {
          id: `mock_user_${email.replace(/[^a-zA-Z0-9]/g, "")}`,
          email,
          username: username || email.split("@")[0],
          role: role || "candidate",
          isGuest: false
        };
        const t = `mock_token:${newUser.id}:${newUser.email}:${newUser.username}`;
        setUser(newUser);
        setToken(t);
        api.setToken(t);
        localStorage.setItem("mock_auth_user", JSON.stringify(newUser));
        // Set role on backend
        if (role) {
          try { await api.saveProfile({ role }); } catch (e) { /* ignore */ }
        }
        return true;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to sign up";
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
    return false;
  };

  const enterSandboxMode = () => {
    const sandboxUser = {
      id: "mock_user_demo",
      email: "demo@hunterai.local",
      username: "Demo User",
      role: "candidate" as const,
      isGuest: false
    };
    const t = `mock_token:${sandboxUser.id}:${sandboxUser.email}:${sandboxUser.username}`;
    setUser(sandboxUser);
    setToken(t);
    api.setToken(t);
    localStorage.setItem("mock_auth_user", JSON.stringify(sandboxUser));
  };

  const signInWithGoogle = async (): Promise<void> => {
    setAuthError("");
    setAuthLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase!.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (error) throw error;
      } else {
        // Mock Google sign in
        const newUser = {
          id: "mock_google_user",
          email: "google_user@example.com",
          username: "Google User",
          role: "candidate" as const,
          isGuest: false
        };
        const t = `mock_token:${newUser.id}:${newUser.email}:${newUser.username}`;
        setUser(newUser);
        setToken(t);
        api.setToken(t);
        localStorage.setItem("mock_auth_user", JSON.stringify(newUser));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to sign in with Google";
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const updateProfile = async (newUsername: string): Promise<boolean> => {
    if (!newUsername) return false;
    setAuthLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase!.auth.updateUser({
          data: { name: newUsername, full_name: newUsername }
        });
        if (error) throw error;
        if (data.user) {
          const updatedUser: AuthUser = {
            id: data.user.id,
            email: data.user.email ?? "",
            username: newUsername,
            role: user?.role || "candidate",
            isGuest: false
          };
          setUser(updatedUser);
          try {
            await api.saveProfile({ username: newUsername });
          } catch (e) {
            console.error("Failed to sync profile name with backend:", e);
          }
          return true;
        }
      } else {
        if (user) {
          const updatedUser = { ...user, username: newUsername };
          setUser(updatedUser);
          if (!user.isGuest) {
            localStorage.setItem("mock_auth_user", JSON.stringify(updatedUser));
            const t = `mock_token:${updatedUser.id}:${updatedUser.email}:${updatedUser.username}`;
            setToken(t);
            api.setToken(t);
          }
          try {
            await api.saveProfile({ username: newUsername });
          } catch (e) {
            console.error("Failed to sync profile name with backend:", e);
          }
          return true;
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update profile";
      console.error(errorMsg);
    } finally {
      setAuthLoading(false);
    }
    return false;
  };

  const signOut = async () => {
    setLoading(true);
    if (isSupabaseConfigured) {
      await supabase!.auth.signOut();
    }
    localStorage.removeItem("mock_auth_user");
    
    // Clear token & regenerate guest session
    setUser(null);
    setToken(null);
    
    const guestId = "guest_" + Math.random().toString(36).substring(2, 11);
    localStorage.setItem("guest_user_id", guestId);
    
    const guestUser = {
      id: guestId,
      email: `${guestId}@hunterai.local`,
      username: "Guest User",
      role: "candidate" as const,
      isGuest: true
    };
    const guestToken = `mock_token:${guestUser.id}:${guestUser.email}:${guestUser.username}`;
    setUser(guestUser);
    setToken(guestToken);
    setLoading(false);
  };

  const setUserRole = async (role: "candidate" | "recruiter"): Promise<boolean> => {
    try {
      await api.saveProfile({ role });
      if (user) {
        const updated = { ...user, role };
        setUser(updated);
        if (!user.isGuest) {
          localStorage.setItem("mock_auth_user", JSON.stringify(updated));
        }
      }
      return true;
    } catch (e) {
      console.error("Failed to set role:", e);
      return false;
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-base)" }}>
        <div style={{ width: 44, height: 44, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, authError, authLoading, setAuthError, signIn, signUp, signOut, enterSandboxMode, signInWithGoogle, updateProfile, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}
