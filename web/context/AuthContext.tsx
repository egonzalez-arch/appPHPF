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

  // Validar sesión al montar usando la cookie
useEffect(() => {
  (async () => {
    try {
      const user = await validateSession();
      setUser(user);
    } catch (err) {
      setUser(null);
      // Si quieres, puedes mostrar un log informativo en vez de un error
      // console.info('Sesión no válida (usuario no logueado)');
    }
  })();
}, []);

  // Login
  const login = async (email: string, password: string) => {
    const user = await apiLogin(email, password);
    setUser(user);
  };

  // Logout
  const logout = async () => {
    await apiLogout();
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