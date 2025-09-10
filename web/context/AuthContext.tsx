"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  login: (user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  const login = (userData: any) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (res.ok && data && data.user && Object.keys(data.user).length > 0) {
            setUser(data.user);
          } else {
            setUser(null);
            localStorage.removeItem("token");
          }
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem("token");
        });
    }
  }, []); // Solo al montar

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}