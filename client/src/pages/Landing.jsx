import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";
import PublicNavbar from "../components/PublicNavbar";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="container center">
      <PublicNavbar />
      <h1>Beat the ATS. Before it beats you.</h1>
      <p>
        Upload your resume and get an instant ATS score — no signup required.
      </p>
      <PrimaryButton onClick={() => navigate("/ats")}>
        Check My Resume
      </PrimaryButton>
    </div>
  );
}
