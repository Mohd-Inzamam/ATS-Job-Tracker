import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      // Navigation is handled inside AuthContext.login() based on onboardingComplete
    } catch (err) {
      showToast(err.message || "Invalid email or password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to continue</p>

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

        <button className="btn-primary full-width" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div style={{ textAlign: "right", marginTop: "-0.5rem", marginBottom: "0.5rem" }}>
          <Link
            to="/forgot-password"
            style={{ fontSize: "13px", color: "var(--color-text-info)" }}
          >
            Forgot password?
          </Link>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
