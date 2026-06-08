import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getOverview } from "../services/analyticsService";
import { getResumes } from "../services/resumeService";
import { getApplications } from "../services/applicationService";
import { getDashboardInsight } from "../services/aiService";
import CoachMark from "../components/CoachMark";

const STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

const STATUS_COLORS = {
  Saved: "var(--color-text-secondary)",
  Applied: "var(--color-text-info)",
  Interview: "var(--color-text-warning)",
  Offer: "var(--color-text-success)",
  Rejected: "var(--color-text-danger)",
};

const STATUS_DOT_COLORS = {
  Saved: "#94a3b8",
  Applied: "#0284c7",
  Interview: "#d97706",
  Offer: "#16a34a",
  Rejected: "#dc2626",
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

function daysSince(dateStr) {
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return null;
  const d = daysSince(dateStr);
  if (d === 0) return "Today";
  if (d === 1) return "1 day ago";
  return `${d} days ago`;
}

function getTopResume(resumes) {
  if (!resumes?.length) return null;
  return resumes.reduce((best, r) =>
    (r.atsScore ?? 0) > (best.atsScore ?? 0) ? r : best,
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
      } else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span className="stat-number">{display}</span>;
}

/** Build a flat activity feed from resumes + applications */
function buildActivityFeed(applications, resumes) {
  const items = [];

  (applications || []).forEach((app) => {
    items.push({
      id: app._id + "_created",
      date: app.createdAt,
      dot: STATUS_DOT_COLORS.Applied,
      text: `Applied to ${app.jobTitle} at ${app.companyName}`,
    });
    if (app.status !== "Applied" && app.status !== "Saved") {
      items.push({
        id: app._id + "_status",
        date: app.updatedAt,
        dot: STATUS_DOT_COLORS[app.status] || "#94a3b8",
        text: `${app.companyName} → ${app.status}`,
      });
    }
  });

  (resumes || []).forEach((r) => {
    items.push({
      id: r._id + "_resume",
      date: r.createdAt,
      dot: "#8b5cf6",
      text: `Uploaded resume: ${r.label || "Untitled"}${r.atsScore ? ` (ATS: ${r.atsScore})` : ""}`,
    });
  });

  return items
    .filter((i) => i.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
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

  // Coach mark refs
  const applicationsLinkRef = useRef(null);

  const dataReady =
    overview !== null && resumes !== null && applications !== null;

  useEffect(() => {
    Promise.all([getOverview(), getResumes(), getApplications()])
      .then(([ov, res, apps]) => {
        setOverview(ov);
        setResumes(res);
        setApplications(apps);
      })
      .catch(() => {
        setOverview({
          totalApplications: 0,
          statusBreakdown: {},
          interviewConversionRate: 0,
        });
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
        "Keep going — consistent applications compound over time. Focus on tailoring your resume for each role you apply to.",
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
  const activityFeed = buildActivityFeed(applications, resumes);

  const staleNudges = (applications ?? [])
    .filter(
      (app) =>
        app.status === "Applied" &&
        daysSince(app.updatedAt) > 5 &&
        !dismissedNudges.has(app._id),
    )
    .sort((a, b) => daysSince(b.updatedAt) - daysSince(a.updatedAt))
    .slice(0, 3);

  // Coach mark conditions
  const hasResumes = (resumes?.length ?? 0) > 0;
  const hasNoApps = (applications?.length ?? 0) === 0;
  const showResumeUploadedCoach = hasResumes && hasNoApps;
  const showAnalyticsCoach = (applications?.length ?? 0) >= 3;
  const showUpgradeCoach =
    user?.plan === "free" && (applications?.length ?? 0) >= 3;

  return (
    <DashboardLayout>
      <div className="page-enter">
        {/* Section A — Greeting */}
        <div className="dash-greeting">
          <h1>
            {getTimeGreeting()}, {user?.name || "there"}
          </h1>
          <p>
            {dataReady ? getSubtitle(totalApps) : "Loading your dashboard..."}
          </p>
        </div>

        {/* Section B — Pipeline strip */}
        <div className="pipeline-strip">
          {STATUSES.map((status) =>
            overview === null ? (
              <div
                key={status}
                className="pipeline-pill skeleton"
                style={{ height: 72 }}
              />
            ) : (
              <button
                key={status}
                type="button"
                className="pipeline-pill"
                style={{ color: STATUS_COLORS[status] }}
                onClick={() => navigate("/applications")}>
                <span className="pipeline-label">{status}</span>
                <span className="pipeline-count">{breakdown[status]}</span>
              </button>
            ),
          )}
        </div>

        {/* Section C — Metric cards row */}
        <div className="dash-metrics-row">
          {/* Card 1 — Total applications */}
          {overview === null ? (
            <div
              className="dash-metric-card skeleton"
              style={{ height: 100 }}
            />
          ) : (
            <div className="dash-metric-card">
              <p className="dash-metric-label">Total Applications</p>
              <p className="dash-metric-value">
                <AnimatedNumber value={totalApps} />
              </p>
              <p className="dash-metric-sub">
                interview rate:{" "}
                <AnimatedNumber value={overview.interviewConversionRate ?? 0} />
                %
              </p>
            </div>
          )}

          {/* Card 2 — Best resume */}
          {resumes === null ? (
            <div
              className="dash-metric-card skeleton"
              style={{ height: 100 }}
            />
          ) : topResume ? (
            <div className="dash-metric-card">
              <p className="dash-metric-label">Best Resume</p>
              <p className="dash-metric-value dash-metric-value-sm">
                {topResume.label}
              </p>
              <p className="dash-metric-sub">
                ATS score: {topResume.atsScore ?? 0}/100
              </p>
            </div>
          ) : (
            <div className="dash-metric-card">
              <p className="dash-metric-label">Best Resume</p>
              <p className="dash-metric-value dash-metric-value-sm muted">
                Upload a resume to see your best performer
              </p>
            </div>
          )}

          {/* Card 3 — Activity feed */}
          {applications === null ? (
            <div
              className="dash-metric-card skeleton"
              style={{ height: 100 }}
            />
          ) : activityFeed.length > 0 ? (
            <div className="dash-metric-card" style={{ gridColumn: "span 1" }}>
              <p className="dash-metric-label">Recent Activity</p>
              <div className="activity-feed">
                {activityFeed.map((item) => (
                  <div key={item.id} className="activity-item">
                    <span
                      className="activity-dot"
                      style={{ background: item.dot }}
                    />
                    <div className="activity-body">
                      <span className="activity-text">{item.text}</span>
                      <span className="activity-time">
                        {formatRelativeTime(item.date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="dash-metric-card">
              <p className="dash-metric-label">Recent Activity</p>
              <p className="dash-metric-value dash-metric-value-sm muted">
                No activity yet
              </p>
            </div>
          )}
        </div>

        {/* Section D — AI Insight */}
        <div className="insight-card">
          <div className="insight-header">
            <span className="insight-title">✦ Your Job Search Insight</span>
            <button
              type="button"
              className="insight-refresh"
              onClick={fetchInsight}
              disabled={insightLoading || !dataReady}>
              Refresh
            </button>
          </div>
          {insightLoading ? (
            <div className="insight-shimmer">
              <div className="insight-shimmer-line" />
              <div className="insight-shimmer-line short" />
            </div>
          ) : (
            <p className={`insight-text ${insightVisible ? "visible" : ""}`}>
              {insight}
            </p>
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
              onClick={() =>
                setDismissedNudges((p) => new Set([...p, app._id]))
              }
              aria-label="Dismiss">
              ×
            </button>
          </div>
        ))}

        {/* Section F — Quick actions */}
        <div className="dash-quick-actions">
          {/* Coach mark: after first resume upload, nudge toward Applications */}
          <div
            style={{ position: "relative", display: "inline-block" }}
            ref={applicationsLinkRef}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate("/resumes")}>
              <span className="material-symbols-outlined">upload_file</span>
              Upload Resume
            </button>
          </div>

          <div style={{ position: "relative", display: "inline-block" }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate("/applications")}>
              <span className="material-symbols-outlined">add_circle</span>
              Add Application
            </button>
            <CoachMark
              id="first_resume_uploaded"
              title="Add your first application"
              body="Paste a job description and AI will auto-fill the details — company, role, and skills."
              show={showResumeUploadedCoach}
              position="top"
              delay={1200}
            />
          </div>

          <div style={{ position: "relative", display: "inline-block" }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate("/ats")}>
              <span className="material-symbols-outlined">fact_check</span>
              Check ATS
            </button>
          </div>
        </div>

        {/* Coach mark: after 3 apps, nudge toward Analytics */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            marginTop: 8,
          }}>
          <CoachMark
            id="visit_analytics"
            title="Check your Analytics"
            body="You have enough data — see which resumes perform best and your interview conversion rate."
            show={showAnalyticsCoach}
            position="bottom"
            delay={2000}
          />
        </div>

        {/* Coach mark: free user on 3rd app → upgrade nudge */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <CoachMark
            id="upgrade_nudge_3apps"
            title="Running low on free slots"
            body="You're 60% through your free limit. Pro unlocks unlimited tracking + all AI features."
            show={showUpgradeCoach}
            position="bottom"
            delay={3000}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
