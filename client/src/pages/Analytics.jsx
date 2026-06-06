import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import {
  getOverview,
  getTrends,
  getSuccessRate,
} from "../services/analyticsService";

const STATUS_COLORS = {
  Saved: "#6b7280",
  Applied: "#3b82f6",
  Interview: "#f59e0b",
  Offer: "#22c55e",
  Rejected: "#ef4444",
};

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [successRate, setSuccessRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, tr, sr] = await Promise.all([
          getOverview(),
          getTrends(),
          getSuccessRate(),
        ]);
        setOverview(ov);
        setTrends(tr.trends || []);
        setSuccessRate(sr);
      } catch (err) {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <DashboardLayout>
        <p>Loading analytics...</p>
      </DashboardLayout>
    );
  if (error)
    return (
      <DashboardLayout>
        <div className="error-banner">{error}</div>
      </DashboardLayout>
    );

  const hasNoData = overview?.totalApplications === 0;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Insights from your job search activity</p>
      </div>

      {hasNoData ? (
        <div className="card center" style={{ marginTop: "2rem" }}>
          <p>No data yet. Start adding applications to see insights.</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="metrics-grid">
            <div className="metric-card card">
              <p className="metric-label">Total Applications</p>
              <p className="metric-value">{overview.totalApplications}</p>
            </div>

            <div className="metric-card card">
              <p className="metric-label">Interview Rate</p>
              <p className="metric-value">
                {overview.interviewConversionRate}%
              </p>
            </div>

            <div className="metric-card card">
              <p className="metric-label">Offer Rate</p>
              <p className="metric-value">{overview.offerConversionRate}%</p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="card" style={{ marginTop: "1.5rem" }}>
            <h3>Application Status Breakdown</h3>
            <div className="status-breakdown">
              {Object.entries(overview.statusBreakdown).map(
                ([status, count]) => (
                  <div key={status} className="status-row">
                    <span
                      className="status-dot"
                      style={{
                        backgroundColor: STATUS_COLORS[status],
                      }}
                    />
                    <span className="status-name">{status}</span>
                    <div className="status-bar-track">
                      <div
                        className="status-bar-fill"
                        style={{
                          width: `${
                            overview.totalApplications > 0
                              ? (count / overview.totalApplications) * 100
                              : 0
                          }%`,
                          backgroundColor: STATUS_COLORS[status],
                        }}
                      />
                    </div>
                    <span className="status-count">{count}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Weekly Trends */}
          {trends.length > 0 && (
            <div className="card" style={{ marginTop: "1.5rem" }}>
              <h3>Applications Over Time</h3>
              <div className="trends-list">
                {trends.map((t) => (
                  <div key={t.week} className="trend-row">
                    <span className="trend-week">{t.week}</span>
                    <div className="trend-bar-track">
                      <div
                        className="trend-bar-fill"
                        style={{
                          width: `${Math.min(t.count * 10, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="trend-count">
                      {t.count} app{t.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Rate by Role */}
          {successRate?.byRole?.length > 0 && (
            <div className="card" style={{ marginTop: "1.5rem" }}>
              <h3>Performance by Role</h3>
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Applied</th>
                    <th>Interviews</th>
                    <th>Offers</th>
                    <th>Interview Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {successRate.byRole.map((row) => (
                    <tr key={row.role}>
                      <td>{row.role}</td>
                      <td>{row.total}</td>
                      <td>{row.interviews}</td>
                      <td>{row.offers}</td>
                      <td>{row.interviewRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Success Rate by Company */}
          {successRate?.byCompany?.length > 0 && (
            <div className="card" style={{ marginTop: "1.5rem" }}>
              <h3>Performance by Company</h3>
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Applied</th>
                    <th>Interviews</th>
                    <th>Offers</th>
                    <th>Interview Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {successRate.byCompany.map((row) => (
                    <tr key={row.company}>
                      <td>{row.company}</td>
                      <td>{row.total}</td>
                      <td>{row.interviews}</td>
                      <td>{row.offers}</td>
                      <td>{row.interviewRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
