import PublicNavbar from "../components/PublicNavbar";
import Footer from "../pages/Footer";
import { useNavigate } from "react-router-dom";

const VALUES = [
  {
    icon: "🎯",
    title: "Candidate-first",
    desc: "Every feature is built around one question: does this actually help someone land their next job?",
  },
  {
    icon: "🔍",
    title: "Explainable, not magic",
    desc: "Our ATS scoring is rule-based and transparent — you always know exactly why you got the score you did.",
  },
  {
    icon: "🆓",
    title: "Free to start",
    desc: "Core ATS checking is free, forever. No credit card, no trial countdown, no dark patterns.",
  },
];

const MILESTONES = [
  {
    year: "2025",
    title: "ATSPro is born",
    desc: "Started as a side project to solve a real, personal frustration with the job search.",
  },
  {
    year: "2025",
    title: "Public ATS Checker launches",
    desc: "Free, no-signup resume scoring goes live for anyone to try.",
  },
  {
    year: "2026",
    title: "Full job tracker & AI matching",
    desc: "Application pipeline, resume–JD matching, and AI coaching added.",
  },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="about-hero">
        <span className="landing-eyebrow">Our story</span>
        <h1>
          We built ATSPro because job hunting shouldn't feel like guessing.
        </h1>
        <p className="about-hero-sub">
          Millions of qualified candidates get filtered out by Applicant
          Tracking Systems before a human ever reads their resume. ATSPro exists
          to close that gap — with transparent scoring, honest feedback, and
          tools that actually move the needle on your job search.
        </p>
      </section>

      {/* Mission */}
      <section className="landing-section about-mission">
        <div className="about-mission-grid">
          <div>
            <span className="landing-eyebrow">Our mission</span>
            <h2 style={{ marginTop: "12px" }}>
              Give every job seeker the same advantage recruiters have.
            </h2>
            <p className="about-mission-text">
              Recruiters and hiring teams use ATS software to filter thousands
              of applications down to a shortlist. Most candidates have no idea
              what that software is actually looking for. We reverse-engineered
              the patterns that matter — section structure, keyword relevance,
              formatting compatibility — and put that knowledge directly in your
              hands, for free.
            </p>
            <p className="about-mission-text">
              We're not trying to game the system. We're trying to make sure
              good candidates with good resumes don't get rejected by a parser
              before a human ever sees their work.
            </p>
          </div>
          <div className="about-stats-card">
            <div className="about-stat">
              <span className="about-stat-num">10,000+</span>
              <span className="about-stat-label">Resumes analyzed</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-num">3×</span>
              <span className="about-stat-label">More interviews reported</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-num">Free</span>
              <span className="about-stat-label">Core ATS checker, always</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section
        className="landing-section"
        style={{ background: "var(--color-background-secondary)" }}>
        <h2 className="landing-section-title">What we stand for</h2>
        <div className="about-values-grid">
          {VALUES.map((v) => (
            <div key={v.title} className="about-value-card">
              <span className="about-value-icon">{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder */}
      <section className="landing-section about-founder-section">
        <span
          className="landing-eyebrow"
          style={{
            display: "block",
            textAlign: "center",
            marginBottom: "12px",
          }}>
          Who's behind this
        </span>
        <h2 className="landing-section-title">Meet the founder</h2>

        <div className="founder-card">
          <div className="founder-avatar">
            <span>MI</span>
          </div>
          <div className="founder-info">
            <h3 className="founder-name">Mohd Inzamam</h3>
            <p className="founder-role">Founder &amp; Full Stack Developer</p>
            <p className="founder-bio">
              I built ATSPro after watching too many strong candidates —
              including people I knew personally — get filtered out by ATS
              software before a recruiter ever saw their resume. As a full-stack
              developer working across the MERN stack, I wanted to apply that
              same engineering rigor to a problem that affects almost everyone
              at some point in their career: the opaque, frustrating first
              filter standing between a good resume and an interview.
            </p>
            <p className="founder-bio">
              ATSPro is built end-to-end — from the resume parsing engine to the
              AI-assisted scoring layer to the application tracker — with a
              focus on transparency over gimmicks. No vague "AI magic" claims;
              every score comes with a clear, explainable reason behind it.
            </p>
            <div className="founder-links">
              <a
                href="https://github.com/Mohd-Inzamam"
                target="_blank"
                rel="noopener noreferrer"
                className="founder-link">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.1 3.29 9.42 7.86 10.96.57.1.78-.25.78-.55v-2.1c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.29-1.68-1.29-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.72-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.83 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.65.79.55A10.53 10.53 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
                </svg>
                GitHub
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="founder-link">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section
        className="landing-section"
        style={{ background: "var(--color-background-secondary)" }}>
        <h2 className="landing-section-title">Where we've been</h2>
        <div className="about-timeline">
          {MILESTONES.map((m, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-marker">
                <span className="timeline-dot" />
                {i < MILESTONES.length - 1 && (
                  <span className="timeline-line" />
                )}
              </div>
              <div className="timeline-content">
                <span className="timeline-year">{m.year}</span>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta-banner">
        <h2>Ready to see where your resume stands?</h2>
        <p>Free ATS check, no signup required.</p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate("/ats")}>
          Check My Resume Free
        </button>
      </section>

      <Footer />
    </>
  );
}
