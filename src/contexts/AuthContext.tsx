"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface AuthContextType {
  currentUser: User | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchMe = async (token?: string) => {
    try {
      const headers: any = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        const storedToken = localStorage.getItem("accessToken");
        if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;
      }

      if (!headers["Authorization"]) {
        throw new Error("No token");
      }

      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/me", {
        headers
      });

      if (res.ok) {
        const userData = await res.json();
        setCurrentUser({
          id: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          createdAt: userData.createdAt
        });
      } else {
        throw new Error("Invalid session");
      }
    } catch (err) {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken === "mock-admin-token") {
        setCurrentUser({ id: "1", name: "Demo Admin", email: "admin@ingres.gov", role: "Admin" });
      } else if (storedToken === "mock-researcher-token") {
        setCurrentUser({ id: "2", name: "Demo Researcher", email: "researcher@ingres.gov", role: "Researcher" });
      } else if (storedToken === "mock-gov-token") {
        setCurrentUser({ id: "3", name: "Gov Officer", email: "officer@ingres.gov", role: "Government Officer" });
      } else if (storedToken === "mock-public-token") {
        setCurrentUser({ id: "4", name: "Public User", email: "user@ingres.gov", role: "Public User" });
      } else {
        setCurrentUser(null);
        localStorage.removeItem("accessToken");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem("accessToken", token);
    setCurrentUser(user);
    router.push("/dashboard");
  };

  const logout = async () => {
    try {
      await fetch("http://127.0.0.1:8000/api/v1/auth/logout", {
        method: "POST",
      });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("accessToken");
    setCurrentUser(null);
    router.push("/login");
  };

  const refreshSession = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/refresh", {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("accessToken", data.access_token);
        await fetchMe(data.access_token);
      } else {
        throw new Error("Refresh failed");
      }
    } catch (e) {
      setCurrentUser(null);
      localStorage.removeItem("accessToken");
    }
  };

  const value = {
    currentUser,
    role: currentUser?.role || null,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    logout,
    refreshSession
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
