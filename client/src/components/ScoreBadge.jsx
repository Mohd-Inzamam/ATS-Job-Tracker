import { useEffect, useState } from "react";

export default function ScoreBadge({ score }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [animatedOffset, setAnimatedOffset] = useState(null);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  // Count up the number
  useEffect(() => {
    let start = 0;
    const duration = 1200;
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

  // Animate ring: start from full circumference (empty), draw to target
  useEffect(() => {
    // Start fully empty (offset = circumference)
    setAnimatedOffset(circumference);
    // After a tiny delay, animate to the real value
    const t = setTimeout(() => {
      const targetOffset = circumference - (score / 100) * circumference;
      setAnimatedOffset(targetOffset);
    }, 80);
    return () => clearTimeout(t);
  }, [score, circumference]);

  const scoreColor =
    score >= 70 ? "#16a34a" : score >= 40 ? "#d97706" : "#dc2626";

  return (
    <div className="score-wrapper">
      <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
        {/* Background ring */}
        <circle
          className="score-bg"
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
        />
        {/* Animated progress ring */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset ?? circumference}
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>

      <div className="score-text">
        <h2
          style={{
            fontFamily: "var(--font-mono, monospace)",
            color: scoreColor,
          }}>
          {displayScore}
        </h2>
        <p>ATS Score</p>
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";

// export default function ScoreBadge({ score }) {
//   const [displayScore, setDisplayScore] = useState(0);

//   useEffect(() => {
//     let start = 0;
//     const duration = 1000;
//     const increment = score / (duration / 16);

//     const counter = setInterval(() => {
//       start += increment;
//       if (start >= score) {
//         setDisplayScore(score);
//         clearInterval(counter);
//       } else {
//         setDisplayScore(Math.floor(start));
//       }
//     }, 16);

//     return () => clearInterval(counter);
//   }, [score]);

//   const radius = 70;
//   const circumference = 2 * Math.PI * radius;
//   const progress = (displayScore / 100) * circumference;

//   return (
//     <div className="score-wrapper">
//       <svg width="180" height="180">
//         <circle className="score-bg" cx="90" cy="90" r={radius} />
//         <circle
//           className="score-progress"
//           cx="90"
//           cy="90"
//           r={radius}
//           strokeDasharray={circumference}
//           strokeDashoffset={circumference - progress}
//         />
//       </svg>

//       <div className="score-text">
//         <h2>{displayScore}</h2>
//         <p>ATS Score</p>
//       </div>
//     </div>
//   );
// }
