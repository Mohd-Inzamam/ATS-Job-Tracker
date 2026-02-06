export default function FeedbackCard({ title, text }) {
  return (
    <div className="card">
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}
