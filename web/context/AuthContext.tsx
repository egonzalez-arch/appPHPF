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
  // Mock user for development/testing
  const [user, setUser] = useState<any>({
    id: 1,
    name: "Dr. Juan Pérez",
    email: "test@example.com",
    role: "DOCTOR"
  });

  // Validar sesión al montar usando la cookie
useEffect(() => {
  (async () => {
    try {
      const user = await validateSession();
      setUser(user);
    } catch (err) {
      // For development, keep the mock user
      // setUser(null);
      // Si quieres, puedes mostrar un log informativo en vez de un error
      // console.info('Sesión no válida (usuario no logueado)');
    }
  })();
}, []);

  // Login
  const login = async (email: string, password: string) => {
    try {
      const user = await apiLogin(email, password);
      setUser(user);
    } catch (error) {
      // For development, use mock login
      setUser({
        id: 1,
        name: "Dr. Juan Pérez",
        email: email,
        role: "DOCTOR"
      });
    }
  };

  // Logout
  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      // Ignore logout errors for development
    }
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