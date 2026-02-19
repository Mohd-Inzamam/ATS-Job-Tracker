import { Link } from "react-router-dom";

export default function ActionCard({ title, description, actionLabel, to }) {
  return (
    <div className="card action-card enhanced">
      <div className="action-content">
        <div className="action-icon">
          <span className="material-symbols-outlined">rocket_launch</span>
        </div>

        <div>
          <h3 className="action-title">{title}</h3>
          <p className="action-desc">{description}</p>
        </div>
      </div>

      <Link to={to} className="action-btn">
        {actionLabel}
      </Link>
    </div>
  );
}
