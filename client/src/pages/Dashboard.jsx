import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import MetricCard from "../components/MetricCard";
import { getDashboardMetrics } from "../services/dashboardService";

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getDashboardMetrics().then(setMetrics);
  }, []);

  return (
    <DashboardLayout>
      <div className="grid">
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
    </DashboardLayout>
  );
}
