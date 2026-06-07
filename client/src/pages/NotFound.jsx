import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PrimaryButton from "../components/PrimaryButton";

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="not-found-page">
      <p className="not-found-code">404</p>
      <h2>Page not found</h2>
      <p className="not-found-subtitle">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="not-found-actions">
        <PrimaryButton onClick={() => navigate(user ? "/dashboard" : "/")}>
          Go to Dashboard
        </PrimaryButton>
        <button type="button" className="btn-ghost" onClick={() => navigate("/ats")}>
          Check My Resume Free
        </button>
      </div>
    </div>
  );
}
