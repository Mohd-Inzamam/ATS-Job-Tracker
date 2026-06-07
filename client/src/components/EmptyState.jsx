export default function EmptyState({
  icon,
  title,
  body,
  ctaLabel,
  onCta,
  secondaryLabel,
  onSecondary,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-body">{body}</p>
      <div className="empty-actions">
        {ctaLabel && (
          <button type="button" className="btn-primary" onClick={onCta}>
            {ctaLabel}
          </button>
        )}
        {secondaryLabel && (
          <button type="button" className="secondary-btn" onClick={onSecondary}>
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
