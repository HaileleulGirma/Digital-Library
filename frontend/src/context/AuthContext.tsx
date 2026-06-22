import React, { createContext, useState, useContext } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  email: string | null;
  login: (token: string, role: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const login = (jwtToken: string, userRole: string, userEmail: string) => {
    setToken(jwtToken);
    setRole(userRole);
    setEmail(userEmail);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, email, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};