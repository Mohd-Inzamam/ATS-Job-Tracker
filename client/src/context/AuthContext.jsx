import { createContext, useContext, useState } from "react";
import { loginService, registerService } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    const data = await loginService(credentials);
    setUser(data.user);
    localStorage.setItem("token", data.token);
  };

  const signup = async (payload) => {
    const data = await registerService(payload);
    setUser(data.user);
    localStorage.setItem("token", data.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
