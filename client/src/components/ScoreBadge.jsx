export default function ScoreBadge({ score }) {
  return (
    <div className="score-badge">
      <h3>ATS Score</h3>
      <span>{score}/100</span>
    </div>
  );
}
