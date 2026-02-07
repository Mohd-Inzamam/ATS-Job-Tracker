import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h3 className="sidebar-logo">ATS</h3>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/resumes">Resumes</NavLink>
        <NavLink to="/applications">Applications</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </nav>
    </aside>
  );
}
