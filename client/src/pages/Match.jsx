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
      // cleared
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

  const getScoreColor = (score) => {
    if (score >= 70) return "#22c55e";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  if (isFree) {
    return (
      <DashboardLayout>
        <div className="page-enter pro-empty-state">
          <span className="pro-empty-icon">🎯</span>
          <h2>Resume–JD Matching is a Pro feature</h2>
          <p>
            Upgrade to compare your resume against any job description and get
            AI-powered gap analysis.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/pricing")}>
            Upgrade to Pro
          </button>
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
          <div className="card">
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

            <div className="form-group">
              <label>Paste Job Description</label>
              <textarea
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
              />
            </div>

            <button
              className="btn-primary"
              onClick={handleAnalyze}
              disabled={loading || !resumeId || !jobDescription.trim()}>
              {loading ? "Analyzing..." : "Analyze Match"}
            </button>
          </div>
        ) : (
          <div className="card">
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  border: `4px solid ${getScoreColor(result.matchPercentage)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: getScoreColor(result.matchPercentage),
                }}>
                {result.matchPercentage}%
              </div>
              <h3>Match Score</h3>
            </div>

            {result.matchedKeywords?.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <h4>Matched Keywords</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {result.matchedKeywords.map((kw) => (
                    <span
                      key={kw}
                      style={{
                        background: "#dcfce7",
                        color: "#15803d",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.missingKeywords?.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <h4>Missing Keywords</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {result.missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button className="btn-primary" onClick={handleReset}>
              Analyze Another
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
