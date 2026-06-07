import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import DashboardLayout from "../layout/DashboardLayout";
import { updateProfile } from "../services/profileService";
import { changePasswordService } from "../services/authService";

export default function Profile() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [experience, setExperience] = useState(user?.yearsOfExperience || "");
  const [roles, setRoles] = useState(user?.targetRoles?.join(", ") || "");
  const [saving, setSaving] = useState(false);

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    try {
      const updated = await updateProfile({
        name,
        yearsOfExperience: experience,
        targetRoles: roles
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
      });

      setUser(updated);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <DashboardLayout>
      <div className="profile-card">
        <header className="profile-header">
          <h2>Your Profile</h2>
          <p>Manage your personal and career information</p>
          <div style={{ marginTop: "0.75rem" }}>
            <span className={`plan-badge plan-badge-${user?.plan || "free"}`}>
              {user?.plan === "pro" ? "⭐ Pro" : "Free Plan"}
            </span>
            {user?.plan !== "pro" && (
              <Link
                to="/pricing"
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-info)",
                  marginLeft: "0.75rem",
                }}
              >
                Upgrade to Pro →
              </Link>
            )}
          </div>
        </header>

        <section className="profile-section">
          <h3>Basic Information</h3>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user?.email || ""} disabled />
          </div>
        </section>

        <section className="profile-section">
          <h3>Career Information</h3>

          <div className="form-group">
            <label>Years of Experience</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option value="">Select</option>
              <option value="0-1">0–1 years</option>
              <option value="1-3">1–3 years</option>
              <option value="3-5">3–5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          <div className="form-group">
            <label>Target Job Roles</label>
            <input
              type="text"
              placeholder="Frontend Developer, React Developer"
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
            />
            <small>Comma-separated roles</small>
          </div>
        </section>

        <section className="profile-section">
          <h3>Change Password</h3>
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

        <div className="profile-actions">
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
