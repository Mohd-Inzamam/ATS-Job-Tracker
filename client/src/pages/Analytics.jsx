import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import {
  getOverview,
  getTrends,
  getSuccessRate,
} from "../services/analyticsService";

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
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [successRate, setSuccessRate] = useState(null);
  const [activeTab, setActiveTab] = useState("role");

  useEffect(() => {
    Promise.all([getOverview(), getTrends(), getSuccessRate()])
      .then(([ov, tr, sr]) => {
        setOverview(ov);
        setTrends(tr.trends || []);
        setSuccessRate(sr);
      })
      .catch(() => {
        setOverview({ totalApplications: 0, statusBreakdown: {}, interviewConversionRate: 0, offerConversionRate: 0 });
        setTrends([]);
        setSuccessRate({ byRole: [], byCompany: [] });
      });
  }, []);

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

  return (
    <DashboardLayout>
      <div className="analytics-page">
        <div className="analytics-header">
          <h2>Analytics</h2>
          <p>Your job search story, told in data</p>
        </div>

        {/* Act 1 — Your Search in Numbers */}
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

        {/* Act 2 — Status breakdown */}
        <section className="analytics-section">
          <h3 className="analytics-act-title">Where Are Your Applications?</h3>
          {overview === null ? (
            <div className="skeleton" style={{ height: 24, borderRadius: 8 }} />
          ) : total === 0 ? (
            <p className="analytics-empty">
              No applications yet. Start tracking your job search.
            </p>
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

        {/* Act 3 — Weekly trends */}
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

        {/* Act 4 — Success rate table */}
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
      </div>
    </DashboardLayout>
  );
}
