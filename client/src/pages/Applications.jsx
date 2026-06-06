import { useEffect, useState, useRef } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import PipelineStatus from "../components/PipelineStatus";
import {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
} from "../services/applicationService";
import { getResumes } from "../services/resumeService";
import { parseJD } from "../services/aiService";

const STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

const getMatchBadge = (score) => {
  if (score === null || score === undefined)
    return { label: "No Score", color: "#6b7280", bg: "#6b728018" };
  if (score >= 70) return { label: "Strong Match", color: "#16a34a", bg: "#16a34a18" };
  if (score >= 40) return { label: "Partial Match", color: "#d97706", bg: "#d9770618" };
  return { label: "Low Match", color: "#dc2626", bg: "#dc262618" };
};

const getDaysSince = (dateStr) => {
  const days = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  return days === 0 ? "Today" : days === 1 ? "1 day ago" : `${days} days ago`;
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // AI parsing state
  const [parsing, setParsing] = useState(false);
  const [aiParsed, setAiParsed] = useState(false);
  const [detectedSkills, setDetectedSkills] = useState([]);
  const [detectedSeniority, setDetectedSeniority] = useState("");
  const [flashFields, setFlashFields] = useState({});
  const flashTimers = useRef({});

  const [form, setForm] = useState({
    companyName: "",
    jobTitle: "",
    jobDescription: "",
    resumeId: "",
  });

  // Load applications and resumes together
  useEffect(() => {
    const load = async () => {
      try {
        const [apps, res] = await Promise.all([
          getApplications(),
          getResumes(),
        ]);
        setApplications(apps);
        setResumes(res);
      } catch (err) {
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Flash a field with the .ai-filled class for 2000ms
  const flashField = (fieldName) => {
    if (flashTimers.current[fieldName]) {
      clearTimeout(flashTimers.current[fieldName]);
    }
    setFlashFields((prev) => ({ ...prev, [fieldName]: true }));
    flashTimers.current[fieldName] = setTimeout(() => {
      setFlashFields((prev) => ({ ...prev, [fieldName]: false }));
    }, 2000);
  };

  // Fires on textarea blur — triggers AI parse
  const handleJDBlur = async () => {
    if (form.jobDescription.trim().length <= 100) return;
    if (parsing) return;

    setParsing(true);
    try {
      const parsed = await parseJD(form.jobDescription);

      setForm((prev) => {
        const updates = {};
        let companyFilled = false;
        let titleFilled = false;

        if (!prev.companyName && parsed.companyName) {
          updates.companyName = parsed.companyName;
          companyFilled = true;
        }
        if (!prev.jobTitle && parsed.jobTitle) {
          updates.jobTitle = parsed.jobTitle;
          titleFilled = true;
        }

        // Trigger flash after state update
        if (companyFilled) flashField("companyName");
        if (titleFilled) flashField("jobTitle");

        return { ...prev, ...updates };
      });

      setDetectedSkills(parsed.skills ?? []);
      setDetectedSeniority(parsed.seniority ?? "");
      setAiParsed(true);
    } catch (err) {
      // Silently ignore — form still works
    } finally {
      setParsing(false);
    }
  };

  // Reset all AI state
  const resetAiState = () => {
    setParsing(false);
    setAiParsed(false);
    setDetectedSkills([]);
    setDetectedSeniority("");
    setFlashFields({});
    Object.values(flashTimers.current).forEach(clearTimeout);
    flashTimers.current = {};
  };

  // Build pipeline counts from real data
  const pipelineData = STATUSES.reduce((acc, status) => {
    acc[status.toLowerCase()] = applications.filter(
      (a) => a.status === status,
    ).length;
    return acc;
  }, {});

  const handleCreate = async () => {
    if (
      !form.companyName ||
      !form.jobTitle ||
      !form.jobDescription ||
      !form.resumeId
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const newApp = await createApplication(form);
      setApplications((prev) => [newApp, ...prev]);
      setForm({
        companyName: "",
        jobTitle: "",
        jobDescription: "",
        resumeId: "",
      });
      setShowForm(false);
      resetAiState();
    } catch (err) {
      setError(err.message || "Failed to create application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    resetAiState();
  };

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await updateApplicationStatus(id, status);
      setApplications((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a)),
      );
    } catch {
      setError("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      await deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a._id !== id));
    } catch {
      setError("Failed to delete application");
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <p>Loading...</p>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Applications</h2>
        <button
          className="btn-primary"
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setShowForm(true);
            }
          }}>
          {showForm ? "Cancel" : "+ Add Application"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Pipeline Summary */}
      <PipelineStatus data={pipelineData} />

      {/* Add Application Form */}
      {showForm && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3>New Application</h3>

          {/* Job Description — first so AI can pre-fill the fields below */}
          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label>Job Description</label>
            <textarea
              rows={5}
              placeholder="Paste the job description here… AI will auto-fill Company & Title on blur"
              value={form.jobDescription}
              onChange={(e) =>
                setForm({ ...form, jobDescription: e.target.value })
              }
              onBlur={handleJDBlur}
              style={{ width: "100%", resize: "vertical" }}
            />

            {/* Parsing spinner */}
            {parsing && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "6px",
                }}>
                <span className="parse-spinner" />
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  Extracting details from JD…
                </span>
              </div>
            )}

            {/* Success banner */}
            {aiParsed && !parsing && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "8px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  fontSize: "13px",
                  color: "#15803d",
                }}>
                <span>✓ Auto-filled from job description</span>
                <button
                  onClick={() => setAiParsed(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#15803d",
                    fontSize: "16px",
                    lineHeight: 1,
                    padding: "0 4px",
                  }}>
                  ×
                </button>
              </div>
            )}

            {/* Detected skill chips */}
            {detectedSkills.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 6px 0" }}>
                  Key requirements detected:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {detectedSkills.map((skill, i) => (
                    <span
                      key={i}
                      style={{
                        background: "#f3f4f6",
                        border: "0.5px solid #e5e7eb",
                        borderRadius: "20px",
                        padding: "2px 10px",
                        fontSize: "12px",
                        color: "#4b5563",
                      }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              placeholder="e.g. Google"
              value={form.companyName}
              className={flashFields.companyName ? "ai-filled" : ""}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>
              Job Title{" "}
              {detectedSeniority && (
                <span
                  style={{
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    borderRadius: "20px",
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: 500,
                    marginLeft: "6px",
                  }}>
                  {detectedSeniority}
                </span>
              )}
            </label>
            <input
              type="text"
              placeholder="e.g. Frontend Developer"
              value={form.jobTitle}
              className={flashFields.jobTitle ? "ai-filled" : ""}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Resume Used</label>
            <select
              value={form.resumeId}
              onChange={(e) => setForm({ ...form, resumeId: e.target.value })}>
              <option value="">Select a resume</option>
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}>
            <button
              className="btn-primary"
              onClick={handleCreate}
              disabled={submitting}>
              {submitting ? "Saving…" : "Save Application"}
            </button>
            <button
              className="delete-btn"
              style={{ border: "1px solid #e5e7eb", color: "#6b7280" }}
              onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="card center" style={{ marginTop: "2rem" }}>
          <p>No applications yet.</p>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            Add your first application to start tracking your job search.
          </p>
        </div>
      ) : (
        <div className="applications-list" style={{ marginTop: "1.5rem" }}>
          {applications.map((app) => (
            <div key={app._id} className="application-card card">
              <div className="app-card-header">
                <div>
                  <h3>{app.jobTitle}</h3>
                  <p className="company-name">{app.companyName}</p>
                  <p className="resume-label">
                    Resume: {app.resume?.label || "N/A"}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.2rem" }}>
                    Applied: {getDaysSince(app.createdAt)}
                  </p>

                  {/* Match Score Badge */}
                  {(() => {
                    const badge = getMatchBadge(app.matchScore);
                    return (
                      <div style={{ marginTop: "0.6rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 12px",
                            borderRadius: "999px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: badge.color,
                            background: badge.bg,
                          }}>
                          {app.matchScore !== null && app.matchScore !== undefined
                            ? `${app.matchScore}% — `
                            : ""}{badge.label}
                        </span>

                        {/* Missing keyword chips (shown when score < 70) */}
                        {app.matchScore < 70 &&
                          app.missingKeywords &&
                          app.missingKeywords.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "4px",
                                marginTop: "0.4rem",
                              }}>
                              {app.missingKeywords.slice(0, 3).map((kw, i) => (
                                <span
                                  key={i}
                                  style={{
                                    padding: "2px 8px",
                                    borderRadius: "999px",
                                    fontSize: "0.72rem",
                                    background: "#f3f4f6",
                                    color: "#374151",
                                    border: "1px solid #e5e7eb",
                                  }}>
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    );
                  })()}
                </div>

                <div className="app-card-actions">
                  <select
                    value={app.status}
                    onChange={(e) =>
                      handleStatusChange(app._id, e.target.value)
                    }>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(app._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
