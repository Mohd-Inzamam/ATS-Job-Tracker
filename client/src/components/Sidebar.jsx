import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">ATS</h2>
        <p className="sidebar-subtitle">Resume Analyzer</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-nav-item">
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/resumes" className="sidebar-nav-item">
          <span className="material-symbols-outlined">description</span>
          <span>Resumes</span>
        </NavLink>

        <NavLink to="/applications" className="sidebar-nav-item">
          <span className="material-symbols-outlined">work</span>
          <span>Applications</span>
        </NavLink>

        <NavLink to="/profile" className="sidebar-nav-item">
          <span className="material-symbols-outlined">person</span>
          <span>Profile</span>
        </NavLink>
      </nav>
    </aside>
  );
}

// import { NavLink } from "react-router-dom";

// export default function Sidebar() {
//   return (
//     <aside className="sidebar">
//       <h3 className="sidebar-logo">ATS</h3>

//       <nav className="sidebar-nav">
//         <NavLink to="/dashboard">Dashboard</NavLink>
//         <NavLink to="/resumes">Resumes</NavLink>
//         <NavLink to="/applications">Applications</NavLink>
//         <NavLink to="/profile">Profile</NavLink>
//       </nav>
//     </aside>
//   );
// }
