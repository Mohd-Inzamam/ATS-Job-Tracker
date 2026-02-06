import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepIndicator from "../components/StepIndicator";
import FileUploadBox from "../components/FileUploadBox";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleFinish = () => {
    localStorage.setItem("onboardingComplete", "true");
    navigate("/dashboard");
  };

  return (
    <div className="container">
      <StepIndicator step={step} total={2} />

      {step === 1 && (
        <div>
          <h2>Tell us about yourself</h2>
          <input placeholder="Current role" />
          <button className="btn-primary" onClick={() => setStep(2)}>
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Upload your first resume</h2>
          <FileUploadBox onFileSelect={handleFinish} />
        </div>
      )}
    </div>
  );
}
