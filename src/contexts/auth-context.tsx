"use client";

import { usePathname } from "next/navigation";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  user: { id: string; avatar: string; token: string } | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true); // To handle initial load

  const pathname = usePathname();

  useEffect(() => {
    console.log("AuthContext: Checking auth state on path change to:", pathname); // For debugging
    
    try {
      const token = localStorage.getItem("app_token");
      const id = localStorage.getItem("id");
      const avatar = localStorage.getItem("avatar");

      if (token && id && avatar) {
        setUser({ id, avatar, token });
      } else {
        setUser(null);
      }

    } catch (error) {
      console.error("Failed to access localStorage:", error);
      setUser(null); // Ensure user is null on error

    } finally {

      setIsLoading(false);
    }
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem("app_token");
    localStorage.removeItem("id");
    localStorage.removeItem("avatar");
    
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The custom hook to easily consume the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};