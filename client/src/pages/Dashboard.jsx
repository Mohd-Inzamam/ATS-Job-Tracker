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
        />
        <MetricCard
          title="Applications"
          value={metrics ? metrics.applicationCount : "—"}
        />
        <MetricCard
          title="Avg ATS Score"
          value={
            metrics && metrics.avgScore !== null ? `${metrics.avgScore}%` : "—"
          }
        />
      </div>
    </DashboardLayout>
  );
}
