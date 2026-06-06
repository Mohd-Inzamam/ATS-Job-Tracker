import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>Check Your Email ✉️</h2>
          <p className="auth-subtitle">
            If an account exists for <strong>{email}</strong>, a password reset
            link has been sent.
          </p>
          <Link
            to="/login"
            className="btn-primary full-width"
            style={{
              display: "block",
              textAlign: "center",
              marginTop: "1rem",
            }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">
          Enter your email and we'll send you a reset link
        </p>

        {error && <div className="error-banner">{error}</div>}

        <div className="input-group">
          <span className="material-symbols-outlined">mail</span>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button className="btn-primary full-width" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p className="auth-switch">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
