"use client";
import { createContext, useContext, useState } from "react";

// Siempre provee un objeto (evita null), pero user puede ser null
const AuthContext = createContext<{
  user: any;
  login: (userData: any) => void;
  logout: () => void;
} | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  const login = (userData: any) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook robusto: nunca retorna null, retorna objeto vacío si el contexto no existe
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Opcional: puede lanzar error en desarrollo
    // throw new Error("useAuth must be used within an AuthProvider");
    return { user: null, login: () => {}, logout: () => {} };
  }
  return context;
}