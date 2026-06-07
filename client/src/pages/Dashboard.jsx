import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getOverview } from "../services/analyticsService";
import { getResumes } from "../services/resumeService";
import { getApplications } from "../services/applicationService";
import { getDashboardInsight } from "../services/aiService";

const STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

const STATUS_COLORS = {
  Saved: "var(--color-text-secondary)",
  Applied: "var(--color-text-info)",
  Interview: "var(--color-text-warning)",
  Offer: "var(--color-text-success)",
  Rejected: "var(--color-text-danger)",
};

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getSubtitle(count) {
  if (count === 0)
    return "Let's start your job search. Add your first application below.";
  if (count <= 4)
    return "You're building momentum. Keep tracking your applications.";
  return "Active job search in progress. Here's your pipeline.";
}

function normalizeBreakdown(breakdown) {
  return STATUSES.reduce((acc, status) => {
    acc[status] = breakdown?.[status] ?? 0;
    return acc;
  }, {});
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

function daysSince(dateStr) {
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}

function getTopResume(resumes) {
  if (!resumes?.length) return null;
  return resumes.reduce((best, r) =>
    (r.atsScore ?? 0) > (best.atsScore ?? 0) ? r : best
  );
}

function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === null || value === undefined) return;
    let start = 0;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span className="stat-number">{display}</span>;
}

