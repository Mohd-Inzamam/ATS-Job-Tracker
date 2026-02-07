export default function MetricCard({
  title,
  value,
  description,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="card metric-card">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-value"></div>
        <div className="skeleton skeleton-desc"></div>
      </div>
    );
  }

  const isEmpty = value === "—" || value === 0 || value === null;

  return (
    <div className="card metric-card">
      <p className="metric-title">{title}</p>

      <h2 className={`metric-value ${isEmpty ? "muted" : ""}`}>{value}</h2>

      <p className={`metric-desc ${isEmpty ? "hint" : ""}`}>{description}</p>
    </div>
  );
}
