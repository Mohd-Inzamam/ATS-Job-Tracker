import { useState } from "react";
import FileUploadBox from "../components/FileUploadBox";
import PrimaryButton from "../components/PrimaryButton";
import ScoreBadge from "../components/ScoreBadge";
import FeedbackCard from "../components/FeedbackCard";
import { checkATS } from "../services/atsService";
import PublicNavbar from "../components/PublicNavbar";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";

const LOCKED_SECTIONS = [
  {
    title: "AI Keyword Gap Analysis",
    desc: "See exactly which keywords are missing from your resume and why they matter for ATS systems.",
    blurContent: (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {[120, 80, 100, 60, 90, 70].map((w, i) => (
          <span key={i} className="fake-pill" style={{ width: w }} />
        ))}
      </div>
    ),
  },
  {
    title: "Personalized Fix Suggestions",
    desc: "Get 5 specific, actionable edits you can make right now to increase your score.",
    blurContent: (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span className="fake-line" style={{ width: "100%" }} />
        <span className="fake-line" style={{ width: "85%" }} />
        <span className="fake-line" style={{ width: "70%" }} />
      </div>
    ),
  },
  {
    title: "Resume Improvement Roadmap",
    desc: "A step-by-step plan to get your resume from your current score to 90+.",
    blurContent: (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {[100, 85, 70].map((w, i) => (
          <div key={i} className="fake-step">
            <span className="fake-step-dot" />
            <span className="fake-line" style={{ width: `${w}%`, flex: 1 }} />
          </div>
        ))}
      </div>
    ),
  },
];

function LockedCard({ title, desc, blurContent, onSignup }) {
  return (
    <div className="locked-card">
      <div className="locked-blur-content">{blurContent}</div>
      <div className="locked-overlay">
        <span className="locked-icon">🔒</span>
        <p className="locked-title">{title}</p>
        <p className="locked-desc">{desc}</p>
        <button type="button" className="locked-cta" onClick={onSignup}>
          Sign up free to unlock
        </button>
      </div>
    </div>
  );
}

/* ── Score colour helper ── */
const scoreColor = (s) =>
  s >= 70 ? "#16a34a" : s >= 40 ? "#d97706" : "#dc2626";
const scoreLabel = (s) => (s >= 70 ? "Great" : s >= 40 ? "Fair" : "Needs Work");
const scoreBg = (s) =>
  s >= 70
    ? "rgba(22,163,74,0.08)"
    : s >= 40
      ? "rgba(217,119,6,0.08)"
      : "rgba(220,38,38,0.08)";

export default function ATSUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleCheck = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await checkATS(file);
      setResult(res);
      sessionStorage.setItem(
        "guestATSResult",
        JSON.stringify({
          atsScore: res.atsScore,
          wordCount: res.wordCount,
          fileName: file.name,
          analyzedAt: new Date().toISOString(),
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFile(null);
  };

  /* ═══════════════════════════════════════════
     UPLOAD STATE
  ═══════════════════════════════════════════ */
  if (!result) {
    return (
      <>
        <PublicNavbar />
        <div className="ats-upload-page">
          <div className="ats-upload-center">
            <div className="ats-upload-hero">
              <div className="ats-upload-icon">
                <span className="material-symbols-outlined">description</span>
              </div>
              <h1>ATS Resume Checker</h1>
              <p>
                Find out why recruiters' ATS systems reject resumes — and fix
                yours before you apply.
              </p>
              <div className="ats-upload-trust">
                <span>✓ Free · No signup</span>
                <span>✓ Results in 5 seconds</span>
                <span>✓ PDF &amp; DOCX</span>
              </div>
            </div>

            <div className="ats-upload-card">
              <FileUploadBox onFileSelect={setFile} />

              {loading && (
                <div className="ats-analyzing">
                  <div className="ats-analyzing-bar">
                    <div className="ats-analyzing-fill" />
                  </div>
                  <p>Analyzing your resume…</p>
                </div>
              )}

              <PrimaryButton onClick={handleCheck} disabled={!file || loading}>
                {loading ? "Analyzing…" : "Analyze Resume"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ═══════════════════════════════════════════
     RESULT STATE — full-page layout
  ═══════════════════════════════════════════ */
  const color = scoreColor(result.atsScore);
  const label = scoreLabel(result.atsScore);
  const bg = scoreBg(result.atsScore);

  return (
    <>
      <PublicNavbar />
      {result.atsScore >= 80 && (
        <Confetti numberOfPieces={200} recycle={false} />
      )}

      <div className="ats-result-page">
        {/* ── Hero score band ── */}
        <div className="ats-score-band" style={{ background: bg }}>
          <div className="ats-score-band-inner">
            <div className="ats-score-left">
              <p className="ats-score-eyebrow">Your ATS Score</p>
              <div className="ats-score-display">
                <span className="ats-score-num" style={{ color }}>
                  {result.atsScore}
                </span>
                <span className="ats-score-max">/100</span>
              </div>
              <span
                className="ats-score-label"
                style={{ background: color + "20", color }}>
                {label}
              </span>
              <p className="ats-score-filename">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px", verticalAlign: "middle" }}>
                  description
                </span>
                &nbsp;{file?.name || "Your resume"}
              </p>
            </div>

            <div className="ats-score-ring-wrap">
              <ScoreBadge score={result.atsScore} />
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="ats-result-body">
          {/* Feedback sections */}
          <div className="ats-result-main">
            <div className="ats-result-section-title">
              <span className="material-symbols-outlined">fact_check</span>
              Resume Breakdown
            </div>

            <div className="ats-feedback-grid">
              {result.sections?.map((sec, idx) => (
                <div
                  key={idx}
                  className="feedback-animate"
                  style={{ animationDelay: `${idx * 0.1}s` }}>
                  <FeedbackCard
                    title={sec.title}
                    text={sec.feedback}
                    passed={sec.passed}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              className="secondary-btn"
              onClick={handleReset}
              style={{ marginTop: "1.5rem", width: "100%" }}>
              ← Analyze Another Resume
            </button>
          </div>

          {/* Sidebar — locked premium + signup */}
          <div className="ats-result-sidebar">
            <div className="ats-sidebar-sticky">
              <p className="ats-sidebar-heading">Unlock Full Report</p>

              <div className="ats-locked-list">
                {LOCKED_SECTIONS.map((section) => (
                  <LockedCard
                    key={section.title}
                    title={section.title}
                    desc={section.desc}
                    blurContent={section.blurContent}
                    onSignup={() => navigate("/signup")}
                  />
                ))}
              </div>

              <div className="ats-signup-cta">
                <p className="ats-signup-cta-title">
                  Free account — no card needed
                </p>
                <p className="ats-signup-cta-sub">
                  Save your score, track applications, get AI coaching.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: "100%" }}
                  onClick={() => navigate("/signup")}>
                  Create free account →
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ width: "100%", fontSize: "13px", marginTop: "8px" }}
                  onClick={() => navigate("/login")}>
                  Already have an account?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
