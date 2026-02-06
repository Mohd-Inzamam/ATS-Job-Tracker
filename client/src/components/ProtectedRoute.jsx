import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  console.log("ProtectedRoute - user:", user, "loading:", loading);
  const token = localStorage.getItem("token");

  // if (loading) return <div className="container">Loading...</div>;

  // return user ? children : <Navigate to="/login" />;

  if (loading) return <div className="container">Loading...</div>;

  // If there's a token but no user yet, show loading
  if (token && !user) return <div className="container">Loading...</div>;

  return user ? children : <Navigate to="/login" />;
}
