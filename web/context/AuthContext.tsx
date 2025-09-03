"use client";
import { createContext, useContext, useState } from "react";

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  login: (user: any) => void; // <-- Añadido
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  // Método login: guarda el usuario en contexto
  const login = (userData: any) => {
    setUser(userData);
  };

  // Método logout listo para producción
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    // Si usas cookies, bórralas aquí
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