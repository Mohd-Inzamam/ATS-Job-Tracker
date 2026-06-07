import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { resendVerificationEmail } from "../services/authService";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!submitted) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      showToast("Verification email sent!", "success");
      setSubmitted(true);
      setCountdown(60);
    } catch (err) {
      showToast(err.message || "Registration failed. Please try again.", "error");
    }
  };

  const handleResend = async () => {
    try {
      await resendVerificationEmail(form.email);
      showToast("Verification email resent!", "success");
      setCountdown(60);
    } catch (err) {
      showToast(err.message || "Failed to resend email", "error");
    }
  };

  if (submitted) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>Check Your Email ✉️</h2>
          <p className="auth-subtitle">
            We sent a verification link to <strong>{form.email}</strong>. Please
            verify your email before logging in.
          </p>

          {countdown > 0 ? (
            <p className="auth-subtitle" style={{ fontSize: "13px", opacity: 0.7 }}>
              Resend email in {countdown}s
            </p>
          ) : (
            <button
              type="button"
              className="btn-link"
              style={{ background: "none", border: "none", color: "var(--color-text-info)", cursor: "pointer", fontSize: "13px", marginBottom: "1rem" }}
              onClick={handleResend}
            >
              Resend verification email
            </button>
          )}

          <button
            className="btn-primary full-width"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join the ATS platform</p>

        <div className="input-group">
          <span className="material-symbols-outlined">person</span>
          <input
            placeholder="Full Name"
            required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="input-group">
          <span className="material-symbols-outlined">mail</span>
          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="input-group">
          <span className="material-symbols-outlined">lock</span>
          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button className="btn-primary full-width">Sign Up</button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
