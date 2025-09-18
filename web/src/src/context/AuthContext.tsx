import { createContext, useContext, useEffect, useState } from 'react';
export const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => {
    // fetch /me
    setLoading(false);
  }, []);
  return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);