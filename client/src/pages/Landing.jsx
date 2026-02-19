import PublicNavbar from "../components/PublicNavbar";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <PublicNavbar />

      <section className="hero center">
        <h1>Beat the ATS. Before it beats you.</h1>
        <p>
          Upload your resume and get an instant ATS score — no signup required.
        </p>

        <PrimaryButton onClick={() => navigate("/ats")}>
          Check My Resume
        </PrimaryButton>
      </section>

      <div className="container center">
        <h2 className="page-title">Why Use Our ATS Checker?</h2>

        <div className="features">
          <div className="feature-card">⚡ Instant Score</div>
          <div className="feature-card">🎯 Keyword Matching</div>
          <div className="feature-card">📈 Improve Hiring Chances</div>
        </div>
      </div>
    </>
  );
}
