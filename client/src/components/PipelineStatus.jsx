export default function PipelineStatus({ data }) {
  const stages = [
    { key: "saved", label: "Saved" },
    { key: "applied", label: "Applied" },
    { key: "interview", label: "Interview" },
    { key: "offer", label: "Offer" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="pipeline">
      {stages.map((stage) => (
        <div key={stage.key} className="pipeline-step">
          <p className="pipeline-label">{stage.label}</p>
          <h3 className="pipeline-count">{data[stage.key]}</h3>
        </div>
      ))}
    </div>
  );
}
