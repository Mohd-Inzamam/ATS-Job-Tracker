import { useEffect, useState } from "react";

export default function ScoreBadge({ score }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = score / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(counter);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [score]);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 100) * circumference;

  return (
    <div className="score-wrapper">
      <svg width="180" height="180">
        <circle className="score-bg" cx="90" cy="90" r={radius} />
        <circle
          className="score-progress"
          cx="90"
          cy="90"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>

      <div className="score-text">
        <h2>{displayScore}</h2>
        <p>ATS Score</p>
      </div>
    </div>
  );
}
