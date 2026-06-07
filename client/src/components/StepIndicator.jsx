// Legacy StepIndicator preserved for backward compat
// New onboarding uses inline step UI — this component is kept if used elsewhere
export default function StepIndicator({ step, total }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        marginBottom: "24px",
        justifyContent: "center",
      }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i + 1 === step ? "24px" : "8px",
            height: "8px",
            borderRadius: "4px",
            background:
              i + 1 <= step
                ? "var(--primary)"
                : "var(--color-border-secondary)",
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}
