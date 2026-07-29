"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiPost } from "@/lib/api";

export interface AuthUser {
  id: string;
  businessName: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (businessName: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession() {
  if (typeof window === "undefined") {
    return { user: null, token: null };
  }

  const token = window.localStorage.getItem("token");
  const storedUser = window.localStorage.getItem("user");

  return {
    user: storedUser ? (JSON.parse(storedUser) as AuthUser) : null,
    token,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { user: storedUser } = readStoredSession();
    setUser(storedUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const payload = await apiPost<{ token: string; user: AuthUser }>('/api/auth/login', {
      email,
      password,
    });

    if (typeof window !== "undefined") {
      window.localStorage.setItem("token", payload.token);
      window.localStorage.setItem("user", JSON.stringify(payload.user));
    }

    setUser(payload.user);
    return payload.user;
  };

  const signup = async (businessName: string, email: string, password: string) => {
    const payload = await apiPost<{ token: string; user: AuthUser }>('/api/auth/register', {
      businessName,
      email,
      password,
    });

    if (typeof window !== "undefined") {
      window.localStorage.setItem("token", payload.token);
      window.localStorage.setItem("user", JSON.stringify(payload.user));
    }

    setUser(payload.user);
    return payload.user;
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("user");
    }

    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
