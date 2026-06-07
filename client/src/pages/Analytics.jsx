import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layout/DashboardLayout";
import EmptyState from "../components/EmptyState";
import {
  getOverview,
  getTrends,
  getSuccessRate,
} from "../services/analyticsService";
import { getResumes } from "../services/resumeService";

const STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

const STATUS_COLORS = {
  Saved: "var(--color-text-secondary)",
  Applied: "var(--color-text-info)",
  Interview: "var(--color-text-warning)",
  Offer: "var(--color-text-success)",
  Rejected: "var(--color-text-danger)",
};

function normalizeBreakdown(breakdown) {
  return STATUSES.reduce((acc, status) => {
    acc[status] = breakdown?.[status] ?? 0;
    return acc;
  }, {});
}

function formatWeekLabel(weekKey) {
  const match = weekKey?.match(/W(\d+)/);
  return match ? `W${match[1]}` : weekKey;
}

function getRatePillClass(rate) {
  if (rate >= 50) return "rate-pill rate-pill-green";
  if (rate >= 20) return "rate-pill rate-pill-amber";
  return "rate-pill rate-pill-red";
}

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [successRate, setSuccessRate] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [activeTab, setActiveTab] = useState("role");

  const isFree = user?.plan !== "pro";

  useEffect(() => {
    if (isFree) return;

    Promise.all([getOverview(), getTrends(), getSuccessRate(), getResumes()])
      .then(([ov, tr, sr, res]) => {
        setOverview(ov);
        setTrends(tr.trends || []);
        setSuccessRate(sr);
        setResumes(res);
      })
      .catch(() => {
        setOverview({ totalApplications: 0, statusBreakdown: {}, interviewConversionRate: 0, offerConversionRate: 0 });
        setTrends([]);
        setSuccessRate({ byRole: [], byCompany: [] });
        setResumes([]);
      });
  }, [isFree]);

  if (isFree) {
    return (
      <DashboardLayout>
        <div className="page-enter analytics-page">
          <div className="usage-banner usage-banner-info" style={{ marginBottom: "1.5rem" }}>
            Analytics is a Pro feature.
          </div>
          <div className="pro-empty-state">
            <span className="pro-empty-icon">📊</span>
            <h2>Analytics is a Pro feature</h2>
            <p>
              Upgrade to see your application trends, interview rates, and resume
              performance.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("/pricing")}
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const breakdown = normalizeBreakdown(overview?.statusBreakdown);
  const total = overview?.totalApplications ?? 0;
  const activePipeline = (breakdown.Saved ?? 0) + (breakdown.Applied ?? 0);
  const maxTrendCount = trends?.length
    ? Math.max(...trends.map((t) => t.count), 1)
    : 1;

  const tableData =
    activeTab === "role"
      ? (successRate?.byRole ?? []).map((r) => ({
          key: r.role,
          name: r.role,
          total: r.total,
          interviews: r.interviews,
          offers: r.offers,
          rate: r.interviewRate,
        }))
      : (successRate?.byCompany ?? []).map((c) => ({
          key: c.company,
          name: c.company,
          total: c.total,
          interviews: c.interviews,
          offers: c.offers,
          rate: c.interviewRate,
        }));

  if (overview !== null && total === 0) {
    return (
      <DashboardLayout>
        <div className="page-enter analytics-page">
          <div className="analytics-header">
            <h2>Analytics</h2>
            <p>Your job search story, told in data</p>
          </div>
          <EmptyState
            icon="📊"
            title="Not enough data yet"
            body="Add more applications to start seeing trends, interview rates, and resume performance."
            ctaLabel="Add Application"
            onCta={() => navigate("/applications")}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-enter analytics-page">
        <div className="analytics-header">
          <h2>Analytics</h2>
          <p>Your job search story, told in data</p>
        </div>

        <section className="analytics-section">
          <h3 className="analytics-act-title">Your Search in Numbers</h3>
          <div className="analytics-stat-row">
            {overview === null ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="analytics-stat-box skeleton" style={{ height: 80 }} />
                ))}
              </>
            ) : (
              <>
                <div className="analytics-stat-box">
                  <p className="analytics-stat-value">{total}</p>
                  <p className="analytics-stat-label">Total Applications</p>
                </div>
                <div className="analytics-stat-box">
                  <p className="analytics-stat-value">
                    {overview.interviewConversionRate}%
                  </p>
                  <p className="analytics-stat-label">Interview Rate</p>
                </div>
                <div className="analytics-stat-box">
                  <p className="analytics-stat-value">
                    {overview.offerConversionRate}%
                  </p>
                  <p className="analytics-stat-label">Offer Rate</p>
                </div>
                <div className="analytics-stat-box">
                  <p className="analytics-stat-value">{activePipeline}</p>
                  <p className="analytics-stat-label">Active Pipeline</p>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="analytics-section">
          <h3 className="analytics-act-title">Where Are Your Applications?</h3>
          {overview === null ? (
            <div className="skeleton" style={{ height: 24, borderRadius: 8 }} />
          ) : (
            <>
              <div className="stacked-bar">
                {STATUSES.map((status) => {
                  const count = breakdown[status];
                  if (count === 0) return null;
                  const pct = (count / total) * 100;
                  return (
                    <div
                      key={status}
                      className="stacked-segment"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: STATUS_COLORS[status],
                        minWidth: count > 0 ? "20px" : 0,
                      }}
                      title={`${status}: ${count} applications`}
                    />
                  );
                })}
              </div>
              <div className="stacked-legend">
                {STATUSES.map((status) => (
                  <span key={status} className="legend-item">
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: STATUS_COLORS[status] }}
                    />
                    {status} ({breakdown[status]})
                  </span>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="analytics-section">
          <h3 className="analytics-act-title">Application Trends</h3>
          {trends === null ? (
            <div className="skeleton" style={{ height: 140, borderRadius: 8 }} />
          ) : trends.length === 0 ? (
            <p className="analytics-empty">
              No trend data yet. Add applications to see your activity over time.
            </p>
          ) : (
            <div className="bar-chart-scroll">
              <div className="bar-chart">
                {trends.map((t) => (
                  <div key={t.week} className="bar-chart-col" title={`Week ${formatWeekLabel(t.week)}: ${t.count} applications`}>
                    <span className="bar-chart-count">{t.count}</span>
                    <div
                      className="bar-chart-bar"
                      style={{ height: `${(t.count / maxTrendCount) * 120}px` }}
                    />
                    <span className="bar-chart-label">{formatWeekLabel(t.week)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="analytics-section">
          <h3 className="analytics-act-title">Success Rate by Role</h3>
          <div className="analytics-tabs">
            <button
              type="button"
              className={`analytics-tab ${activeTab === "role" ? "active" : ""}`}
              onClick={() => setActiveTab("role")}
            >
              By Role
            </button>
            <button
              type="button"
              className={`analytics-tab ${activeTab === "company" ? "active" : ""}`}
              onClick={() => setActiveTab("company")}
            >
              By Company
            </button>
          </div>
          {successRate === null ? (
            <div className="skeleton" style={{ height: 120, borderRadius: 8 }} />
          ) : tableData.length === 0 ? (
            <p className="analytics-empty">
              Not enough data yet. Track more applications to see patterns.
            </p>
          ) : (
            <table className="success-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Applied</th>
                  <th>Interviews</th>
                  <th>Offers</th>
                  <th>Interview Rate</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.key}>
                    <td>{row.name}</td>
                    <td>{row.total}</td>
                    <td>{row.interviews}</td>
                    <td>{row.offers}</td>
                    <td>
                      <span className={getRatePillClass(row.rate)}>{row.rate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {resumes?.length > 0 && (
          <section className="analytics-section">
            <h3 className="section-heading">ATS Score History</h3>
            <div className="score-history">
              {[...resumes]
                .sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0))
                .map((r) => (
                  <div key={r._id} className="score-history-row stagger-item">
                    <span className="score-history-label">{r.label || "Resume"}</span>
                    <div className="score-history-bar-wrap">
                      <div
                        className="score-history-bar"
                        style={{
                          width: `${r.atsScore || 0}%`,
                          background:
                            (r.atsScore || 0) >= 70
                              ? "var(--color-text-success)"
                              : (r.atsScore || 0) >= 40
                              ? "var(--color-text-warning)"
                              : "var(--color-text-danger)",
                        }}
                      />
                    </div>
                    <span
                      className="score-history-num"
                      style={{
                        color:
                          (r.atsScore || 0) >= 70
                            ? "var(--color-text-success)"
                            : (r.atsScore || 0) >= 40
                            ? "var(--color-text-warning)"
                            : "var(--color-text-danger)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {r.atsScore || 0}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
