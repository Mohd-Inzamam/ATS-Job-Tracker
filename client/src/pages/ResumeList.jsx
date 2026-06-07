import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layout/DashboardLayout";
import ResumeCard from "../components/ResumeCard";
import FileUploadBox from "../components/FileUploadBox";
import EmptyState from "../components/EmptyState";
import { useToast } from "../context/ToastContext";
import { useUpgradeModal } from "../context/UpgradeModalContext";
import {
  getResumes,
  uploadResume,
  deleteResume,
} from "../services/resumeService";

const FREE_RESUME_LIMIT = 2;

export default function ResumeList() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showUpgradeModal } = useUpgradeModal();

  const [resumes, setResumes] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);

  const isFree = user?.plan !== "pro";
  const atResumeLimit = isFree && resumes.length >= FREE_RESUME_LIMIT;

  useEffect(() => {
    getResumes()
      .then(setResumes)
      .catch(() => showToast("Failed to load resumes", "error"))
      .finally(() => setLoaded(true));
  }, []);

  const handleFileSelect = (selectedFile) => {
    if (atResumeLimit) {
      showUpgradeModal(
        "resumes",
        `Free plan allows ${FREE_RESUME_LIMIT} resumes. Upgrade to Pro for unlimited.`,
      );
      return;
    }
    setFile(selectedFile);
    if (selectedFile) setLabel(selectedFile.name.split(".")[0]);
  };

  const handleUpload = async () => {
    if (atResumeLimit) {
      showUpgradeModal(
        "resumes",
        `Free plan allows ${FREE_RESUME_LIMIT} resumes. Upgrade to Pro for unlimited.`,
      );
      return;
    }
    if (!file || !label) {
      showToast("File and label are required", "error");
      return;
    }
    try {
      setUploading(true);
      const newResume = await uploadResume(file, label);
      setResumes((prev) => [newResume, ...prev]);
      setFile(null);
      setLabel("");
      showToast("Resume uploaded successfully!", "success");
    } catch (err) {
      // Backend plan-limit response
      if (err.upgradeRequired || err.limitReached) {
        showUpgradeModal(
          "resumes",
          `Free plan allows ${FREE_RESUME_LIMIT} resumes. Upgrade to Pro for unlimited.`,
        );
      } else {
        showToast(err.message || "Failed to upload resume", "error");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resume?")) return;
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r._id !== id));
      showToast("Resume deleted", "info");
    } catch {
      showToast("Failed to delete resume", "error");
    }
  };

  return (
    <DashboardLayout>
      <div className="page-enter">
        <div className="page-header">
          <h2>My Resumes</h2>
          <p>Upload and manage your resumes for ATS tracking</p>
        </div>

        {atResumeLimit && (
          <div className="usage-banner usage-banner-warning">
            ✦ You're using {resumes.length}/{FREE_RESUME_LIMIT} free resume
            slots.{" "}
            <button
              type="button"
              className="usage-banner-link"
              onClick={() =>
                showUpgradeModal(
                  "resumes",
                  `Free plan allows ${FREE_RESUME_LIMIT} resumes. Upgrade to Pro for unlimited.`,
                )
              }>
              Upgrade to Pro for unlimited →
            </button>
          </div>
        )}

        {!atResumeLimit &&
          isFree &&
          resumes.length === FREE_RESUME_LIMIT - 1 && (
            <div className="usage-banner usage-banner-info">
              ✦ {resumes.length}/{FREE_RESUME_LIMIT} resume slots used.{" "}
              <button
                type="button"
                className="usage-banner-link usage-banner-link-info"
                onClick={() =>
                  showUpgradeModal(
                    "resumes",
                    "Upgrade to Pro for unlimited resumes.",
                  )
                }>
                Upgrade for unlimited →
              </button>
            </div>
          )}

        <div className="upload-section">
          <FileUploadBox onFileSelect={handleFileSelect} />

          {file && !atResumeLimit && (
            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label>Resume Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Backend Resume"
              />
            </div>
          )}

          <div
            className="upload-btn-wrap"
            title={atResumeLimit ? "Upgrade to add more resumes" : ""}>
            <button
              className="btn-primary"
              onClick={
                atResumeLimit
                  ? () =>
                      showUpgradeModal(
                        "resumes",
                        `Free plan allows ${FREE_RESUME_LIMIT} resumes.`,
                      )
                  : handleUpload
              }
              disabled={!atResumeLimit && (!file || uploading)}>
              {uploading ? "Uploading..." : "Upload Resume"}
            </button>
          </div>
        </div>

        {loaded && resumes.length === 0 ? (
          <EmptyState
            icon="📄"
            title="No resumes yet"
            body="Upload your first resume to get an ATS score and start tracking applications."
            ctaLabel="Upload Resume"
            onCta={() =>
              document.getElementById("resume-upload-input")?.click()
            }
          />
        ) : (
          <div className="grid">
            {resumes.map((resume) => (
              <div key={resume._id} className="stagger-item">
                <ResumeCard
                  resume={resume}
                  onDelete={handleDelete}
                  atsScore={resume.atsScore}
                  atsSuggestions={resume.atsSuggestions}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import DashboardLayout from "../layout/DashboardLayout";
// import ResumeCard from "../components/ResumeCard";
// import FileUploadBox from "../components/FileUploadBox";
// import EmptyState from "../components/EmptyState";
// import {
//   getResumes,
//   uploadResume,
//   deleteResume,
// } from "../services/resumeService";

// export default function ResumeList() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [resumes, setResumes] = useState([]);
//   const [loaded, setLoaded] = useState(false);
//   const [file, setFile] = useState(null);
//   const [label, setLabel] = useState("");
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState("");

//   const isFree = user?.plan !== "pro";
//   const atResumeLimit = isFree && resumes.length >= 1;

//   useEffect(() => {
//     getResumes()
//       .then(setResumes)
//       .catch(() => setError("Failed to load resumes"))
//       .finally(() => setLoaded(true));
//   }, []);

//   const handleFileSelect = (selectedFile) => {
//     if (atResumeLimit) return;
//     setFile(selectedFile);
//     if (selectedFile) {
//       setLabel(selectedFile.name.split(".")[0]);
//     }
//   };

//   const handleUpload = async () => {
//     if (atResumeLimit) return;
//     if (!file || !label) {
//       setError("File and label are required");
//       return;
//     }

//     try {
//       setError("");
//       setUploading(true);
//       const newResume = await uploadResume(file, label);
//       setResumes((prev) => [newResume, ...prev]);
//       setFile(null);
//       setLabel("");
//     } catch (err) {
//       setError(err.message || "Failed to upload resume");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this resume?")) return;
//     try {
//       await deleteResume(id);
//       setResumes((prev) => prev.filter((r) => r._id !== id));
//     } catch {
//       setError("Failed to delete resume");
//     }
//   };

//   return (
//     <DashboardLayout>
//       <div className="page-enter">
//         <div className="page-header">
//           <h2>My Resumes</h2>
//           <p>Upload and manage your resumes for ATS tracking</p>
//         </div>

//         {error && <div className="error-banner">{error}</div>}

//         {atResumeLimit && (
//           <div className="usage-banner usage-banner-warning">
//             ✦ You're using 1/1 free resume slot.{" "}
//             <button
//               type="button"
//               className="usage-banner-link"
//               onClick={() => navigate("/pricing")}
//             >
//               Upgrade to Pro for unlimited →
//             </button>
//           </div>
//         )}

//         <div className="upload-section">
//           <FileUploadBox onFileSelect={handleFileSelect} />

//           {file && !atResumeLimit && (
//             <div className="form-group" style={{ marginTop: "1rem" }}>
//               <label>Resume Label</label>
//               <input
//                 type="text"
//                 value={label}
//                 onChange={(e) => setLabel(e.target.value)}
//                 placeholder="e.g. Backend Resume"
//               />
//             </div>
//           )}

//           <div
//             className="upload-btn-wrap"
//             title={atResumeLimit ? "Upgrade to add more resumes" : ""}
//           >
//             <button
//               className="btn-primary"
//               onClick={handleUpload}
//               disabled={!file || uploading || atResumeLimit}
//             >
//               {uploading ? "Uploading..." : "Upload Resume"}
//             </button>
//           </div>
//         </div>

//         {loaded && resumes.length === 0 ? (
//           <EmptyState
//             icon="📄"
//             title="No resumes yet"
//             body="Upload your first resume to get an ATS score and start tracking applications."
//             ctaLabel="Upload Resume"
//             onCta={() => document.getElementById("resume-upload-input")?.click()}
//           />
//         ) : (
//           <div className="grid">
//             {resumes.map((resume) => (
//               <div key={resume._id} className="stagger-item">
//                 <ResumeCard
//                   resume={resume}
//                   onDelete={handleDelete}
//                   atsScore={resume.atsScore}
//                   atsSuggestions={resume.atsSuggestions}
//                 />
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// }
