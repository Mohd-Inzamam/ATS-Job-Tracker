import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepIndicator from "../components/StepIndicator";
import FileUploadBox from "../components/FileUploadBox";
import { updateProfile } from "../services/profileService";
import { uploadResume } from "../services/resumeService";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleStep1Next = async () => {
    if (!role || !experience) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setError("");
      await updateProfile({
        targetRoles: [role],
        yearsOfExperience: experience,
      });
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to save profile");
    }
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile) {
      setLabel(selectedFile.name.split(".")[0]);
    }
  };

  const handleFinish = async () => {
    if (!file || !label) {
      setError("Please select a resume to upload");
      return;
    }

    try {
      setError("");
      setUploading(true);
      await uploadResume(file, label);
      localStorage.setItem("onboardingComplete", "true");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboardingComplete", "true");
    navigate("/dashboard");
  };

  return (
    <div className="container">
      <StepIndicator step={step} total={2} />

      {error && <div className="error-banner">{error}</div>}

      {step === 1 && (
        <div className="onboarding-step">
          <h2>Tell us about yourself</h2>
          <p>This helps us personalise your experience</p>

          <div className="form-group">
            <label>Current / Target Role</label>
            <input
              type="text"
              placeholder="e.g. Frontend Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Years of Experience</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}>
              <option value="">Select</option>
              <option value="0-1">0–1 years</option>
              <option value="1-3">1–3 years</option>
              <option value="3-5">3–5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          <button className="btn-primary" onClick={handleStep1Next}>
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="onboarding-step">
          <h2>Upload your first resume</h2>
          <p>You can always add more later</p>

          <FileUploadBox onFileSelect={handleFileSelect} />

          {file && (
            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label>Resume Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Frontend Resume"
              />
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button
              className="btn-primary"
              onClick={handleFinish}
              disabled={!file || uploading}>
              {uploading ? "Uploading..." : "Finish Setup"}
            </button>

            <button className="secondary-btn" onClick={handleSkip}>
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import StepIndicator from "../components/StepIndicator";
// import FileUploadBox from "../components/FileUploadBox";

// export default function Onboarding() {
//   const [step, setStep] = useState(1);
//   const navigate = useNavigate();

//   const handleFinish = () => {
//     localStorage.setItem("onboardingComplete", "true");
//     navigate("/dashboard");
//   };

//   return (
//     <div className="container">
//       <StepIndicator step={step} total={2} />

//       {step === 1 && (
//         <div>
//           <h2>Tell us about yourself</h2>
//           <input placeholder="Current role" />
//           <button className="btn-primary" onClick={() => setStep(2)}>
//             Next
//           </button>
//         </div>
//       )}

//       {step === 2 && (
//         <div>
//           <h2>Upload your first resume</h2>
//           <FileUploadBox onFileSelect={handleFinish} />
//         </div>
//       )}
//     </div>
//   );
// }
