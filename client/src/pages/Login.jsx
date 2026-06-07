import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
    } catch (err) {
      showToast(err.message || "Invalid email or password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel — branding */}
      <div className="auth-left">
        <button
          type="button"
          className="auth-back-btn"
          onClick={() => navigate("/")}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to home
        </button>

        <div className="auth-left-content">
          <div className="auth-brand">
            <span className="auth-brand-mark">▲</span>
            <span className="auth-brand-name">ATSPro</span>
          </div>
          <h1 className="auth-left-headline">
            Your job search,
            <br />
            supercharged.
          </h1>
          <p className="auth-left-sub">
            Track every application, match resumes to JDs, and get AI coaching —
            all in one place.
          </p>

          <div className="auth-left-stats">
            <div className="auth-stat">
              <span className="auth-stat-num">10k+</span>
              <span className="auth-stat-label">Resumes analyzed</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-num">3×</span>
              <span className="auth-stat-label">More interviews</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-num">Free</span>
              <span className="auth-stat-label">To get started</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right">
        <div className="auth-card-v2">
          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p className="auth-subtitle">Sign in to your account</p>
          </div>

          {/* Google OAuth button */}
          <button
            type="button"
            className="oauth-btn"
            onClick={() => showToast("Google OAuth coming soon!", "info")}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or sign in with email</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email</label>
              <div className="input-group">
                <span className="material-symbols-outlined">mail</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-field-row">
                <label>Password</label>
                <Link to="/forgot-password" className="auth-field-link">
                  Forgot password?
                </Link>
              </div>
              <div className="input-group">
                <span className="material-symbols-outlined">lock</span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowPass((s) => !s)}
                  tabIndex={-1}>
                  <span className="material-symbols-outlined">
                    {showPass ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button className="btn-primary full-width" disabled={loading}>
              {loading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "center",
                  }}>
                  <span
                    className="parse-spinner"
                    style={{ width: "16px", height: "16px" }}
                  />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
