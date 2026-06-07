import PublicNavbar from "../components/PublicNavbar";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";

export default function Landing() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <PublicNavbar />

      {/* Section 1 — Hero */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-left">
            <span className="landing-eyebrow">AI-Powered · Free to Use</span>
            <h1>Beat the ATS. Land the Interview.</h1>
            <p className="landing-hero-sub">
              Upload your resume and get an instant ATS score, AI-powered gap analysis,
              and a full job search tracker — all in one place.
            </p>
            <div className="landing-cta-row">
              <PrimaryButton onClick={() => navigate("/ats")}>
                Check My Resume Free
              </PrimaryButton>
              <button type="button" className="btn-ghost" onClick={scrollToHowItWorks}>
                See How It Works
              </button>
            </div>
            <div className="landing-proof">
              <span>✓ No credit card</span>
              <span>✓ No signup to try</span>
              <span>✓ Results in 5 seconds</span>
            </div>
          </div>

          <div className="landing-hero-right">
            <div className="fake-dashboard-card">
              <div className="fake-score-badge">
                <span className="fake-score-num">82</span>
              </div>
              <div className="fake-feedback-rows">
                <div className="fake-feedback-row success">
                  <span className="fake-indicator" />
                  ✓ Strong action verbs detected
                </div>
                <div className="fake-feedback-row success">
                  <span className="fake-indicator" />
                  ✓ Skills section present
                </div>
                <div className="fake-feedback-row warning">
                  <span className="fake-indicator" />
                  ⚠ Missing: quantified achievements
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Stats bar */}
      <section className="landing-stats-bar">
        <div className="landing-stats-inner">
          <div className="landing-stat">
            <p className="landing-stat-value">10,000+</p>
            <p className="landing-stat-label">Resumes Analyzed</p>
          </div>
          <div className="landing-stat">
            <p className="landing-stat-value">3x</p>
            <p className="landing-stat-label">Faster Job Tracking</p>
          </div>
          <div className="landing-stat">
            <p className="landing-stat-value">AI</p>
            <p className="landing-stat-label">Powered Gap Analysis</p>
          </div>
        </div>
      </section>

      {/* Section 3 — How it works */}
      <section id="how-it-works" className="landing-section">
        <h2 className="landing-section-title">From Upload to Offer in 4 Steps</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <span className="step-badge">1</span>
            <span className="step-icon">📄</span>
            <h3>Upload Resume</h3>
            <p>Drop your PDF or DOCX. We parse it instantly.</p>
          </div>
          <div className="landing-step">
            <span className="step-badge">2</span>
            <span className="step-icon">🎯</span>
            <h3>Get Your ATS Score</h3>
            <p>See exactly why ATS systems accept or reject your resume.</p>
          </div>
          <div className="landing-step">
            <span className="step-badge">3</span>
            <span className="step-icon">💼</span>
            <h3>Track Applications</h3>
            <p>Add jobs, paste JDs, get AI match scores automatically.</p>
          </div>
          <div className="landing-step">
            <span className="step-badge">4</span>
            <span className="step-icon">🤖</span>
            <h3>Get AI Coaching</h3>
            <p>Interview prep, resume fixes, and weekly insights.</p>
          </div>
        </div>
      </section>

      {/* Section 4 — Features */}
      <section className="landing-section">
        <h2 className="landing-section-title">Everything a Job Seeker Needs</h2>
        <div className="landing-features">
          <div className="landing-feature-card">
            <span className="landing-feature-icon">📊</span>
            <h3>Instant ATS Score</h3>
            <p>
              Get a 0-100 score with a detailed breakdown of what's hurting your
              resume — formatting, keywords, structure, and more.
            </p>
          </div>
          <div className="landing-feature-card">
            <span className="landing-feature-icon">🤖</span>
            <h3>AI Match Analysis</h3>
            <p>
              Paste any job description. Our AI compares it with your resume and
              tells you exactly what to add, remove, or reframe.
            </p>
          </div>
          <div className="landing-feature-card">
            <span className="landing-feature-icon">📋</span>
            <h3>Full Application Tracker</h3>
            <p>
              Track every application from Saved to Offer. Get interview prep the
              moment you land an interview.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 — CTA Banner */}
      <section className="landing-cta-banner">
        <h2>Your next job starts with your resume.</h2>
        <p>Check your ATS score in 30 seconds — no signup needed.</p>
        <PrimaryButton onClick={() => navigate("/ats")}>
          Analyze My Resume Free
        </PrimaryButton>
      </section>

      {/* Section 6 — Footer */}
      <footer className="landing-footer">
        <span>© 2025 ATS Tracker. Built for job seekers.</span>
        <div className="landing-footer-links">
          <a href="#">Privacy</a>
          <span>·</span>
          <a href="#">Terms</a>
        </div>
      </footer>
    </>
  );
}
