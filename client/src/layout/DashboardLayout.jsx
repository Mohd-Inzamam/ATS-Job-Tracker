import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const { logout } = useAuth();

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h3>ATS</h3>
        <button onClick={logout}>Logout</button>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
