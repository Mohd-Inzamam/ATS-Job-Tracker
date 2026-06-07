import PublicNavbar from "../components/PublicNavbar";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";

const TESTIMONIALS = [
  {
    initials: "SK",
    name: "Shreya K.",
    role: "Software Engineer at Razorpay",
    quote:
      "I went from zero callbacks to 3 interviews in two weeks. ATS Tracker showed me exactly which keywords I was missing for each role.",
    color: "#4f46e5",
  },
  {
    initials: "AM",
    name: "Arjun M.",
    role: "Product Manager, ex-Flipkart",
    quote:
      "The JD matcher is insane. I paste the job description and it tells me precisely what to add. My match scores went from 42% to 78%.",
    color: "#0284c7",
  },
  {
    initials: "PR",
    name: "Priya R.",
    role: "Data Analyst at Swiggy",
    quote:
      "The interview prep cards alone are worth it. Every question the AI predicted — three of them actually came up in my final round.",
    color: "#15803d",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <PublicNavbar />

      {/* Section 1 — Hero */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-left">
            <span className="landing-eyebrow">AI-Powered · Free to Use</span>
            <h1>
              Beat the ATS.
              <br />
              Land the Interview.
            </h1>
            <p className="landing-hero-sub">
              Upload your resume and get an instant ATS score, AI-powered gap
              analysis, and a full job search tracker — all in one place.
            </p>
            <div className="landing-cta-row">
              <PrimaryButton onClick={() => navigate("/ats")}>
                Check My Resume Free
              </PrimaryButton>
              <button
                type="button"
                className="btn-ghost"
                onClick={scrollToHowItWorks}>
                See How It Works
              </button>
            </div>
            <div className="landing-proof">
              <span>✓ No credit card</span>
              <span>✓ No signup to try</span>
              <span>✓ Results in 5 seconds</span>
            </div>
          </div>

          {/* Blurred dashboard preview */}
          <div className="landing-hero-right">
            <div className="dashboard-preview-wrap">
              <div className="dashboard-preview-inner">
                {/* Fake sidebar */}
                <div className="preview-sidebar">
                  <div className="preview-logo-block">
                    <div className="preview-logo-dot" />
                    <div className="preview-logo-text" />
                  </div>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`preview-nav-item ${i === 1 ? "active" : ""}`}>
                      <div className="preview-nav-icon" />
                      <div
                        className="preview-nav-label"
                        style={{ width: `${40 + i * 10}px` }}
                      />
                    </div>
                  ))}
                </div>

                {/* Fake main content */}
                <div className="preview-content">
                  {/* Greeting row */}
                  <div className="preview-greeting">
                    <div className="preview-h1" />
                    <div className="preview-sub" />
                  </div>

                  {/* Pipeline pills */}
                  <div className="preview-pipeline">
                    {["Saved", "Applied", "Interview", "Offer", "Rejected"].map(
                      (s, i) => (
                        <div key={s} className="preview-pill">
                          <div className="preview-pill-label" />
                          <div
                            className="preview-pill-num"
                            style={{
                              background:
                                [
                                  "#9ca3af",
                                  "#0284c7",
                                  "#d97706",
                                  "#15803d",
                                  "#dc2626",
                                ][i] + "30",
                            }}
                          />
                        </div>
                      ),
                    )}
                  </div>

                  {/* Metric cards */}
                  <div className="preview-metrics">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="preview-metric-card">
                        <div className="preview-metric-label" />
                        <div className="preview-metric-value" />
                        <div className="preview-metric-sub" />
                      </div>
                    ))}
                  </div>

                  {/* Insight card */}
                  <div className="preview-insight">
                    <div className="preview-insight-header" />
                    <div className="preview-insight-line" />
                    <div className="preview-insight-line short" />
                  </div>
                </div>
              </div>

              {/* Frosted glass overlay */}
              <div className="dashboard-preview-gate">
                <div className="gate-lock">🔒</div>
                <p className="gate-headline">Your full dashboard awaits</p>
                <p className="gate-sub">
                  Track every application, match resumes to JDs, and get AI
                  coaching.
                </p>
                <button
                  type="button"
                  className="gate-cta"
                  onClick={() => navigate("/signup")}>
                  Sign up free to unlock
                </button>
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
            <p className="landing-stat-label">More Interviews</p>
          </div>
          <div className="landing-stat">
            <p className="landing-stat-value">78%</p>
            <p className="landing-stat-label">Avg. Match Improvement</p>
          </div>
          <div className="landing-stat">
            <p className="landing-stat-value">Free</p>
            <p className="landing-stat-label">To Get Started</p>
          </div>
        </div>
      </section>

      {/* Section 3 — How it works */}
      <section id="how-it-works" className="landing-section">
        <h2 className="landing-section-title">
          From Upload to Offer in 4 Steps
        </h2>
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
      <section className="landing-section" style={{ paddingTop: 0 }}>
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
              Track every application from Saved to Offer. Get interview prep
              the moment you land an interview.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 — Social Proof / Testimonials */}
      <section className="landing-testimonials-section">
        <div className="landing-section" style={{ paddingBottom: "32px" }}>
          <span
            className="landing-eyebrow"
            style={{
              display: "block",
              textAlign: "center",
              marginBottom: "12px",
            }}>
            Trusted by job seekers
          </span>
          <h2
            className="landing-section-title"
            style={{ marginBottom: "12px" }}>
            Real results, real people
          </h2>
          <p className="landing-testimonials-sub">
            Join thousands of candidates who upgraded their job search with ATS
            Tracker.
          </p>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div
                    className="testimonial-avatar"
                    style={{ background: t.color + "20", color: t.color }}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-role">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust bar */}
          <div className="trust-bar">
            <div className="trust-item">
              <span className="trust-icon">🔒</span>
              <span>Your data is encrypted and never sold</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">⚡</span>
              <span>Results in under 5 seconds</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🗑️</span>
              <span>Delete your data anytime</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">💳</span>
              <span>Free tier, no card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 — CTA Banner */}
      <section className="landing-cta-banner">
        <h2>Your next job starts with your resume.</h2>
        <p>Check your ATS score in 30 seconds — no signup needed.</p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
          <PrimaryButton onClick={() => navigate("/ats")}>
            Analyze My Resume Free
          </PrimaryButton>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => navigate("/pricing")}>
            See pricing
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>© 2025 ATS Tracker. Built for job seekers.</span>
        <div className="landing-footer-links">
          <a href="/pricing">Pricing</a>
          <span>·</span>
          <a href="#">Privacy</a>
          <span>·</span>
          <a href="#">Terms</a>
        </div>
      </footer>
    </>
  );
}

