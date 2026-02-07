import { Link } from "react-router-dom";

export default function PublicNavbar() {
  return (
    <header className="public-nav">
      <div className="nav-inner">
        <Link to="/" className="logo">
          ATS
        </Link>

        <nav className="nav-links">
          <Link to="/ats">ATS Checker</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup" className="btn-link">
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