function getLastApplication(applications) {
  if (!applications?.length) return null;
  return [...applications].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  )[0];
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [resumes, setResumes] = useState(null);
  const [applications, setApplications] = useState(null);
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightVisible, setInsightVisible] = useState(false);
  const [dismissedNudges, setDismissedNudges] = useState(new Set());

  const dataReady = overview !== null && resumes !== null && applications !== null;

  useEffect(() => {
    Promise.all([getOverview(), getResumes(), getApplications()])
      .then(([ov, res, apps]) => {
        setOverview(ov);
        setResumes(res);
        setApplications(apps);
      })
      .catch(() => {
        setOverview({ totalApplications: 0, statusBreakdown: {}, interviewConversionRate: 0 });
        setResumes([]);
        setApplications([]);
      });
  }, []);

  const fetchInsight = useCallback(async () => {
    if (!dataReady) return;

    setInsightLoading(true);
    setInsightVisible(false);

    const topResume = getTopResume(resumes);
    const breakdown = normalizeBreakdown(overview.statusBreakdown);

    try {
      const result = await getDashboardInsight({
        totalApplications: overview.totalApplications ?? 0,
        interviewRate: overview.interviewConversionRate ?? 0,
        statusBreakdown: breakdown,
        resumeCount: resumes.length,
        topResumeLabel: topResume?.label ?? "",
      });
      setInsight(result.insight);
    } catch {
      setInsight(
        "Keep going — consistent applications compound over time. Focus on tailoring your resume for each role you apply to."
      );
    } finally {
      setInsightLoading(false);
      setTimeout(() => setInsightVisible(true), 50);
    }
  }, [dataReady, overview, resumes]);

  useEffect(() => {
    if (dataReady) fetchInsight();
  }, [dataReady, fetchInsight]);

  const breakdown = normalizeBreakdown(overview?.statusBreakdown);
  const totalApps = overview?.totalApplications ?? 0;
  const topResume = getTopResume(resumes);
  const lastApp = getLastApplication(applications);

  const staleNudges = (applications ?? [])
    .filter(
      (app) =>
        app.status === "Applied" &&
        daysSince(app.updatedAt) > 5 &&
        !dismissedNudges.has(app._id)
    )
    .sort((a, b) => daysSince(b.updatedAt) - daysSince(a.updatedAt))
    .slice(0, 3);

  const dismissNudge = (id) => {
    setDismissedNudges((prev) => new Set([...prev, id]));
  };

  return (
    <DashboardLayout>
      <div className="page-enter">
      {/* Section A — Greeting */}
      <div className="dash-greeting">
        <h1>
          {getTimeGreeting()}, {user?.name || "there"}
        </h1>
        <p>{dataReady ? getSubtitle(totalApps) : "Loading your dashboard..."}</p>
      </div>

      {/* Section B — Pipeline strip */}
      <div className="pipeline-strip">
        {STATUSES.map((status) =>
          overview === null ? (
            <div key={status} className="pipeline-pill skeleton" style={{ height: 72 }} />
          ) : (
            <button
              key={status}
              type="button"
              className="pipeline-pill"
              style={{ color: STATUS_COLORS[status] }}
              onClick={() => navigate("/applications")}
            >
              <span className="pipeline-label">{status}</span>
              <span className="pipeline-count">{breakdown[status]}</span>
            </button>
          )
        )}
      </div>

      {/* Section C — Metric cards */}
      <div className="dash-metrics-row">
        {overview === null ? (
          <div className="dash-metric-card skeleton" style={{ height: 100 }} />
        ) : (
          <div className="dash-metric-card">
            <p className="dash-metric-label">Total Applications</p>
            <p className="dash-metric-value">
              <AnimatedNumber value={totalApps} />
            </p>
            <p className="dash-metric-sub">
              interview rate: <AnimatedNumber value={overview.interviewConversionRate ?? 0} />%
            </p>
          </div>
        )}

        {resumes === null ? (
          <div className="dash-metric-card skeleton" style={{ height: 100 }} />
        ) : topResume ? (
          <div className="dash-metric-card">
            <p className="dash-metric-label">Best Resume</p>
            <p className="dash-metric-value dash-metric-value-sm">{topResume.label}</p>
            <p className="dash-metric-sub">ATS score: {topResume.atsScore ?? 0}/100</p>
          </div>
        ) : (
          <div className="dash-metric-card">
            <p className="dash-metric-label">Best Resume</p>
            <p className="dash-metric-value dash-metric-value-sm muted">
              Upload a resume to see your best performer
            </p>
          </div>
        )}

        {applications === null ? (
          <div className="dash-metric-card skeleton" style={{ height: 100 }} />
        ) : lastApp ? (
          <div className="dash-metric-card">
            <p className="dash-metric-label">Last Activity</p>
            <p className="dash-metric-value dash-metric-value-sm">
              {formatRelativeTime(lastApp.updatedAt)}
            </p>
            <p className="dash-metric-sub">
              {lastApp.companyName} — {lastApp.jobTitle}
            </p>
          </div>
        ) : (
          <div className="dash-metric-card">
            <p className="dash-metric-label">Last Activity</p>
            <p className="dash-metric-value dash-metric-value-sm muted">No activity yet</p>
          </div>
        )}
      </div>

      {/* Section D — AI Weekly Insight */}
      <div className="insight-card">
        <div className="insight-header">
          <span className="insight-title">✦ Your Job Search Insight</span>
          <button
            type="button"
            className="insight-refresh"
            onClick={fetchInsight}
            disabled={insightLoading || !dataReady}
          >
            Refresh
          </button>
        </div>
        {insightLoading ? (
          <div className="insight-shimmer">
            <div className="insight-shimmer-line" />
            <div className="insight-shimmer-line short" />
          </div>
        ) : (
          <p className={`insight-text ${insightVisible ? "visible" : ""}`}>{insight}</p>
        )}
      </div>

      {/* Section E — Stale nudges */}
      {staleNudges.map((app) => (
        <div key={app._id} className="stale-nudge">
          <span>
            ⏰ {app.companyName} — {app.jobTitle} — Applied{" "}
            {daysSince(app.updatedAt)} days ago. Time to follow up?
          </span>
          <button
            type="button"
            className="nudge-dismiss"
            onClick={() => dismissNudge(app._id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}

      {/* Section F — Quick actions */}
      <div className="dash-quick-actions">
        <button type="button" className="btn-ghost" onClick={() => navigate("/resumes")}>
          <span className="material-symbols-outlined">upload_file</span>
          Upload Resume
        </button>
        <button type="button" className="btn-ghost" onClick={() => navigate("/applications")}>
          <span className="material-symbols-outlined">add_circle</span>
          Add Application
        </button>
        <button type="button" className="btn-ghost" onClick={() => navigate("/ats")}>
          <span className="material-symbols-outlined">fact_check</span>
          Check ATS
        </button>
      </div>
      </div>
    </DashboardLayout>
  );
}
