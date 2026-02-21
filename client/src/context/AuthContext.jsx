import { createContext, useContext, useState, useEffect } from "react";
import {
  getUserProfileService,
  loginService,
  registerService,
} from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // restore session
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    console.log("AuthProvider - Found token, fetching user profile...", token);

    // fetch user profile
    const fetchUserProfile = async () => {
      getUserProfileService()
        .then((data) => {
          console.log("User profile fetched successfully:", data);
          setUser(data);
        })
        .catch((err) => {
          console.error("Failed to fetch user profile:", err);
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchUserProfile();
  }, []);

  console.log("AuthProvider - user:", user, "loading:", loading);
  const login = async (credentials) => {
    const data = await loginService(credentials);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data.user;
  };

  const signup = async (payload) => {
    const data = await registerService(payload);
    setUser(data.user);
    localStorage.setItem("token", data.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