// import PublicNavbar from "../components/PublicNavbar";
// import { useNavigate } from "react-router-dom";
// import PrimaryButton from "../components/PrimaryButton";

// export default function Landing() {
//   const navigate = useNavigate();

//   const scrollToHowItWorks = () => {
//     document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
//   };

//   return (
//     <>
//       <PublicNavbar />

//       {/* Section 1 — Hero */}
//       <section className="landing-hero">
//         <div className="landing-hero-inner">
//           <div className="landing-hero-left">
//             <span className="landing-eyebrow">AI-Powered · Free to Use</span>
//             <h1>Beat the ATS. Land the Interview.</h1>
//             <p className="landing-hero-sub">
//               Upload your resume and get an instant ATS score, AI-powered gap analysis,
//               and a full job search tracker — all in one place.
//             </p>
//             <div className="landing-cta-row">
//               <PrimaryButton onClick={() => navigate("/ats")}>
//                 Check My Resume Free
//               </PrimaryButton>
//               <button type="button" className="btn-ghost" onClick={scrollToHowItWorks}>
//                 See How It Works
//               </button>
//             </div>
//             <div className="landing-proof">
//               <span>✓ No credit card</span>
//               <span>✓ No signup to try</span>
//               <span>✓ Results in 5 seconds</span>
//             </div>
//           </div>

