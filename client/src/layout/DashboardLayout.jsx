import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const { logout } = useAuth();

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="content">
        <div className="topbar">
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
