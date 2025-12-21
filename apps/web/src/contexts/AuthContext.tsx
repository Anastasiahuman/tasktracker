"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "@/lib/apiClient";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!USE_API) {
      setIsLoading(false);
      return;
    }

    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const userData = await apiClient.get<User>("/auth/me");
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, name?: string) => {
    if (!USE_API) return;

    const response = await apiClient.post<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>("/auth/dev-login", { email, name });

    await apiClient.setAuthTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
  };

  const logout = async () => {
    if (!USE_API) return;

    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore errors on logout
    }
    await apiClient.clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

