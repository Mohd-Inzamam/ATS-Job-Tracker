export default function FeedbackCard({ title, text, passed }) {
  return (
    <div className="card">
      <h4 className="feedback-card-title">
        <span
          className="feedback-status-dot"
          style={{
            background: passed
              ? "var(--color-text-success)"
              : "var(--color-text-danger)",
          }}
        />
        {title}
      </h4>
      <p>{text}</p>
    </div>
  );
}