//           <div className="landing-hero-right">
//             <div className="fake-dashboard-card">
//               <div className="fake-score-badge">
//                 <span className="fake-score-num">82</span>
//               </div>
//               <div className="fake-feedback-rows">
//                 <div className="fake-feedback-row success">
//                   <span className="fake-indicator" />
//                   ✓ Strong action verbs detected
//                 </div>
//                 <div className="fake-feedback-row success">
//                   <span className="fake-indicator" />
//                   ✓ Skills section present
//                 </div>
//                 <div className="fake-feedback-row warning">
//                   <span className="fake-indicator" />
//                   ⚠ Missing: quantified achievements
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Section 2 — Stats bar */}
//       <section className="landing-stats-bar">
//         <div className="landing-stats-inner">
//           <div className="landing-stat">
//             <p className="landing-stat-value">10,000+</p>
//             <p className="landing-stat-label">Resumes Analyzed</p>
//           </div>
//           <div className="landing-stat">
//             <p className="landing-stat-value">3x</p>
//             <p className="landing-stat-label">Faster Job Tracking</p>
//           </div>
//           <div className="landing-stat">
//             <p className="landing-stat-value">AI</p>
//             <p className="landing-stat-label">Powered Gap Analysis</p>
//           </div>
//         </div>
//       </section>

//       {/* Section 3 — How it works */}
//       <section id="how-it-works" className="landing-section">
//         <h2 className="landing-section-title">From Upload to Offer in 4 Steps</h2>
//         <div className="landing-steps">
//           <div className="landing-step">
//             <span className="step-badge">1</span>
//             <span className="step-icon">📄</span>
//             <h3>Upload Resume</h3>
//             <p>Drop your PDF or DOCX. We parse it instantly.</p>
//           </div>
//           <div className="landing-step">
//             <span className="step-badge">2</span>
//             <span className="step-icon">🎯</span>
//             <h3>Get Your ATS Score</h3>
//             <p>See exactly why ATS systems accept or reject your resume.</p>
//           </div>
//           <div className="landing-step">
//             <span className="step-badge">3</span>
//             <span className="step-icon">💼</span>
//             <h3>Track Applications</h3>
//             <p>Add jobs, paste JDs, get AI match scores automatically.</p>
//           </div>
//           <div className="landing-step">
//             <span className="step-badge">4</span>
//             <span className="step-icon">🤖</span>
//             <h3>Get AI Coaching</h3>
//             <p>Interview prep, resume fixes, and weekly insights.</p>
//           </div>
//         </div>
//       </section>

//       {/* Section 4 — Features */}
//       <section className="landing-section">
//         <h2 className="landing-section-title">Everything a Job Seeker Needs</h2>
//         <div className="landing-features">
//           <div className="landing-feature-card">
//             <span className="landing-feature-icon">📊</span>
//             <h3>Instant ATS Score</h3>
//             <p>
//               Get a 0-100 score with a detailed breakdown of what's hurting your
//               resume — formatting, keywords, structure, and more.
//             </p>
//           </div>
//           <div className="landing-feature-card">
//             <span className="landing-feature-icon">🤖</span>
//             <h3>AI Match Analysis</h3>
//             <p>
//               Paste any job description. Our AI compares it with your resume and
//               tells you exactly what to add, remove, or reframe.
//             </p>
//           </div>
//           <div className="landing-feature-card">
//             <span className="landing-feature-icon">📋</span>
//             <h3>Full Application Tracker</h3>
//             <p>
//               Track every application from Saved to Offer. Get interview prep the
//               moment you land an interview.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Section 5 — CTA Banner */}
//       <section className="landing-cta-banner">
//         <h2>Your next job starts with your resume.</h2>
//         <p>Check your ATS score in 30 seconds — no signup needed.</p>
//         <PrimaryButton onClick={() => navigate("/ats")}>
//           Analyze My Resume Free
//         </PrimaryButton>
//       </section>

//       {/* Section 6 — Footer */}
//       <footer className="landing-footer">
//         <span>© 2025 ATS Tracker. Built for job seekers.</span>
//         <div className="landing-footer-links">
//           <a href="#">Privacy</a>
//           <span>·</span>
//           <a href="#">Terms</a>
//         </div>
//       </footer>
//     </>
//   );
// }
