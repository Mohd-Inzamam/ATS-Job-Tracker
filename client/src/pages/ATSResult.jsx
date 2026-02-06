import { useLocation, useNavigate } from "react-router-dom";
import ScoreBadge from "../components/ScoreBadge";
import FeedbackCard from "../components/FeedbackCard";
import PrimaryButton from "../components/PrimaryButton";

export default function ATSResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate("/ats");
    return null;
  }
  console.log("state", state);

  return (
    <div className="container">
      <ScoreBadge score={state.atsScore} />

      {state.sections?.map((sec, idx) => (
        <FeedbackCard key={idx} title={sec.title} text={sec.feedback} />
      ))}

      <PrimaryButton onClick={() => navigate("/signup")}>
        Save & Improve My Resume
      </PrimaryButton>
    </div>
  );
}
