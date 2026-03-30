import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import PipelineStatus from "../components/PipelineStatus";
import {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
} from "../services/applicationService";
import { getResumes } from "../services/resumeService";

const STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    jobTitle: "",
    jobDescription: "",
    resumeId: "",
  });

  // Load applications and resumes together
  useEffect(() => {
    const load = async () => {
      try {
        const [apps, res] = await Promise.all([
          getApplications(),
          getResumes(),
        ]);
        setApplications(apps);
        setResumes(res);
      } catch (err) {
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Build pipeline counts from real data
  const pipelineData = STATUSES.reduce((acc, status) => {
    acc[status.toLowerCase()] = applications.filter(
      (a) => a.status === status,
    ).length;
    return acc;
  }, {});

  const handleCreate = async () => {
    if (
      !form.companyName ||
      !form.jobTitle ||
      !form.jobDescription ||
      !form.resumeId
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const newApp = await createApplication(form);
      setApplications((prev) => [newApp, ...prev]);
      setForm({
        companyName: "",
        jobTitle: "",
        jobDescription: "",
        resumeId: "",
      });
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Failed to create application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await updateApplicationStatus(id, status);
      setApplications((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a)),
      );
    } catch {
      setError("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      await deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a._id !== id));
    } catch {
      setError("Failed to delete application");
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <p>Loading...</p>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>Applications</h2>
        <button
          className="btn-primary"
          onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? "Cancel" : "+ Add Application"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Pipeline Summary */}
      <PipelineStatus data={pipelineData} />

      {/* Add Application Form */}
      {showForm && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3>New Application</h3>

          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              placeholder="e.g. Google"
              value={form.companyName}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              placeholder="e.g. Frontend Developer"
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Resume Used</label>
            <select
              value={form.resumeId}
              onChange={(e) => setForm({ ...form, resumeId: e.target.value })}>
              <option value="">Select a resume</option>
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Job Description</label>
            <textarea
              rows={5}
              placeholder="Paste the job description here..."
              value={form.jobDescription}
              onChange={(e) =>
                setForm({ ...form, jobDescription: e.target.value })
              }
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={submitting}>
            {submitting ? "Saving..." : "Save Application"}
          </button>
        </div>
      )}

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="card center" style={{ marginTop: "2rem" }}>
          <p>No applications yet.</p>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            Add your first application to start tracking your job search.
          </p>
        </div>
      ) : (
        <div className="applications-list" style={{ marginTop: "1.5rem" }}>
          {applications.map((app) => (
            <div key={app._id} className="application-card card">
              <div className="app-card-header">
                <div>
                  <h3>{app.jobTitle}</h3>
                  <p className="company-name">{app.companyName}</p>
                  <p className="resume-label">
                    Resume: {app.resume?.label || "N/A"}
                  </p>
                </div>

                <div className="app-card-actions">
                  <select
                    value={app.status}
                    onChange={(e) =>
                      handleStatusChange(app._id, e.target.value)
                    }>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(app._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
