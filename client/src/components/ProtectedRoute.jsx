import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const onboardingComplete =
    localStorage.getItem("onboardingComplete") === "true";

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  // Token exists but user not hydrated yet
  if (token && !user) {
    return <div className="container">Loading...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Logged in but onboarding not complete
  if (!onboardingComplete && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // All good
  return children;
}
