"use client";
import { createContext, useContext, useState, useEffect } from "react"
import { api } from "../services/api"

const AuthContext = createContext({ user: null, setUser: () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  useEffect(() => {
    api.post("/auth/validate-session")
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
  }, [])
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}