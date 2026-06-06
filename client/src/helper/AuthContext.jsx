import { createContext, useContext, useState, useEffect } from "react";
import { authStatus } from "../api/userApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAuthStatus = async () => {
      const authenticated = await authStatus();
      setIsAuthenticated(authenticated);
      setLoading(false);
    };
    fetchAuthStatus();
  }, []);
  // need to add loading guard

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};