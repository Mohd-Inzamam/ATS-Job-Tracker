import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PublicNavbar from "../components/PublicNavbar";

const PLANS = [
  {
    id: "free",
    name: "Free",
    tagline: "Try before you commit",
    price: { monthly: 0, annual: 0 },
    cta: "Get started free",
    ctaRoute: "/signup",
    highlight: false,
    features: [
      { text: "3 ATS resume checks / month", included: true },
      { text: "2 saved resumes", included: true },
      { text: "Up to 10 job applications", included: true },
      { text: "Basic ATS score & feedback", included: true },
      { text: "AI job search insight", included: false },
      { text: "Resume–JD match analysis", included: false },
      { text: "Interview prep cards", included: false },
      { text: "Analytics dashboard", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For serious job seekers",
    badge: "Most popular",
    price: { monthly: 12, annual: 9 },
    cta: "Start Pro free for 7 days",
    ctaRoute: "/signup?plan=pro",
    highlight: true,
    features: [
      { text: "Unlimited ATS resume checks", included: true },
      { text: "Unlimited saved resumes", included: true },
      { text: "Unlimited job applications", included: true },
      { text: "Full ATS score breakdown", included: true },
      { text: "AI job search insight", included: true },
      { text: "Resume–JD match analysis", included: true },
      { text: "Interview prep cards", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "Email support", included: true },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "team",
    name: "Team",
    tagline: "For career coaches & bootcamps",
    price: { monthly: 39, annual: 29 },
    cta: "Contact us",
    ctaRoute: "/signup?plan=team",
    highlight: false,
    features: [
      { text: "Unlimited ATS resume checks", included: true },
      { text: "Unlimited saved resumes", included: true },
      { text: "Unlimited job applications", included: true },
      { text: "Full ATS score breakdown", included: true },
      { text: "AI job search insight", included: true },
      { text: "Resume–JD match analysis", included: true },
      { text: "Interview prep cards", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "Unlimited resumes", included: true },
      { text: "Priority support", included: true },
    ],
  },
];

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings with one click. No questions asked, no cancellation fees.",
  },
  {
    q: "What happens after my free trial?",
    a: "After 7 days on Pro trial, you'll be asked to add a payment method. If you don't, your account automatically downgrades to Free.",
  },
  {
    q: "Is my resume data safe?",
    a: "Resumes are stored encrypted and never shared with third parties. You can delete all your data at any time from your account settings.",
  },
  {
    q: "Do you offer student discounts?",
    a: "Yes — email us with your .edu address and we'll apply a 50% discount to any paid plan.",
  },
  {
    q: "What file formats are supported?",
    a: "PDF and DOCX are fully supported. These cover 99% of resumes in circulation.",
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePlanCta = (plan) => {
    if (plan.id === "free") {
      if (user) return;
      navigate("/signup");
      return;
    }
    if (plan.id === "pro") {
      if (user) {
        navigate("/checkout");
      } else {
        navigate("/signup?plan=pro");
      }
      return;
    }
    navigate(plan.ctaRoute);
  };

  const getPlanCtaLabel = (plan) => {
    if (plan.id === "free" && user) return "Current plan";
    if (plan.id === "pro" && user?.plan === "pro") return "Current plan";
    return plan.cta;
  };

  const isPlanCtaDisabled = (plan) => {
    if (plan.id === "free" && user) return true;
    if (plan.id === "pro" && user?.plan === "pro") return true;
    return false;
  };

  return (
    <>
      <PublicNavbar />
      <div className="pricing-page">
        {/* Header */}
        <div className="pricing-header">
          <span className="pricing-eyebrow">Simple, transparent pricing</span>
          <h1>The right plan for your job search</h1>
          <p>Start free, upgrade when you need more. No hidden fees.</p>

          {/* Billing toggle */}
          <div className="billing-toggle">
            <span className={!annual ? "toggle-label active" : "toggle-label"}>
              Monthly
            </span>
            <button
              type="button"
              className={`toggle-switch ${annual ? "on" : ""}`}
              onClick={() => setAnnual(!annual)}
              aria-label="Toggle annual billing">
              <span className="toggle-knob" />
            </button>
            <span className={annual ? "toggle-label active" : "toggle-label"}>
              Annual
              <span className="save-badge">Save 25%</span>
            </span>
          </div>
        </div>

        {/* Plans grid */}
        <div className="pricing-grid">
          {PLANS.map((plan) => {
            const price = annual ? plan.price.annual : plan.price.monthly;
            return (
              <div
                key={plan.id}
                className={`pricing-card ${plan.highlight ? "pricing-card-highlight" : ""}`}>
                {plan.badge && (
                  <div className="pricing-badge">{plan.badge}</div>
                )}
                <div className="pricing-card-header">
                  <h2 className="plan-name">{plan.name}</h2>
                  <p className="plan-tagline">{plan.tagline}</p>
                </div>

                <div className="plan-price">
                  {price === 0 ? (
                    <span className="price-num">Free</span>
                  ) : (
                    <>
                      <span className="price-currency">$</span>
                      <span className="price-num">{price}</span>
                      <span className="price-period">/mo</span>
                    </>
                  )}
                  {annual && price > 0 && (
                    <p className="price-annual-note">billed annually</p>
                  )}
                </div>

                <button
                  type="button"
                  className={`plan-cta ${plan.highlight ? "plan-cta-primary" : "plan-cta-ghost"}`}
                  onClick={() => handlePlanCta(plan)}
                  disabled={isPlanCtaDisabled(plan)}>
                  {getPlanCtaLabel(plan)}
                </button>

                <ul className="plan-features">
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      className={`plan-feature ${f.included ? "included" : "excluded"}`}>
                      <span className="feature-icon">
                        {f.included ? "✓" : "–"}
                      </span>
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Feature comparison note */}
        <p className="pricing-compare-note">
          All plans include email verification, password reset, and data export.
          Prices in USD.
        </p>

        {/* FAQ */}
        <div className="pricing-faq">
          <h2 className="pricing-faq-title">Frequently asked questions</h2>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`faq-item ${openFaq === i ? "open" : ""}`}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="faq-chevron">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && <p className="faq-answer">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pricing-bottom-cta">
          <h2>Still unsure? Start free — no card required.</h2>
          <p>Join thousands of job seekers already using ATS Tracker.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/signup")}>
            Create free account
          </button>
        </div>

        <footer className="landing-footer">
          <span>© 2025 ATS Tracker. Built for job seekers.</span>
          <div className="landing-footer-links">
            <a href="#">Privacy</a>
            <span>·</span>
            <a href="#">Terms</a>
          </div>
        </footer>
      </div>
    </>
  );
}
