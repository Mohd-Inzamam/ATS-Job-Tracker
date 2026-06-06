import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiFetch } from "../api/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await apiFetch(`/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>Password Reset ✅</h2>
          <p className="auth-subtitle">
            Your password has been reset successfully.
          </p>
          <button
            className="btn-primary full-width"
            onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p className="auth-subtitle">Enter your new password below</p>

        {error && <div className="error-banner">{error}</div>}

        <div className="input-group">
          <span className="material-symbols-outlined">lock</span>
          <input
            type="password"
            placeholder="New Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="input-group">
          <span className="material-symbols-outlined">lock</span>
          <input
            type="password"
            placeholder="Confirm New Password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <button className="btn-primary full-width" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="auth-switch">
          <Link to="/login">Back to Login</Link>
        </p>
      </form>
    </div>
  );
}
