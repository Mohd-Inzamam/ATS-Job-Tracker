import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FileUploadBox from "../components/FileUploadBox";
import { updateProfile } from "../services/profileService";
import { uploadResume } from "../services/resumeService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const STEPS = [
  { num: 1, label: "Profile" },
  { num: 2, label: "Resume" },
  { num: 3, label: "Ready" },
];

const TARGET_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Data Analyst",
  "Product Manager",
  "UX Designer",
  "DevOps Engineer",
  "ML Engineer",
  "Other",
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [experience, setExperience] = useState("");
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [guestATS, setGuestATS] = useState(null);

  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const stored = sessionStorage.getItem("guestATSResult");
    if (stored) {
      try {
        setGuestATS(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem("guestATSResult");
      }
    }
  }, []);

  const clearGuestSession = () => sessionStorage.removeItem("guestATSResult");

  const effectiveRole = role === "Other" ? customRole : role;

  /* ── Step 1 → 2 ── */
  const handleStep1 = async () => {
    if (!effectiveRole || !experience) {
      showToast("Please fill in all fields", "error");
      return;
    }
    try {
      await updateProfile({
        targetRoles: [effectiveRole],
        yearsOfExperience: experience,
      });
      setStep(2);
    } catch (err) {
      showToast(err.message || "Failed to save profile", "error");
    }
  };

  /* ── Step 2 → 3 (with resume) ── */
  const handleUploadAndContinue = async () => {
    if (!file || !label) {
      showToast("Please select a resume file and add a label", "error");
      return;
    }
    try {
      setUploading(true);
      await uploadResume(file, label);
      clearGuestSession();
      setStep(3);
    } catch (err) {
      showToast(err.message || "Failed to upload resume", "error");
    } finally {
      setUploading(false);
    }
  };

  /* ── Skip resume upload → step 3 ── */
  const handleSkipResume = () => {
    clearGuestSession();
    setStep(3);
  };

  /* ── Finish ── */
  const handleFinish = async () => {
    try {
      await completeOnboarding();
      navigate("/dashboard");
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
    }
  };

  return (
    <div className="onboarding-page">
      {/* Step indicator */}
      <div className="onboarding-header">
        <div className="onboarding-brand">
          <span className="auth-brand-mark">▲</span>
          <span className="auth-brand-name">ATSPro</span>
        </div>
        <div className="onboarding-steps">
          {STEPS.map((s, i) => (
            <div key={s.num} className="onboarding-step-track">
              <div
                className={`onboarding-step-dot ${step > s.num ? "done" : step === s.num ? "active" : ""}`}>
                {step > s.num ? (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "14px" }}>
                    check
                  </span>
                ) : (
                  s.num
                )}
              </div>
              <span
                className={`onboarding-step-label ${step === s.num ? "active" : ""}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`onboarding-step-line ${step > s.num ? "done" : ""}`}
                />
              )}
            </div>
          ))}
        </div>
        <div style={{ width: "100px" }} /> {/* spacer to balance brand */}
      </div>

      {/* Step content */}
      <div className="onboarding-body">
        {/* ── Step 1: Profile ── */}
        {step === 1 && (
          <div className="onboarding-card">
            <div className="onboarding-card-icon">👋</div>
            <h2>Tell us about yourself</h2>
            <p className="onboarding-card-sub">
              Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! This helps
              us personalise your ATS scores and insights.
            </p>

            <div className="onboarding-form">
              <div className="form-group">
                <label>Target role</label>
                <div className="role-chips">
                  {TARGET_ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`role-chip ${role === r ? "selected" : ""}`}
                      onClick={() => setRole(r)}>
                      {r}
                    </button>
                  ))}
                </div>
                {role === "Other" && (
                  <input
                    type="text"
                    placeholder="e.g. Growth Hacker"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    style={{ marginTop: "10px" }}
                  />
                )}
              </div>

              <div className="form-group">
                <label>Years of experience</label>
                <div className="exp-options">
                  {["0–1 years", "1–3 years", "3–5 years", "5+ years"].map(
                    (e) => (
                      <button
                        key={e}
                        type="button"
                        className={`exp-option ${experience === e ? "selected" : ""}`}
                        onClick={() => setExperience(e)}>
                        {e}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={handleStep1}
                disabled={!effectiveRole || !experience}>
                Continue
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px", marginLeft: "6px" }}>
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Resume Upload ── */}
        {step === 2 && (
          <div className="onboarding-card">
            <div className="onboarding-card-icon">📄</div>
            <h2>Upload your first resume</h2>
            <p className="onboarding-card-sub">
              Get an instant ATS score. You can upload more resumes later.
            </p>

            {guestATS && (
              <div className="guest-ats-banner">
                ✦ We saved your guest ATS scan — your resume scored{" "}
                <strong>{guestATS.atsScore}/100</strong>. Upload it here to save
                it to your account.
              </div>
            )}

            <FileUploadBox
              onFileSelect={(f) => {
                setFile(f);
                if (f) setLabel(f.name.split(".")[0]);
              }}
            />

            {file && (
              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label>Resume label</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Frontend Resume"
                />
              </div>
            )}

            <div className="onboarding-actions">
              <button
                className="btn-primary"
                onClick={handleUploadAndContinue}
                disabled={!file || uploading}>
                {uploading ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}>
                    <span
                      className="parse-spinner"
                      style={{ width: "16px", height: "16px" }}
                    />
                    Uploading…
                  </span>
                ) : (
                  <>
                    Upload & continue
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "18px", marginLeft: "6px" }}>
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
              <button className="secondary-btn" onClick={handleSkipResume}>
                Skip for now
              </button>
            </div>

            <button
              type="button"
              className="onboarding-back-btn"
              onClick={() => setStep(1)}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px" }}>
                arrow_back
              </span>
              Back
            </button>
          </div>
        )}

        {/* ── Step 3: Ready ── */}
        {step === 3 && (
          <div className="onboarding-card onboarding-card-ready">
            <div className="ready-checkmark">✓</div>
            <h2>You're all set!</h2>
            <p className="onboarding-card-sub">
              Your account is ready. Here's what you can do first:
            </p>

            <div className="ready-features">
              {[
                {
                  icon: "📊",
                  title: "Check ATS Score",
                  desc: "Upload any resume and see your score in seconds.",
                },
                {
                  icon: "💼",
                  title: "Track Applications",
                  desc: "Add jobs and move them through your pipeline.",
                },
                {
                  icon: "🎯",
                  title: "Match Resume to JD",
                  desc: "Paste a job description and find the gaps.",
                },
                {
                  icon: "🤖",
                  title: "Get AI Coaching",
                  desc: "Interview prep and actionable resume tips.",
                },
              ].map((f) => (
                <div key={f.title} className="ready-feature">
                  <span className="ready-feature-icon">{f.icon}</span>
                  <div>
                    <p className="ready-feature-title">{f.title}</p>
                    <p className="ready-feature-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn-primary"
              onClick={handleFinish}
              style={{ width: "100%", marginTop: "1.5rem" }}>
              Go to Dashboard
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px", marginLeft: "6px" }}>
                arrow_forward
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import StepIndicator from "../components/StepIndicator";
// import FileUploadBox from "../components/FileUploadBox";
// import { updateProfile } from "../services/profileService";
// import { uploadResume } from "../services/resumeService";
// import { useAuth } from "../context/AuthContext";
// import { useToast } from "../context/ToastContext";

// export default function Onboarding() {
//   const [step, setStep] = useState(1);
//   const [role, setRole] = useState("");
//   const [experience, setExperience] = useState("");
//   const [file, setFile] = useState(null);
//   const [label, setLabel] = useState("");
//   const [uploading, setUploading] = useState(false);
//   const [guestATS, setGuestATS] = useState(null);
//   const navigate = useNavigate();
//   const { completeOnboarding } = useAuth();
//   const { showToast } = useToast();

//   useEffect(() => {
//     const stored = sessionStorage.getItem("guestATSResult");
//     if (stored) {
//       try {
//         setGuestATS(JSON.parse(stored));
//       } catch {
//         sessionStorage.removeItem("guestATSResult");
//       }
//     }
//   }, []);

//   const clearGuestSession = () => {
//     sessionStorage.removeItem("guestATSResult");
//   };

//   const handleStep1Next = async () => {
//     if (!role || !experience) {
//       showToast("Please fill in all fields", "error");
//       return;
//     }

//     try {
//       await updateProfile({
//         targetRoles: [role],
//         yearsOfExperience: experience,
//       });
//       setStep(2);
//     } catch (err) {
//       showToast(err.message || "Failed to save profile", "error");
//     }
//   };

//   const handleFileSelect = (selectedFile) => {
//     setFile(selectedFile);
//     if (selectedFile) {
//       setLabel(selectedFile.name.split(".")[0]);
//     }
//   };

//   const handleFinish = async () => {
//     if (!file || !label) {
//       showToast("Please select a resume to upload", "error");
//       return;
//     }

//     try {
//       setUploading(true);
//       await uploadResume(file, label);
//       clearGuestSession();
//       await completeOnboarding();
//       navigate("/dashboard");
//     } catch (err) {
//       showToast(err.message || "Failed to upload resume", "error");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleSkip = async () => {
//     clearGuestSession();
//     await completeOnboarding();
//     navigate("/dashboard");
//   };

//   return (
//     <div className="container">
//       <StepIndicator step={step} total={2} />

//       {step === 1 && (
//         <div className="onboarding-step">
//           <h2>Tell us about yourself</h2>
//           <p>This helps us personalise your experience</p>

//           <div className="form-group">
//             <label>Current / Target Role</label>
//             <input
//               type="text"
//               placeholder="e.g. Frontend Developer"
//               value={role}
//               onChange={(e) => setRole(e.target.value)}
//             />
//           </div>

//           <div className="form-group">
//             <label>Years of Experience</label>
//             <select
//               value={experience}
//               onChange={(e) => setExperience(e.target.value)}
//             >
//               <option value="">Select</option>
//               <option value="0-1">0–1 years</option>
//               <option value="1-3">1–3 years</option>
//               <option value="3-5">3–5 years</option>
//               <option value="5+">5+ years</option>
//             </select>
//           </div>

//           <button className="btn-primary" onClick={handleStep1Next}>
//             Next
//           </button>
//         </div>
//       )}

//       {step === 2 && (
//         <div className="onboarding-step">
//           <h2>Upload your first resume</h2>
//           <p>You can always add more later</p>

//           {guestATS && (
//             <div className="guest-ats-banner">
//               ✦ We saved your ATS scan — your resume scored {guestATS.atsScore}/100.
//               Upload it here to unlock your full report.
//             </div>
//           )}

//           <FileUploadBox onFileSelect={handleFileSelect} />

//           {file && (
//             <div className="form-group" style={{ marginTop: "1rem" }}>
//               <label>Resume Label</label>
//               <input
//                 type="text"
//                 value={label}
//                 onChange={(e) => setLabel(e.target.value)}
//                 placeholder="e.g. Frontend Resume"
//               />
//             </div>
//           )}

//           <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
//             <button
//               className="btn-primary"
//               onClick={handleFinish}
//               disabled={!file || uploading}
//             >
//               {uploading ? "Uploading..." : "Finish Setup"}
//             </button>

//             <button className="secondary-btn" onClick={handleSkip}>
//               Skip for now
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
