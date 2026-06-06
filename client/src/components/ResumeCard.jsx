export default function ResumeCard({ resume, onDelete }) {
  const { atsScore, atsSuggestions } = resume;

  const scoreColor =
    atsScore === null || atsScore === undefined
      ? "#6b7280"
      : atsScore >= 70
      ? "#16a34a"
      : atsScore >= 40
      ? "#d97706"
      : "#dc2626";

  return (
    <div className="card resume-card">
      <div className="resume-info">
        <h4>{resume.label || resume.fileName}</h4>
        <p className="resume-score">
          ATS Score:{" "}
          <span
            className="score"
            style={{
              color: scoreColor,
              fontWeight: 700,
              background: `${scoreColor}18`,
              padding: "2px 10px",
              borderRadius: "999px",
              fontSize: "0.85rem",
            }}>
            {atsScore !== null && atsScore !== undefined ? atsScore : "—"}
          </span>
        </p>
        {atsSuggestions && atsSuggestions.length > 0 && (
          <ul
            style={{
              marginTop: "0.4rem",
              paddingLeft: "1.1rem",
              fontSize: "0.78rem",
              color: "#6b7280",
            }}>
            {atsSuggestions.slice(0, 2).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        )}
      </div>

      <button className="delete-btn" onClick={() => onDelete(resume._id)}>
        Delete
      </button>
    </div>
  );
}
