const PRO_FEATURES = [
  "Unlimited resumes",
  "Unlimited applications",
  "AI match explainer",
  "Interview prep",
  "Analytics dashboard",
  "Resume–JD matching",
];

export default function UpgradeModal({ isOpen, onClose, message }) {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    window.location.href = "/checkout";
  };

  return (
    <div className="upgrade-modal-overlay" onClick={onClose}>
      <div className="upgrade-modal-card" onClick={(e) => e.stopPropagation()}>
        <p className="upgrade-modal-icon">⭐</p>
        <h2 className="upgrade-modal-title">Upgrade to Pro</h2>
        <p className="upgrade-modal-message">{message}</p>

        <div className="upgrade-modal-features">
          {PRO_FEATURES.map((feature) => (
            <span key={feature} className="upgrade-modal-feature">
              <span className="upgrade-modal-check">✓</span>
              {feature}
            </span>
          ))}
        </div>

        <p className="upgrade-modal-price">$12/mo · Cancel anytime</p>

        <div className="upgrade-modal-actions">
          <button type="button" className="btn-primary full-width" onClick={handleUpgrade}>
            Upgrade to Pro →
          </button>
          <button type="button" className="btn-ghost full-width" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
