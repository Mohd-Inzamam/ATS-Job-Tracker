import { deleteResume } from "../services/resumeService";

export default function ResumeCard({ resume }) {
  const handleDelete = async () => {
    await deleteResume(resume._id);
    window.location.reload();
  };

  return (
    <div className="card">
      <h4>{resume.label || resume.fileName}</h4>
      <p>ATS Score: {resume.atsScore ?? "—"}</p>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
