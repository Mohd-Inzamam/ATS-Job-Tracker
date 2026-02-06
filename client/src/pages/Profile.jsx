import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [experience, setExperience] = useState(user?.experience || "");
  const [roles, setRoles] = useState(user?.roles?.join(", ") || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    // TODO: replace with API call
    await new Promise((res) => setTimeout(res, 800));

    setSaving(false);
    alert("Profile updated successfully");
  };

  return (
    <div className="container profile-page">
      <div className="profile-card">
        <header className="profile-header">
          <h2>Your Profile</h2>
          <p>Manage your personal and career information</p>
        </header>

        {/* Basic Info */}
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

        {/* Career Info */}
        <section className="profile-section">
          <h3>Career Information</h3>

          <div className="form-group">
            <label>Years of Experience</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}>
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

        {/* Actions */}
        <div className="profile-actions">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
