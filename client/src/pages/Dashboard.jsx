import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import MetricCard from "../components/MetricCard";
import ActionCard from "../components/ActionCard";
import { getDashboardMetrics } from "../services/dashboardService";

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getDashboardMetrics().then(setMetrics);
  }, []);

  const showUploadResume = metrics && metrics.resumeCount === 0;

  const showAddApplication =
    metrics && metrics.resumeCount > 0 && metrics.applicationCount === 0;

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Track your resume performance and applications</p>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="Resumes"
          value={metrics ? metrics.resumeCount : "—"}
          description={
            metrics && metrics.resumeCount > 0
              ? "Total resume versions uploaded"
              : "Upload your first resume to get started"
          }
          loading={!metrics}
        />

        <MetricCard
          title="Applications"
          value={metrics ? metrics.applicationCount : "—"}
          description={
            metrics && metrics.applicationCount > 0
              ? "Jobs you've tracked so far"
              : "Start tracking your job applications"
          }
          loading={!metrics}
        />

        <MetricCard
          title="Avg ATS Score"
          value={
            metrics && metrics.avgScore !== null ? `${metrics.avgScore}%` : "—"
          }
          description={
            metrics && metrics.avgScore !== null
              ? "Average ATS score across resumes"
              : "Analyze resumes to see your score"
          }
          loading={!metrics}
        />
      </div>

      {/* Suggested Action */}
      {(showUploadResume || showAddApplication) && (
        <div className="action-section">
          {showUploadResume && (
            <ActionCard
              title="Upload your first resume"
              description="Add a resume to unlock ATS analysis and job tracking."
              actionLabel="Upload Resume"
              to="/resumes"
            />
          )}

          {showAddApplication && (
            <ActionCard
              title="Start tracking applications"
              description="Track jobs you've applied to and monitor progress."
              actionLabel="Add Application"
              to="/applications"
            />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
