import DashboardLayout from "../layout/DashboardLayout";
import PipelineStatus from "../components/PipelineStatus";

export default function Applications() {
  // temporary mock data (until backend hook)
  const pipelineData = {
    saved: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  };

  const totalApplications = Object.values(pipelineData).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <DashboardLayout>
      <h2 style={{ marginBottom: "1.5rem" }}>Applications</h2>

      <PipelineStatus data={pipelineData} />

      {totalApplications === 0 && (
        <div className="card center" style={{ marginTop: "2rem" }}>
          <p>You haven’t added any job applications yet.</p>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            Start tracking applications to understand your job search progress.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
