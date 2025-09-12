"use client";
import { createContext, useContext, useState } from "react";

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  // Mock user for testing
  const [user, setUser] = useState({
    id: 1,
    name: "Dr. Juan Pérez",
    email: "test@example.com",
    role: "DOCTOR"
  });

  // Mock login
  const login = async (email: string, password: string) => {
    // Simulate login
    setUser({
      id: 1,
      name: "Dr. Juan Pérez", 
      email: email,
      role: "DOCTOR"
    });
  };

  // Mock logout
  const logout = async () => {
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
  if (!ctx) throw new Error("useAuth must be used inside MockAuthProvider");
  return ctx;
}