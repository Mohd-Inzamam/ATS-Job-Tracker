import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { getResumes } from "../services/resumeService";
import { analyzeMatch } from "../services/matchService";

export default function Match() {
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getResumes()
      .then(setResumes)
      .catch(() => setError("Failed to load resumes"));
  }, []);

  const handleAnalyze = async () => {
    if (!resumeId || !jobDescription.trim()) {
      setError("Please select a resume and paste a job description");
      return;
    }

    try {
      setError("");
      setResult(null);
      setLoading(true);
      const data = await analyzeMatch(resumeId, jobDescription);
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to analyze match");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setJobDescription("");
    setResumeId("");
  };

  // Score color based on percentage
  const getScoreColor = (score) => {
    if (score >= 70) return "#22c55e"; // green
    if (score >= 40) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Resume–JD Matcher</h2>
        <p>See how well your resume matches a job description</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!result ? (
        <div className="card">
          {/* Resume Selector */}
          <div className="form-group">
            <label>Select Resume</label>
            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}>
              <option value="">Choose a resume...</option>
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* JD Input */}
          <div className="form-group">
            <label>Paste Job Description</label>
            <textarea
              rows={8}
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Match"}
          </button>
        </div>
      ) : (
        <div className="match-result">
          {/* Score Circle */}
          <div className="card center">
            <div
              className="score-circle"
              style={{ borderColor: getScoreColor(result.matchPercentage) }}>
              <span
                className="score-number"
                style={{ color: getScoreColor(result.matchPercentage) }}>
                {result.matchPercentage}%
              </span>
              <span className="score-label">Match Score</span>
            </div>

            <p style={{ marginTop: "1rem", color: "#6b7280" }}>
              Resume: <strong>{result.resumeLabel}</strong>
            </p>
          </div>

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div className="card" style={{ marginTop: "1rem" }}>
              <h3>💡 Suggestions</h3>
              <ul className="suggestion-list">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Matched Keywords */}
          {result.matchedKeywords?.length > 0 && (
            <div className="card" style={{ marginTop: "1rem" }}>
              <h3>✅ Matched Keywords</h3>
              <div className="keyword-chips">
                {result.matchedKeywords.slice(0, 20).map((kw, i) => (
                  <span key={i} className="chip chip-green">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {result.missingKeywords?.length > 0 && (
            <div className="card" style={{ marginTop: "1rem" }}>
              <h3>❌ Missing Keywords</h3>
              <div className="keyword-chips">
                {result.missingKeywords.map((kw, i) => (
                  <span key={i} className="chip chip-red">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reset */}
          <button
            className="secondary-btn"
            onClick={handleReset}
            style={{ marginTop: "1.5rem" }}>
            Analyze Another
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
