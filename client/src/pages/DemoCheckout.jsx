import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { activateDemoProService } from "../services/billingService";

const UNLOCKED_FEATURES = [
  "Unlimited resumes",
  "Unlimited job applications",
  "AI match explainer",
  "Interview prep questions",
  "Analytics dashboard",
  "Resume–JD matching",
];

export default function DemoCheckout() {
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleActivate = async () => {
    setState("processing");
    setError("");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const data = await activateDemoProService();
      setUser((prev) => ({
        ...prev,
        plan: data.plan || "pro",
        planActivatedAt: data.planActivatedAt,
        planExpiresAt: data.planExpiresAt,
      }));
      setState("success");
    } catch (err) {
      setError(err.message || "Failed to activate Pro plan");
      setState("idle");
    }
  };

  if (state === "success") {
    return (
      <div className="demo-checkout-page">
        <div className="demo-checkout-card demo-checkout-success">
          <div className="demo-success-icon">✓</div>
          <h2>You're now on Pro! 🎉</h2>
          <p className="demo-success-sub">
            Your Pro plan is active. All features are unlocked.
          </p>
          <ul className="demo-unlocked-list">
            {UNLOCKED_FEATURES.map((feature) => (
              <li key={feature}>✓ {feature}</li>
            ))}
          </ul>
          <button
            type="button"
            className="btn-primary full-width"
            onClick={() => {
              setUser((prev) => ({ ...prev, plan: "pro" }));
              navigate("/dashboard");
            }}
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="demo-checkout-page">
      <div className="demo-checkout-card">
        <h1 className="demo-checkout-title">Complete your order</h1>

        <div className="demo-order-summary">
          <div className="demo-order-row">
            <div>
              <p className="demo-order-product">ATS Tracker Pro</p>
              <p className="demo-order-desc">
                Unlimited resumes · AI features · Analytics
              </p>
            </div>
            <span className="demo-order-price">$12.00 / month</span>
          </div>
          <hr className="demo-order-divider" />
          <div className="demo-order-total">
            <span>Total today</span>
            <span>$12.00</span>
          </div>
          <p className="demo-order-note">Cancel anytime. No hidden fees.</p>
        </div>

        <div className="demo-notice-banner">
          ⚡ Demo Mode — No real payment will be charged.
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="demo-payment-form">
          <label className="demo-field-label">Card details</label>
          <div className="demo-fake-input demo-fake-card">
            <span>4242&nbsp;&nbsp;4242&nbsp;&nbsp;4242&nbsp;&nbsp;4242</span>
            <span className="material-symbols-outlined demo-lock-icon">lock</span>
          </div>
          <div className="demo-fake-row">
            <div className="demo-fake-input">MM / YY</div>
            <div className="demo-fake-input">CVC</div>
          </div>

          <label className="demo-field-label">Cardholder name</label>
          <div className="demo-fake-input">Demo User</div>
        </div>

        {state === "processing" ? (
          <div className="demo-processing">
            <span className="parse-spinner" />
            <p>Activating your Pro plan...</p>
          </div>
        ) : (
          <button
            type="button"
            className="btn-primary full-width"
            onClick={handleActivate}
          >
            Activate Pro — $12.00/mo
          </button>
        )}
      </div>
    </div>
  );
}
