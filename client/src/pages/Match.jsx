import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layout/DashboardLayout";
import { getResumes } from "../services/resumeService";
import { analyzeMatch } from "../services/matchService";

export default function Match() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const isFree = user?.plan !== "pro";

  useEffect(() => {
    if (isFree) return;
    getResumes()
      .then(setResumes)
      .catch(() => showToast("Failed to load resumes", "error"));
  }, [isFree]);

  const handleAnalyze = async () => {
    if (!resumeId || !jobDescription.trim()) {
      showToast("Please select a resume and paste a job description", "error");
      return;
    }
    try {
      setResult(null);
      setLoading(true);
      const data = await analyzeMatch(resumeId, jobDescription);
      setResult(data);
    } catch (err) {
      showToast(err.message || "Failed to analyze match", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setJobDescription("");
    setResumeId("");
  };

  const getScoreColor = (s) =>
    s >= 70 ? "#16a34a" : s >= 40 ? "#d97706" : "#ef4444";
  const getScoreBg = (s) =>
    s >= 70 ? "#dcfce7" : s >= 40 ? "#fef9c3" : "#fee2e2";
  const getScoreLabel = (s) =>
    s >= 70 ? "Strong Match" : s >= 40 ? "Partial Match" : "Low Match";

  /* ── Pro gate ── */
  if (isFree) {
    return (
      <DashboardLayout>
        <div className="page-enter pro-gate-page">
          <div className="pro-gate-card">
            <div className="pro-gate-icon">🎯</div>
            <h2>Resume–JD Matching</h2>
            <p>
              Compare your resume against any job description. See matched
              keywords, missing skills, and get AI-powered suggestions to close
              the gap.
            </p>
            <div className="pro-gate-features">
              {[
                "Match percentage score",
                "Matched & missing keyword breakdown",
                "Role-specific suggestions",
                "Unlimited analyses",
              ].map((f) => (
                <div key={f} className="pro-gate-feature">
                  <span style={{ color: "#16a34a", fontWeight: 700 }}>✓</span>{" "}
                  {f}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-primary"
              style={{ width: "100%" }}
              onClick={() => navigate("/pricing")}>
              Upgrade to Pro →
            </button>
            <p
              style={{
                fontSize: "12px",
                color: "var(--color-text-tertiary)",
                textAlign: "center",
                marginTop: "8px",
              }}>
              7-day free trial · Cancel anytime
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-enter">
        <div className="page-header">
          <h2>Resume–JD Matcher</h2>
          <p>See how well your resume matches a job description</p>
        </div>

        {!result ? (
          <div className="match-form-card">
            {/* Resume select */}
            <div className="field-group">
              <label className="field-label">
                <span className="material-symbols-outlined field-label-icon">
                  description
                </span>
                Select Resume
              </label>
              <div className="modern-select-wrap">
                <select
                  className="modern-select"
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}>
                  <option value="">Choose a resume…</option>
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined modern-select-arrow">
                  expand_more
                </span>
              </div>
            </div>

            {/* JD textarea */}
            <div className="field-group">
              <label className="field-label">
                <span className="material-symbols-outlined field-label-icon">
                  work
                </span>
                Job Description
              </label>
              <div className="modern-textarea-wrap">
                <textarea
                  className="modern-textarea"
                  rows={10}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here. The more complete it is, the better the analysis."
                />
                {jobDescription.length > 0 && (
                  <span className="textarea-char-count">
                    {jobDescription.length} chars
                  </span>
                )}
              </div>
              <p className="field-hint">
                Tip: Include the full JD — requirements, responsibilities, and
                qualifications.
              </p>
            </div>

            <button
              className="btn-primary"
              onClick={handleAnalyze}
              disabled={loading || !resumeId || !jobDescription.trim()}
              style={{ width: "100%" }}>
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
                  Analyzing match…
                </span>
              ) : (
                "Analyze Match →"
              )}
            </button>
          </div>
        ) : (
          <div className="match-result-wrap">
            {/* Score hero */}
            <div
              className="match-score-hero"
              style={{ background: getScoreBg(result.matchPercentage) }}>
              <div
                className="match-score-circle"
                style={{ borderColor: getScoreColor(result.matchPercentage) }}>
                <span
                  className="match-score-num"
                  style={{ color: getScoreColor(result.matchPercentage) }}>
                  {result.matchPercentage}%
                </span>
                <span className="match-score-sub">match</span>
              </div>
              <div className="match-score-meta">
                <p
                  className="match-score-label"
                  style={{ color: getScoreColor(result.matchPercentage) }}>
                  {getScoreLabel(result.matchPercentage)}
                </p>
                <p className="match-score-desc">
                  {result.matchPercentage >= 70
                    ? "Your resume is well-aligned with this role."
                    : result.matchPercentage >= 40
                      ? "Good start — a few targeted edits could significantly improve this."
                      : "There are significant gaps. Consider tailoring your resume for this role."}
                </p>
              </div>
            </div>

            {/* Keywords */}
            <div className="match-keywords-grid">
              {result.matchedKeywords?.length > 0 && (
                <div className="match-kw-section">
                  <p className="match-kw-title match-kw-title-green">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}>
                      check_circle
                    </span>
                    Matched Keywords ({result.matchedKeywords.length})
                  </p>
                  <div className="match-kw-pills">
                    {result.matchedKeywords.map((kw) => (
                      <span key={kw} className="kw-pill kw-pill-green">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.missingKeywords?.length > 0 && (
                <div className="match-kw-section">
                  <p className="match-kw-title match-kw-title-red">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}>
                      cancel
                    </span>
                    Missing Keywords ({result.missingKeywords.length})
                  </p>
                  <div className="match-kw-pills">
                    {result.missingKeywords.map((kw) => (
                      <span key={kw} className="kw-pill kw-pill-red">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div className="match-suggestions">
                <p className="match-suggestions-title">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}>
                    lightbulb
                  </span>
                  AI Suggestions
                </p>
                <div className="match-suggestion-list">
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="match-suggestion-item">
                      <span className="match-suggestion-num">{i + 1}</span>
                      <p>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn-primary"
              onClick={handleReset}
              style={{ width: "100%" }}>
              ← Analyze Another
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
