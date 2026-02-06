import { useEffect, useState, useContext } from "react";
import { getResumes, deleteResume } from "../services/resumeService";
import { useAuth } from "../context/AuthContext";
import ResumeCard from "../components/ResumeCard";

export default function Resumes() {
  const { token } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResumes() {
      try {
        const data = await getResumes(token);
        setResumes(data);
      } catch (err) {
        setError("Unable to load resumes");
      } finally {
        setLoading(false);
      }
    }

    loadResumes();
  }, [token]);

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this resume?");
    if (!confirmed) return;

    try {
      await deleteResume(id, token);
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch {
      alert("Failed to delete resume");
    }
  }

  if (loading) return <p>Loading resumes...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="page">
      <h1>Your Resumes</h1>

      {resumes.length === 0 ? (
        <div className="empty-state">
          <p>No resumes uploaded yet.</p>
        </div>
      ) : (
        <div className="resume-grid">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume._id}
              resume={resume}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
