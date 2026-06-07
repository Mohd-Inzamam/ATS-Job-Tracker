import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  changePasswordService,
  deleteAccountService,
} from "../services/authService";
import { cancelPlanService } from "../services/billingService";

export default function Settings() {
  const { user, logout, setUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleChangePassword = async () => {
    if (passwords.newPass !== passwords.confirm) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (passwords.newPass.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    setChangingPassword(true);
    try {
      await changePasswordService({
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      showToast("Password changed successfully", "success");
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      showToast(err.message || "Failed to change password", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelPro = async () => {
    const confirmed = window.confirm(
      "Cancel your Pro plan? You'll be moved to the free tier."
    );
    if (!confirmed) return;

    setCancelling(true);
    try {
      await cancelPlanService();
      setUser((prev) => ({ ...prev, plan: "free" }));
      showToast("Plan cancelled. You're now on the free tier.", "info");
    } catch (err) {
      showToast(err.message || "Failed to cancel plan", "error");
    } finally {
      setCancelling(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you sure? This cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteAccountService();
      logout();
      navigate("/");
    } catch (err) {
      showToast(err.message || "Failed to delete account", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="profile-card">
        <header className="profile-header">
          <h2>Settings</h2>
          <p>Manage your account security and preferences</p>
        </header>

        {user?.plan !== "pro" ? (
          <section className="profile-section">
            <h3>Billing & Plan</h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500 }}>Free Plan</p>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                  1 resume · 5 applications · No AI features
                </p>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate("/checkout")}
              >
                Upgrade to Pro →
              </button>
            </div>
          </section>
        ) : (
          <section className="profile-section">
            <h3>Billing & Plan</h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500 }}>⭐ Pro Plan</p>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                  All features unlocked · Demo subscription active
                </p>
              </div>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "0.5px solid var(--color-border-danger)",
                  color: "var(--color-text-danger)",
                  borderRadius: "var(--border-radius-md)",
                  padding: "6px 14px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
                onClick={handleCancelPro}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel Plan"}
              </button>
            </div>
          </section>
        )}

        <section className="profile-section">
          <h3>Security</h3>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={passwords.newPass}
              onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            />
          </div>
          <button
            className="btn-primary"
            onClick={handleChangePassword}
            disabled={changingPassword || !passwords.current || !passwords.newPass}
          >
            {changingPassword ? "Updating..." : "Update Password"}
          </button>
        </section>

        <section className="danger-zone">
          <h3 className="danger-zone-title">Delete Account</h3>
          <p className="danger-zone-body">
            This will permanently delete your account, all resumes, and all job
            applications. This action cannot be undone.
          </p>
          <button
            type="button"
            className="btn-ghost btn-ghost-danger"
            onClick={handleDeleteAccount}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete My Account"}
          </button>
        </section>
      </div>
    </DashboardLayout>
  );
}
