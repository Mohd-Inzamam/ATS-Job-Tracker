import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserProfileService,
  loginService,
  registerService,
} from "../services/authService";
import { apiFetch } from "../api/api";
// import { set } from "mongoose";

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
  const navigate = useNavigate();

  const login = async (credentials) => {
    const data = await loginService(credentials);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    // Redirect based on onboarding status
    if (!data.user.onboardingComplete) {
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }
    return data.user;
  };

  const completeOnboarding = async () => {
    await apiFetch("/auth/onboarding-complete", { method: "PATCH" });
    setUser((prev) => ({ ...prev, onboardingComplete: true }));
  };

  const signup = async (payload) => {
    // Backend only sends a verification email — no token returned
    await registerService(payload);
    // Don't set user or token — user must verify email first
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, setUser, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
