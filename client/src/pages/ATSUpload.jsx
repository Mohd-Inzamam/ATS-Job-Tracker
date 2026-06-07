import { useState } from "react";
import FileUploadBox from "../components/FileUploadBox";
import PrimaryButton from "../components/PrimaryButton";
import LoadingSkeleton from "../components/LoadingSkeleton";
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
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFile(null);
  };

  return (
    <>
      <PublicNavbar />

      <div className="upload-page">
        <div className="upload-wrapper">
          {!result ? (
            <>
              <div className="upload-header">
                <div className="upload-icon">
                  <span className="material-symbols-outlined">description</span>
                </div>

                <h2>ATS Resume Checker</h2>
                <p>
                  Upload your resume and get an instant compatibility score.
                </p>
              </div>

              <div className="upload-card">
                <FileUploadBox onFileSelect={setFile} />

                {loading && (
                  <div className="upload-loading">
                    <LoadingSkeleton />
                    <p>Analyzing your resume...</p>
                  </div>
                )}

                <PrimaryButton
                  onClick={handleCheck}
                  disabled={!file || loading}
                >
                  {loading ? "Analyzing..." : "Analyze Resume"}
                </PrimaryButton>
              </div>
            </>
          ) : (
            <>
              {result?.atsScore >= 80 && <Confetti numberOfPieces={200} />}
              <div className="drag-indicator" />
              <div className={`bottom-sheet ${result ? "open" : ""}`}>
                <div className="result-container">
                  {/* Layer 1 — Score */}
                  <ScoreBadge score={result.atsScore} />

                  {/* Layer 2 — Free sections */}
                  <div className="result-feedback">
                    {result.sections?.map((sec, idx) => (
                      <div
                        key={idx}
                        className="feedback-animate"
                        style={{ animationDelay: `${idx * 0.15}s` }}
                      >
                        <FeedbackCard
                          title={sec.title}
                          text={sec.feedback}
                          passed={sec.passed}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Layer 5 — Analyze another (above locked cards) */}
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleReset}
                    style={{ marginTop: "1rem", width: "100%" }}
                  >
                    ← Analyze Another Resume
                  </button>

                  {/* Layer 3 — Blurred premium sections */}
                  <div className="locked-sections" style={{ marginTop: "1.25rem" }}>
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

                  {/* Layer 4 — Signup wall */}
                  <div className="signup-wall">
                    <div className="signup-wall-left">
                      <p className="signup-wall-title">
                        Unlock your full ATS report
                      </p>
                      <p className="signup-wall-sub">
                        Free account · No credit card · Takes 30 seconds
                      </p>
                    </div>
                    <div className="signup-wall-right">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => navigate("/signup")}
                      >
                        Create free account →
                      </button>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => navigate("/login")}
                        style={{ fontSize: "13px" }}
                      >
                        Already have an account?
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
