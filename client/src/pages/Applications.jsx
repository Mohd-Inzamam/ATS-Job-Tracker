import { useEffect, useState, useRef, Fragment } from "react";
import { useToast } from "../context/ToastContext";
import { useUpgradeModal } from "../context/UpgradeModalContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layout/DashboardLayout";
import EmptyState from "../components/EmptyState";
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
  if (score >= 70)
    return { label: "Strong Match", color: "#16a34a", bg: "#16a34a18" };
  if (score >= 40)
    return { label: "Partial Match", color: "#d97706", bg: "#d9770618" };
  return { label: "Low Match", color: "#dc2626", bg: "#dc262618" };
};

const getDaysSince = (dateStr) => {
  const days = Math.floor(
    (Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24),
  );
  return days === 0 ? "Today" : days === 1 ? "1 day ago" : `${days} days ago`;
};

export default function Applications() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showUpgradeModal } = useUpgradeModal();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // AI parsing state
  const [parsing, setParsing] = useState(false);
  const [aiParsed, setAiParsed] = useState(false);
  const [detectedSkills, setDetectedSkills] = useState([]);
  const [detectedSeniority, setDetectedSeniority] = useState("");
  const [flashFields, setFlashFields] = useState({});
  const flashTimers = useRef({});

  // Expandable AI advice card list
  const [expandedCards, setExpandedCards] = useState(new Set());

  // Interview Prep State
  const [prepCard, setPrepCard] = useState(null);
  const [prepFilter, setPrepFilter] = useState("All");

  useEffect(() => {
    setPrepFilter("All");
  }, [prepCard]);

  const toggleExpandCard = (id) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
        showToast("Failed to load data. Please try again.", "error");
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
      showToast("All fields are required", "error");
      return;
    }

    try {
      setSubmitting(true);
      // cleared
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

      if (newApp.aiExplanation && newApp.aiExplanation.verdict) {
        setExpandedCards((prev) => {
          const next = new Set(prev);
          next.add(newApp._id);
          return next;
        });
      }
    } catch (err) {
      showToast(err.message || "Failed to create application", "error");
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
      if (
        status === "Interview" &&
        updated.interviewPrep?.questions?.length > 0
      ) {
        setPrepCard(updated._id);
      }
      if (status !== "Interview") {
        setPrepCard((prev) => (prev === id ? null : prev));
      }
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      await deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a._id !== id));
    } catch {
      showToast("Failed to delete application", "error");
    }
  };

  const isFree = user?.plan !== "pro";
  const FREE_APP_LIMIT = 10;
  const atAppLimit = isFree && applications.length >= FREE_APP_LIMIT;
  const atAppWarning =
    isFree && applications.length >= 7 && applications.length < FREE_APP_LIMIT;

  if (loading)
    return (
      <DashboardLayout>
        <p>Loading...</p>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="page-enter">
        <div className="page-header">
          <h2>Applications</h2>
          <button
            className="btn-primary"
            disabled={atAppLimit}
            title={atAppLimit ? "Upgrade to add more applications" : ""}
            onClick={() => {
              if (atAppLimit) return;
              if (showForm) {
                handleCancel();
              } else {
                setShowForm(true);
              }
            }}>
            {showForm ? "Cancel" : "+ Add Application"}
          </button>
        </div>

        {atAppLimit && (
          <div className="usage-banner usage-banner-warning">
            ✦ You've reached the free plan application limit.{" "}
            <button
              type="button"
              className="usage-banner-link"
              onClick={() =>
                showUpgradeModal(
                  "applications",
                  `Free plan allows ${FREE_APP_LIMIT} applications. Upgrade to Pro for unlimited.`,
                )
              }>
              Upgrade to Pro for unlimited →
            </button>
          </div>
        )}

        {atAppWarning && (
          <div className="usage-banner usage-banner-info">
            ✦ {applications.length}/5 applications used. Running low?{" "}
            <button
              type="button"
              className="usage-banner-link usage-banner-link-info"
              onClick={() =>
                showUpgradeModal(
                  "applications",
                  `Free plan allows ${FREE_APP_LIMIT} applications. Upgrade to Pro for unlimited.`,
                )
              }>
              Upgrade for unlimited →
            </button>
          </div>
        )}

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
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: "0 0 6px 0",
                    }}>
                    Key requirements detected:
                  </p>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
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
                onChange={(e) =>
                  setForm({ ...form, resumeId: e.target.value })
                }>
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
        {!loading && applications.length === 0 ? (
          <EmptyState
            icon="💼"
            title="Your pipeline is empty"
            body="Add your first job application — paste a JD and AI will auto-fill the details."
            ctaLabel="Add Application"
            onCta={() => setShowForm(true)}
            secondaryLabel="Browse jobs on LinkedIn →"
            onSecondary={() =>
              window.open("https://linkedin.com/jobs", "_blank")
            }
          />
        ) : (
          <div className="applications-list" style={{ marginTop: "1.5rem" }}>
            {applications.map((app) => (
              <Fragment key={app._id}>
                <div className="application-card card stagger-item">
                  <div className="app-card-header">
                    <div>
                      <h3>{app.jobTitle}</h3>
                      <p className="company-name">{app.companyName}</p>
                      <p className="resume-label">
                        Resume: {app.resume?.label || "N/A"}
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                          marginTop: "0.2rem",
                        }}>
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
                              {app.matchScore !== null &&
                              app.matchScore !== undefined
                                ? `${app.matchScore}% — `
                                : ""}
                              {badge.label}
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
                                  {app.missingKeywords
                                    .slice(0, 3)
                                    .map((kw, i) => (
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

                  {/* Inline Action Buttons at bottom of card */}
                  {((app.aiExplanation && app.aiExplanation.verdict) ||
                    (app.interviewPrep &&
                      app.interviewPrep.questions &&
                      app.interviewPrep.questions.length > 0)) && (
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        marginTop: "0.8rem",
                        borderTop: "1px solid #e5e7eb",
                        paddingTop: "0.8rem",
                      }}>
                      {app.aiExplanation && app.aiExplanation.verdict && (
                        <button
                          onClick={() => toggleExpandCard(app._id)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            fontSize: "12px",
                            color: "var(--color-text-info)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}>
                          ✦{" "}
                          {expandedCards.has(app._id)
                            ? "Hide Advice"
                            : "See AI Advice"}
                        </button>
                      )}

                      {app.interviewPrep &&
                        app.interviewPrep.questions &&
                        app.interviewPrep.questions.length > 0 && (
                          <button
                            onClick={() =>
                              setPrepCard(prepCard === app._id ? null : app._id)
                            }
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              fontSize: "12px",
                              color: "var(--color-text-info)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}>
                            🎯{" "}
                            {prepCard === app._id
                              ? "Hide Prep"
                              : "View Interview Prep"}
                          </button>
                        )}
                    </div>
                  )}

                  {/* Expanded AI Advice block */}
                  {app.aiExplanation &&
                    app.aiExplanation.verdict &&
                    expandedCards.has(app._id) && (
                      <div
                        style={{
                          background: "var(--color-background-secondary)",
                          borderRadius: "var(--border-radius-md)",
                          padding: "12px",
                          marginTop: "8px",
                        }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "8px",
                            fontSize: "13px",
                            color: "var(--color-text-primary)",
                            fontWeight: 500,
                          }}>
                          <span>✦ {app.aiExplanation.verdict}</span>
                          {app.aiExplanation.shouldApply ? (
                            <span
                              style={{
                                display: "inline-block",
                                borderRadius: "20px",
                                fontSize: "11px",
                                padding: "2px 8px",
                                color: "#16a34a",
                                background: "#16a34a18",
                                fontWeight: 700,
                              }}>
                              Apply ✓
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-block",
                                borderRadius: "20px",
                                fontSize: "11px",
                                padding: "2px 8px",
                                color: "#d97706",
                                background: "#d9770618",
                                fontWeight: 700,
                              }}>
                              Tailor First
                            </span>
                          )}
                        </div>

                        {app.aiExplanation.quickWins &&
                          app.aiExplanation.quickWins.length > 0 && (
                            <div style={{ marginTop: "8px" }}>
                              <div
                                style={{
                                  fontSize: "11px",
                                  textTransform: "uppercase",
                                  color: "#6b7280",
                                  fontWeight: 600,
                                  letterSpacing: "0.05em",
                                }}>
                                Quick wins:
                              </div>
                              <div style={{ marginTop: "4px" }}>
                                {app.aiExplanation.quickWins.map((win, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      fontSize: "12.5px",
                                      color: "var(--color-text-secondary)",
                                      lineHeight: 1.7,
                                    }}>
                                    → {win}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {app.aiExplanation.missingSkillsContext && (
                          <div
                            style={{
                              fontStyle: "italic",
                              fontSize: "12px",
                              color: "var(--color-text-tertiary)",
                              marginTop: "6px",
                            }}>
                            {app.aiExplanation.missingSkillsContext}
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {/* Expandable AI Interview Prep Panel (inline below application card) */}
                {prepCard === app._id &&
                  app.interviewPrep &&
                  app.interviewPrep.questions &&
                  app.interviewPrep.questions.length > 0 && (
                    <div
                      style={{
                        background: "var(--color-background-primary)",
                        border: "0.5px solid var(--color-border-info)",
                        borderRadius: "var(--border-radius-lg)",
                        padding: "1.25rem",
                        marginTop: "-4px",
                        marginBottom: "1rem",
                      }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.75rem",
                        }}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "var(--color-text-primary)",
                          }}>
                          🎯 Interview Prep{" "}
                          <span
                            style={{
                              fontSize: "13px",
                              color: "var(--color-text-secondary)",
                              fontWeight: 400,
                              marginLeft: "4px",
                            }}>
                            · {app.companyName}
                          </span>
                        </div>
                        <button
                          onClick={() => setPrepCard(null)}
                          style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "18px",
                            cursor: "pointer",
                            color: "var(--color-text-secondary)",
                            padding: "0 4px",
                            lineHeight: 1,
                          }}>
                          ×
                        </button>
                      </div>

                      {app.interviewPrep.watchOutFor && (
                        <div
                          style={{
                            borderBottom:
                              "0.5px solid var(--color-border-tertiary)",
                            paddingBottom: "0.75rem",
                            marginBottom: "0.75rem",
                          }}>
                          <div
                            style={{
                              fontSize: "11px",
                              textTransform: "uppercase",
                              color: "var(--color-text-tertiary)",
                              fontWeight: 600,
                              letterSpacing: "0.05em",
                            }}>
                            Watch out for:
                          </div>
                          <div
                            style={{
                              fontStyle: "italic",
                              fontSize: "13px",
                              color: "var(--color-text-secondary)",
                              marginTop: "4px",
                            }}>
                            "{app.interviewPrep.watchOutFor}"
                          </div>
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                          marginBottom: "1rem",
                        }}>
                        {["All", "Technical", "Behavioural", "Culture Fit"].map(
                          (filter) => {
                            const isActive = prepFilter === filter;
                            return (
                              <button
                                key={filter}
                                onClick={() => setPrepFilter(filter)}
                                style={{
                                  fontSize: "12px",
                                  borderRadius: "20px",
                                  padding: "3px 12px",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                  ...(isActive
                                    ? {
                                        background:
                                          "var(--color-background-info)",
                                        color: "var(--color-text-info)",
                                        border: "none",
                                        fontWeight: 600,
                                      }
                                    : {
                                        background: "transparent",
                                        color: "var(--color-text-secondary)",
                                        border:
                                          "0.5px solid var(--color-border-secondary)",
                                      }),
                                }}>
                                {filter}
                              </button>
                            );
                          },
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "1rem",
                        }}>
                        {app.interviewPrep.questions
                          .filter(
                            (q) =>
                              prepFilter === "All" || q.type === prepFilter,
                          )
                          .map((q, idx, arr) => {
                            let badgeBg = "var(--color-background-info)";
                            let badgeColor = "var(--color-text-info)";
                            if (q.type === "Behavioural") {
                              badgeBg = "#EEEDFE";
                              badgeColor = "#534AB7";
                            } else if (q.type === "Culture Fit") {
                              badgeBg = "var(--color-background-success)";
                              badgeColor = "var(--color-text-success)";
                            }

                            return (
                              <div
                                key={idx}
                                style={{
                                  paddingBottom:
                                    idx < arr.length - 1 ? "1rem" : 0,
                                  borderBottom:
                                    idx < arr.length - 1
                                      ? "0.5px solid var(--color-border-tertiary)"
                                      : "none",
                                }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "8px",
                                    flexWrap: "wrap",
                                  }}>
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 700,
                                      textTransform: "uppercase",
                                      background: badgeBg,
                                      color: badgeColor,
                                      padding: "2px 8px",
                                      borderRadius: "12px",
                                      marginTop: "2px",
                                    }}>
                                    {q.type}
                                  </span>
                                  <div
                                    style={{
                                      flex: 1,
                                      fontSize: "13px",
                                      color: "var(--color-text-primary)",
                                      fontWeight: 500,
                                    }}>
                                    {q.question}
                                  </div>
                                </div>
                                {q.hint && (
                                  <div
                                    style={{
                                      fontSize: "12.5px",
                                      color: "var(--color-text-secondary)",
                                      marginTop: "4px",
                                      paddingLeft: "8px",
                                    }}>
                                    → {q.hint}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>

                      {app.interviewPrep.tipsForThisRole &&
                        app.interviewPrep.tipsForThisRole.length > 0 && (
                          <div
                            style={{
                              borderTop:
                                "0.5px solid var(--color-border-tertiary)",
                              paddingTop: "0.75rem",
                              marginTop: "1rem",
                            }}>
                            <div
                              style={{
                                fontSize: "11px",
                                textTransform: "uppercase",
                                color: "var(--color-text-tertiary)",
                                fontWeight: 600,
                                letterSpacing: "0.05em",
                                marginBottom: "6px",
                              }}>
                              Tips for this role:
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}>
                              {app.interviewPrep.tipsForThisRole.map(
                                (tip, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      fontSize: "12.5px",
                                      color: "var(--color-text-secondary)",
                                    }}>
                                    • {tip}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// import { useEffect, useState, useRef, Fragment } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import DashboardLayout from "../layout/DashboardLayout";
// import EmptyState from "../components/EmptyState";
// import PipelineStatus from "../components/PipelineStatus";
// import {
//   getApplications,
//   createApplication,
//   updateApplicationStatus,
//   deleteApplication,
// } from "../services/applicationService";
// import { getResumes } from "../services/resumeService";
// import { parseJD } from "../services/aiService";

// const STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

// const getMatchBadge = (score) => {
//   if (score === null || score === undefined)
//     return { label: "No Score", color: "#6b7280", bg: "#6b728018" };
//   if (score >= 70) return { label: "Strong Match", color: "#16a34a", bg: "#16a34a18" };
//   if (score >= 40) return { label: "Partial Match", color: "#d97706", bg: "#d9770618" };
//   return { label: "Low Match", color: "#dc2626", bg: "#dc262618" };
// };

// const getDaysSince = (dateStr) => {
//   const days = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
//   return days === 0 ? "Today" : days === 1 ? "1 day ago" : `${days} days ago`;
// };

// export default function Applications() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [applications, setApplications] = useState([]);
//   const [resumes, setResumes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [showForm, setShowForm] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   // AI parsing state
//   const [parsing, setParsing] = useState(false);
//   const [aiParsed, setAiParsed] = useState(false);
//   const [detectedSkills, setDetectedSkills] = useState([]);
//   const [detectedSeniority, setDetectedSeniority] = useState("");
//   const [flashFields, setFlashFields] = useState({});
//   const flashTimers = useRef({});

//   // Expandable AI advice card list
//   const [expandedCards, setExpandedCards] = useState(new Set());

//   // Interview Prep State
//   const [prepCard, setPrepCard] = useState(null);
//   const [prepFilter, setPrepFilter] = useState("All");

//   useEffect(() => {
//     setPrepFilter("All");
//   }, [prepCard]);

//   const toggleExpandCard = (id) => {
//     setExpandedCards((prev) => {
//       const next = new Set(prev);
//       if (next.has(id)) {
//         next.delete(id);
//       } else {
//         next.add(id);
//       }
//       return next;
//     });
//   };

//   const [form, setForm] = useState({
//     companyName: "",
//     jobTitle: "",
//     jobDescription: "",
//     resumeId: "",
//   });

//   // Load applications and resumes together
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [apps, res] = await Promise.all([
//           getApplications(),
//           getResumes(),
//         ]);
//         setApplications(apps);
//         setResumes(res);
//       } catch (err) {
//         setError("Failed to load data. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);

//   // Flash a field with the .ai-filled class for 2000ms
//   const flashField = (fieldName) => {
//     if (flashTimers.current[fieldName]) {
//       clearTimeout(flashTimers.current[fieldName]);
//     }
//     setFlashFields((prev) => ({ ...prev, [fieldName]: true }));
//     flashTimers.current[fieldName] = setTimeout(() => {
//       setFlashFields((prev) => ({ ...prev, [fieldName]: false }));
//     }, 2000);
//   };

//   // Fires on textarea blur — triggers AI parse
//   const handleJDBlur = async () => {
//     if (form.jobDescription.trim().length <= 100) return;
//     if (parsing) return;

//     setParsing(true);
//     try {
//       const parsed = await parseJD(form.jobDescription);

//       setForm((prev) => {
//         const updates = {};
//         let companyFilled = false;
//         let titleFilled = false;

//         if (!prev.companyName && parsed.companyName) {
//           updates.companyName = parsed.companyName;
//           companyFilled = true;
//         }
//         if (!prev.jobTitle && parsed.jobTitle) {
//           updates.jobTitle = parsed.jobTitle;
//           titleFilled = true;
//         }

//         // Trigger flash after state update
//         if (companyFilled) flashField("companyName");
//         if (titleFilled) flashField("jobTitle");

//         return { ...prev, ...updates };
//       });

//       setDetectedSkills(parsed.skills ?? []);
//       setDetectedSeniority(parsed.seniority ?? "");
//       setAiParsed(true);
//     } catch (err) {
//       // Silently ignore — form still works
//     } finally {
//       setParsing(false);
//     }
//   };

//   // Reset all AI state
//   const resetAiState = () => {
//     setParsing(false);
//     setAiParsed(false);
//     setDetectedSkills([]);
//     setDetectedSeniority("");
//     setFlashFields({});
//     Object.values(flashTimers.current).forEach(clearTimeout);
//     flashTimers.current = {};
//   };

//   // Build pipeline counts from real data
//   const pipelineData = STATUSES.reduce((acc, status) => {
//     acc[status.toLowerCase()] = applications.filter(
//       (a) => a.status === status,
//     ).length;
//     return acc;
//   }, {});

//   const handleCreate = async () => {
//     if (
//       !form.companyName ||
//       !form.jobTitle ||
//       !form.jobDescription ||
//       !form.resumeId
//     ) {
//       setError("All fields are required");
//       return;
//     }

//     try {
//       setSubmitting(true);
//       setError("");
//       const newApp = await createApplication(form);
//       setApplications((prev) => [newApp, ...prev]);
//       setForm({
//         companyName: "",
//         jobTitle: "",
//         jobDescription: "",
//         resumeId: "",
//       });
//       setShowForm(false);
//       resetAiState();

//       if (newApp.aiExplanation && newApp.aiExplanation.verdict) {
//         setExpandedCards((prev) => {
//           const next = new Set(prev);
//           next.add(newApp._id);
//           return next;
//         });
//       }
//     } catch (err) {
//       setError(err.message || "Failed to create application");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleCancel = () => {
//     setShowForm(false);
//     resetAiState();
//   };

//   const handleStatusChange = async (id, status) => {
//     try {
//       const updated = await updateApplicationStatus(id, status);
//       setApplications((prev) =>
//         prev.map((a) => (a._id === updated._id ? updated : a)),
//       );
//       if (status === "Interview" && updated.interviewPrep?.questions?.length > 0) {
//         setPrepCard(updated._id);
//       }
//       if (status !== "Interview") {
//         setPrepCard((prev) => (prev === id ? null : prev));
//       }
//     } catch {
//       setError("Failed to update status");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this application?")) return;
//     try {
//       await deleteApplication(id);
//       setApplications((prev) => prev.filter((a) => a._id !== id));
//     } catch {
//       setError("Failed to delete application");
//     }
//   };

//   const isFree = user?.plan !== "pro";
//   const atAppLimit = isFree && applications.length >= 5;
//   const atAppWarning = isFree && applications.length >= 3 && applications.length < 5;

//   if (loading)
//     return (
//       <DashboardLayout>
//         <p>Loading...</p>
//       </DashboardLayout>
//     );

//   return (
//     <DashboardLayout>
//       <div className="page-enter">
//       <div className="page-header">
//         <h2>Applications</h2>
//         <button
//           className="btn-primary"
//           disabled={atAppLimit}
//           title={atAppLimit ? "Upgrade to add more applications" : ""}
//           onClick={() => {
//             if (atAppLimit) return;
//             if (showForm) {
//               handleCancel();
//             } else {
//               setShowForm(true);
//             }
//           }}
//         >
//           {showForm ? "Cancel" : "+ Add Application"}
//         </button>
//       </div>

//       {atAppLimit && (
//         <div className="usage-banner usage-banner-warning">
//           ✦ You've reached the 5 application limit on the free plan.{" "}
//           <button
//             type="button"
//             className="usage-banner-link"
//             onClick={() => navigate("/pricing")}
//           >
//             Upgrade to Pro for unlimited →
//           </button>
//         </div>
//       )}

//       {atAppWarning && (
//         <div className="usage-banner usage-banner-info">
//           ✦ {applications.length}/5 applications used. Running low?{" "}
//           <button
//             type="button"
//             className="usage-banner-link usage-banner-link-info"
//             onClick={() => navigate("/pricing")}
//           >
//             Upgrade for unlimited →
//           </button>
//         </div>
//       )}

//       {error && <div className="error-banner">{error}</div>}

//       {/* Pipeline Summary */}
//       <PipelineStatus data={pipelineData} />

//       {/* Add Application Form */}
//       {showForm && (
//         <div className="card" style={{ marginTop: "1.5rem" }}>
//           <h3>New Application</h3>

//           {/* Job Description — first so AI can pre-fill the fields below */}
//           <div className="form-group" style={{ marginTop: "1rem" }}>
//             <label>Job Description</label>
//             <textarea
//               rows={5}
//               placeholder="Paste the job description here… AI will auto-fill Company & Title on blur"
//               value={form.jobDescription}
//               onChange={(e) =>
//                 setForm({ ...form, jobDescription: e.target.value })
//               }
//               onBlur={handleJDBlur}
//               style={{ width: "100%", resize: "vertical" }}
//             />

//             {/* Parsing spinner */}
//             {parsing && (
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "8px",
//                   marginTop: "6px",
//                 }}>
//                 <span className="parse-spinner" />
//                 <span style={{ fontSize: "12px", color: "#6b7280" }}>
//                   Extracting details from JD…
//                 </span>
//               </div>
//             )}

//             {/* Success banner */}
//             {aiParsed && !parsing && (
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   marginTop: "8px",
//                   padding: "8px 12px",
//                   borderRadius: "8px",
//                   background: "#f0fdf4",
//                   border: "1px solid #bbf7d0",
//                   fontSize: "13px",
//                   color: "#15803d",
//                 }}>
//                 <span>✓ Auto-filled from job description</span>
//                 <button
//                   onClick={() => setAiParsed(false)}
//                   style={{
//                     background: "none",
//                     border: "none",
//                     cursor: "pointer",
//                     color: "#15803d",
//                     fontSize: "16px",
//                     lineHeight: 1,
//                     padding: "0 4px",
//                   }}>
//                   ×
//                 </button>
//               </div>
//             )}

//             {/* Detected skill chips */}
//             {detectedSkills.length > 0 && (
//               <div style={{ marginTop: "10px" }}>
//                 <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 6px 0" }}>
//                   Key requirements detected:
//                 </p>
//                 <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
//                   {detectedSkills.map((skill, i) => (
//                     <span
//                       key={i}
//                       style={{
//                         background: "#f3f4f6",
//                         border: "0.5px solid #e5e7eb",
//                         borderRadius: "20px",
//                         padding: "2px 10px",
//                         fontSize: "12px",
//                         color: "#4b5563",
//                       }}>
//                       {skill}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="form-group">
//             <label>Company Name</label>
//             <input
//               type="text"
//               placeholder="e.g. Google"
//               value={form.companyName}
//               className={flashFields.companyName ? "ai-filled" : ""}
//               onChange={(e) =>
//                 setForm({ ...form, companyName: e.target.value })
//               }
//             />
//           </div>

//           <div className="form-group">
//             <label>
//               Job Title{" "}
//               {detectedSeniority && (
//                 <span
//                   style={{
//                     background: "#eff6ff",
//                     color: "#1d4ed8",
//                     borderRadius: "20px",
//                     padding: "2px 8px",
//                     fontSize: "11px",
//                     fontWeight: 500,
//                     marginLeft: "6px",
//                   }}>
//                   {detectedSeniority}
//                 </span>
//               )}
//             </label>
//             <input
//               type="text"
//               placeholder="e.g. Frontend Developer"
//               value={form.jobTitle}
//               className={flashFields.jobTitle ? "ai-filled" : ""}
//               onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
//             />
//           </div>

//           <div className="form-group">
//             <label>Resume Used</label>
//             <select
//               value={form.resumeId}
//               onChange={(e) => setForm({ ...form, resumeId: e.target.value })}>
//               <option value="">Select a resume</option>
//               {resumes.map((r) => (
//                 <option key={r._id} value={r._id}>
//                   {r.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}>
//             <button
//               className="btn-primary"
//               onClick={handleCreate}
//               disabled={submitting}>
//               {submitting ? "Saving…" : "Save Application"}
//             </button>
//             <button
//               className="delete-btn"
//               style={{ border: "1px solid #e5e7eb", color: "#6b7280" }}
//               onClick={handleCancel}>
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Applications List */}
//       {!loading && applications.length === 0 ? (
//         <EmptyState
//           icon="💼"
//           title="Your pipeline is empty"
//           body="Add your first job application — paste a JD and AI will auto-fill the details."
//           ctaLabel="Add Application"
//           onCta={() => setShowForm(true)}
//           secondaryLabel="Browse jobs on LinkedIn →"
//           onSecondary={() => window.open("https://linkedin.com/jobs", "_blank")}
//         />
//       ) : (
//         <div className="applications-list" style={{ marginTop: "1.5rem" }}>
//           {applications.map((app) => (
//             <Fragment key={app._id}>
//               <div className="application-card card stagger-item">
//                 <div className="app-card-header">
//                   <div>
//                     <h3>{app.jobTitle}</h3>
//                     <p className="company-name">{app.companyName}</p>
//                     <p className="resume-label">
//                       Resume: {app.resume?.label || "N/A"}
//                     </p>
//                     <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.2rem" }}>
//                       Applied: {getDaysSince(app.createdAt)}
//                     </p>

//                     {/* Match Score Badge */}
//                     {(() => {
//                       const badge = getMatchBadge(app.matchScore);
//                       return (
//                         <div style={{ marginTop: "0.6rem" }}>
//                           <span
//                             style={{
//                               display: "inline-block",
//                               padding: "3px 12px",
//                               borderRadius: "999px",
//                               fontSize: "0.8rem",
//                               fontWeight: 700,
//                               color: badge.color,
//                               background: badge.bg,
//                             }}>
//                             {app.matchScore !== null && app.matchScore !== undefined
//                               ? `${app.matchScore}% — `
//                               : ""}{badge.label}
//                           </span>

//                           {/* Missing keyword chips (shown when score < 70) */}
//                           {app.matchScore < 70 &&
//                             app.missingKeywords &&
//                             app.missingKeywords.length > 0 && (
//                               <div
//                                 style={{
//                                   display: "flex",
//                                   flexWrap: "wrap",
//                                   gap: "4px",
//                                   marginTop: "0.4rem",
//                                 }}>
//                                 {app.missingKeywords.slice(0, 3).map((kw, i) => (
//                                   <span
//                                     key={i}
//                                     style={{
//                                       padding: "2px 8px",
//                                       borderRadius: "999px",
//                                       fontSize: "0.72rem",
//                                       background: "#f3f4f6",
//                                       color: "#374151",
//                                       border: "1px solid #e5e7eb",
//                                     }}>
//                                     {kw}
//                                   </span>
//                                 ))}
//                               </div>
//                             )}
//                         </div>
//                       );
//                     })()}
//                   </div>

//                   <div className="app-card-actions">
//                     <select
//                       value={app.status}
//                       onChange={(e) =>
//                         handleStatusChange(app._id, e.target.value)
//                       }>
//                       {STATUSES.map((s) => (
//                         <option key={s} value={s}>
//                           {s}
//                         </option>
//                       ))}
//                     </select>

//                     <button
//                       className="btn-danger"
//                       onClick={() => handleDelete(app._id)}>
//                       Delete
//                     </button>
//                   </div>
//                 </div>

//                 {/* Inline Action Buttons at bottom of card */}
//                 {((app.aiExplanation && app.aiExplanation.verdict) || (app.interviewPrep && app.interviewPrep.questions && app.interviewPrep.questions.length > 0)) && (
//                   <div style={{ display: "flex", gap: "16px", marginTop: "0.8rem", borderTop: "1px solid #e5e7eb", paddingTop: "0.8rem" }}>
//                     {app.aiExplanation && app.aiExplanation.verdict && (
//                       <button
//                         onClick={() => toggleExpandCard(app._id)}
//                         style={{
//                           background: "none",
//                           border: "none",
//                           padding: 0,
//                           fontSize: "12px",
//                           color: "var(--color-text-info)",
//                           cursor: "pointer",
//                           display: "inline-flex",
//                           alignItems: "center",
//                           gap: "4px",
//                         }}>
//                         ✦ {expandedCards.has(app._id) ? "Hide Advice" : "See AI Advice"}
//                       </button>
//                     )}

//                     {app.interviewPrep && app.interviewPrep.questions && app.interviewPrep.questions.length > 0 && (
//                       <button
//                         onClick={() => setPrepCard(prepCard === app._id ? null : app._id)}
//                         style={{
//                           background: "none",
//                           border: "none",
//                           padding: 0,
//                           fontSize: "12px",
//                           color: "var(--color-text-info)",
//                           cursor: "pointer",
//                           display: "inline-flex",
//                           alignItems: "center",
//                           gap: "4px",
//                         }}>
//                         🎯 {prepCard === app._id ? "Hide Prep" : "View Interview Prep"}
//                       </button>
//                     )}
//                   </div>
//                 )}

//                 {/* Expanded AI Advice block */}
//                 {app.aiExplanation && app.aiExplanation.verdict && expandedCards.has(app._id) && (
//                   <div
//                     style={{
//                       background: "var(--color-background-secondary)",
//                       borderRadius: "var(--border-radius-md)",
//                       padding: "12px",
//                       marginTop: "8px",
//                     }}>
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         flexWrap: "wrap",
//                         gap: "8px",
//                         fontSize: "13px",
//                         color: "var(--color-text-primary)",
//                         fontWeight: 500,
//                       }}>
//                       <span>✦ {app.aiExplanation.verdict}</span>
//                       {app.aiExplanation.shouldApply ? (
//                         <span
//                           style={{
//                             display: "inline-block",
//                             borderRadius: "20px",
//                             fontSize: "11px",
//                             padding: "2px 8px",
//                             color: "#16a34a",
//                             background: "#16a34a18",
//                             fontWeight: 700,
//                           }}>
//                           Apply ✓
//                         </span>
//                       ) : (
//                         <span
//                           style={{
//                             display: "inline-block",
//                             borderRadius: "20px",
//                             fontSize: "11px",
//                             padding: "2px 8px",
//                             color: "#d97706",
//                             background: "#d9770618",
//                             fontWeight: 700,
//                           }}>
//                           Tailor First
//                         </span>
//                       )}
//                     </div>

//                     {app.aiExplanation.quickWins && app.aiExplanation.quickWins.length > 0 && (
//                       <div style={{ marginTop: "8px" }}>
//                         <div
//                           style={{
//                             fontSize: "11px",
//                             textTransform: "uppercase",
//                             color: "#6b7280",
//                             fontWeight: 600,
//                             letterSpacing: "0.05em",
//                           }}>
//                           Quick wins:
//                         </div>
//                         <div style={{ marginTop: "4px" }}>
//                           {app.aiExplanation.quickWins.map((win, i) => (
//                             <div
//                               key={i}
//                               style={{
//                                 fontSize: "12.5px",
//                                 color: "var(--color-text-secondary)",
//                                 lineHeight: 1.7,
//                               }}>
//                               → {win}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {app.aiExplanation.missingSkillsContext && (
//                       <div
//                         style={{
//                           fontStyle: "italic",
//                           fontSize: "12px",
//                           color: "var(--color-text-tertiary)",
//                           marginTop: "6px",
//                         }}>
//                         {app.aiExplanation.missingSkillsContext}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Expandable AI Interview Prep Panel (inline below application card) */}
//               {prepCard === app._id && app.interviewPrep && app.interviewPrep.questions && app.interviewPrep.questions.length > 0 && (
//                 <div
//                   style={{
//                     background: "var(--color-background-primary)",
//                     border: "0.5px solid var(--color-border-info)",
//                     borderRadius: "var(--border-radius-lg)",
//                     padding: "1.25rem",
//                     marginTop: "-4px",
//                     marginBottom: "1rem",
//                   }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
//                     <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>
//                       🎯 Interview Prep <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 400, marginLeft: "4px" }}>· {app.companyName}</span>
//                     </div>
//                     <button
//                       onClick={() => setPrepCard(null)}
//                       style={{
//                         background: "transparent",
//                         border: "none",
//                         fontSize: "18px",
//                         cursor: "pointer",
//                         color: "var(--color-text-secondary)",
//                         padding: "0 4px",
//                         lineHeight: 1,
//                       }}>
//                       ×
//                     </button>
//                   </div>

//                   {app.interviewPrep.watchOutFor && (
//                     <div style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
//                       <div style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--color-text-tertiary)", fontWeight: 600, letterSpacing: "0.05em" }}>
//                         Watch out for:
//                       </div>
//                       <div style={{ fontStyle: "italic", fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
//                         "{app.interviewPrep.watchOutFor}"
//                       </div>
//                     </div>
//                   )}

//                   <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1rem" }}>
//                     {["All", "Technical", "Behavioural", "Culture Fit"].map((filter) => {
//                       const isActive = prepFilter === filter;
//                       return (
//                         <button
//                           key={filter}
//                           onClick={() => setPrepFilter(filter)}
//                           style={{
//                             fontSize: "12px",
//                             borderRadius: "20px",
//                             padding: "3px 12px",
//                             cursor: "pointer",
//                             transition: "all 0.2s ease",
//                             ...(isActive
//                               ? {
//                                   background: "var(--color-background-info)",
//                                   color: "var(--color-text-info)",
//                                   border: "none",
//                                   fontWeight: 600,
//                                 }
//                               : {
//                                   background: "transparent",
//                                   color: "var(--color-text-secondary)",
//                                   border: "0.5px solid var(--color-border-secondary)",
//                                 }),
//                           }}>
//                           {filter}
//                         </button>
//                       );
//                     })}
//                   </div>

//                   <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
//                     {app.interviewPrep.questions
//                       .filter((q) => prepFilter === "All" || q.type === prepFilter)
//                       .map((q, idx, arr) => {
//                         let badgeBg = "var(--color-background-info)";
//                         let badgeColor = "var(--color-text-info)";
//                         if (q.type === "Behavioural") {
//                           badgeBg = "#EEEDFE";
//                           badgeColor = "#534AB7";
//                         } else if (q.type === "Culture Fit") {
//                           badgeBg = "var(--color-background-success)";
//                           badgeColor = "var(--color-text-success)";
//                         }

//                         return (
//                           <div
//                             key={idx}
//                             style={{
//                               paddingBottom: idx < arr.length - 1 ? "1rem" : 0,
//                               borderBottom: idx < arr.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none",
//                             }}>
//                             <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", flexWrap: "wrap" }}>
//                               <span
//                                 style={{
//                                   fontSize: "10px",
//                                   fontWeight: 700,
//                                   textTransform: "uppercase",
//                                   background: badgeBg,
//                                   color: badgeColor,
//                                   padding: "2px 8px",
//                                   borderRadius: "12px",
//                                   marginTop: "2px",
//                                 }}>
//                                 {q.type}
//                               </span>
//                               <div style={{ flex: 1, fontSize: "13px", color: "var(--color-text-primary)", fontWeight: 500 }}>
//                                 {q.question}
//                               </div>
//                             </div>
//                             {q.hint && (
//                               <div style={{ fontSize: "12.5px", color: "var(--color-text-secondary)", marginTop: "4px", paddingLeft: "8px" }}>
//                                 → {q.hint}
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })}
//                   </div>

//                   {app.interviewPrep.tipsForThisRole && app.interviewPrep.tipsForThisRole.length > 0 && (
//                     <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: "0.75rem", marginTop: "1rem" }}>
//                       <div style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--color-text-tertiary)", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "6px" }}>
//                         Tips for this role:
//                       </div>
//                       <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
//                         {app.interviewPrep.tipsForThisRole.map((tip, i) => (
//                           <div key={i} style={{ fontSize: "12.5px", color: "var(--color-text-secondary)" }}>
//                             • {tip}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </Fragment>
//           ))}
//         </div>
//       )}
//       </div>
//     </DashboardLayout>
//   );
// }
