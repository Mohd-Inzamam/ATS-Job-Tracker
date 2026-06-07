import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { resendVerificationEmail } from "../services/authService";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One number", test: (p) => /\d/.test(p) },
];

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const passwordStrength = PASSWORD_RULES.filter((r) =>
    r.test(form.password),
  ).length;
  const strengthLabel = ["", "Weak", "Fair", "Strong"][passwordStrength];
  const strengthColor = ["", "#E24B4A", "#BA7517", "#639922"][passwordStrength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordStrength < 2) {
      showToast("Please choose a stronger password", "error");
      return;
    }
    setLoading(true);
    try {
      await signup(form);
      showToast("Verification email sent!", "success");
      setSubmitted(true);
      setCountdown(60);
    } catch (err) {
      showToast(
        err.message || "Registration failed. Please try again.",
        "error",
      );
    } finally {
      setLoading(false);
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

  /* ── Email sent screen ── */
  if (submitted) {
    return (
      <div className="auth-page auth-page-centered">
        <button
          type="button"
          className="auth-back-btn auth-back-float"
          onClick={() => navigate("/")}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to home
        </button>

        <div className="auth-card-v2 auth-card-v2-centered">
          <div className="verify-icon">✉️</div>
          <h2>Check your email</h2>
          <p className="auth-subtitle">
            We sent a verification link to <strong>{form.email}</strong>. Click
            the link to activate your account.
          </p>

          <div className="verify-steps">
            <div className="verify-step">
              <span className="verify-step-num">1</span>
              <span>Open your email inbox</span>
            </div>
            <div className="verify-step">
              <span className="verify-step-num">2</span>
              <span>Click the verification link</span>
            </div>
            <div className="verify-step">
              <span className="verify-step-num">3</span>
              <span>You'll be redirected to login</span>
            </div>
          </div>

          <div className="verify-resend">
            {countdown > 0 ? (
              <p className="verify-countdown">
                Resend available in <strong>{countdown}s</strong>
              </p>
            ) : (
              <button
                type="button"
                className="btn-ghost full-width"
                onClick={handleResend}>
                Resend verification email
              </button>
            )}
          </div>

          <button
            className="btn-primary full-width"
            onClick={() => navigate("/login")}>
            Go to Login
          </button>

          <p className="auth-switch" style={{ marginTop: "1rem" }}>
            Wrong email?{" "}
            <button
              type="button"
              className="auth-inline-btn"
              onClick={() => setSubmitted(false)}>
              Go back
            </button>
          </p>
        </div>
      </div>
    );
  }

  /* ── Signup form ── */
  return (
    <div className="auth-page">
      {/* Left panel */}
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
            Land your next job
            <br />
            faster than ever.
          </h1>
          <p className="auth-left-sub">
            Get your ATS score in seconds, track every application, and let AI
            coach you through interviews.
          </p>

          <div className="auth-left-checklist">
            {[
              "Free ATS resume checker",
              "Job application pipeline",
              "AI resume–JD match analysis",
              "Interview prep cards",
            ].map((item) => (
              <div key={item} className="auth-check-item">
                <span className="auth-check-icon">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card-v2">
          <div className="auth-card-header">
            <h2>Create your account</h2>
            <p className="auth-subtitle">Free forever. No card required.</p>
          </div>

          {/* Google OAuth */}
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
            <span>or sign up with email</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Full name</label>
              <div className="input-group">
                <span className="material-symbols-outlined">person</span>
                <input
                  placeholder="Arjun Sharma"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

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
              <label>Password</label>
              <div className="input-group">
                <span className="material-symbols-outlined">lock</span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 characters"
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

              {/* Password strength bar */}
              {form.password.length > 0 && (
                <div className="password-strength">
                  <div className="strength-bar">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="strength-segment"
                        style={{
                          background:
                            i <= passwordStrength
                              ? strengthColor
                              : "var(--color-border-secondary)",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="strength-label"
                    style={{ color: strengthColor }}>
                    {strengthLabel}
                  </span>
                </div>
              )}

              {/* Password rules */}
              {form.password.length > 0 && (
                <div className="password-rules">
                  {PASSWORD_RULES.map((rule) => (
                    <div
                      key={rule.label}
                      className={`password-rule ${rule.test(form.password) ? "met" : ""}`}>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "13px" }}>
                        {rule.test(form.password)
                          ? "check_circle"
                          : "radio_button_unchecked"}
                      </span>
                      {rule.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="btn-primary full-width"
              disabled={loading}
              style={{ marginTop: "4px" }}>
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
                  Creating account…
                </span>
              ) : (
                "Create free account"
              )}
            </button>

            <p className="auth-terms">
              By signing up you agree to our{" "}
              <a href="#" target="_blank" rel="noopener noreferrer">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              .
            </p>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
