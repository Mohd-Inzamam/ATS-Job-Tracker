import { Link } from "react-router-dom";

export default function ActionCard({ title, description, actionLabel, to }) {
  return (
    <div className="card action-card">
      <div>
        <h3 className="action-title">{title}</h3>
        <p className="action-desc">{description}</p>
      </div>

      <Link to={to} className="action-btn">
        {actionLabel}
      </Link>
    </div>
  );
}
