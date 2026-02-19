import { deleteResume } from "../services/resumeService";

export default function ResumeCard({ resume }) {
  const handleDelete = async () => {
    await deleteResume(resume._id);
    window.location.reload();
  };

  return (
    <div className="card resume-card">
      <div className="resume-info">
        <h4>{resume.label || resume.fileName}</h4>
        <p className="resume-score">
          ATS Score:
          <span className="score">{resume.atsScore ?? "—"}</span>
        </p>
      </div>

      <button className="delete-btn" onClick={handleDelete}>
        Delete
      </button>
    </div>
  );
}
