"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, logout as apiLogout, validateSession } from "@/lib/api/api";

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await validateSession(); // intenta refresh con el refreshToken almacenado
        setUser(u);
      } catch {
        setUser(null);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const u = await apiLogin(email, password); // guarda tokens y devuelve user
    setUser(u);
  };

  const logout = async () => {
    await apiLogout(); // limpia tokens
    setUser(null);
    window.location.href = "/login";
  };

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