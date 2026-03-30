import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import ResumeCard from "../components/ResumeCard";
import FileUploadBox from "../components/FileUploadBox";
import {
  getResumes,
  uploadResume,
  deleteResume,
} from "../services/resumeService";
import { checkATS } from "../services/atsService";

export default function ResumeList() {
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getResumes()
      .then(setResumes)
      .catch(() => setError("Failed to load resumes"));
  }, []);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile) {
      setLabel(selectedFile.name.split(".")[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !label) {
      setError("File and label are required");
      return;
    }

    try {
      setError("");
      setUploading(true);

      // Run ATS check and upload in parallel
      const [atsResult, newResume] = await Promise.all([
        checkATS(file),
        uploadResume(file, label),
      ]);

      console.log("ATS Score:", atsResult.atsScore);

      setResumes((prev) => [newResume, ...prev]);
      setFile(null);
      setLabel("");
    } catch (err) {
      setError(err.message || "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resume?")) return;
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch {
      setError("Failed to delete resume");
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>My Resumes</h2>
        <p>Upload and manage your resumes for ATS tracking</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="upload-section">
        <FileUploadBox onFileSelect={handleFileSelect} />

        {file && (
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

        <button
          className="btn-primary"
          onClick={handleUpload}
          disabled={!file || uploading}>
          {uploading ? "Uploading..." : "Upload Resume"}
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="card center" style={{ marginTop: "2rem" }}>
          <p>No resumes uploaded yet.</p>
        </div>
      ) : (
        <div className="grid">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume._id}
              resume={resume}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

// import { useEffect, useState } from "react";
// import DashboardLayout from "../layout/DashboardLayout";
// import ResumeCard from "../components/ResumeCard";
// import FileUploadBox from "../components/FileUploadBox";
// import { getResumes, uploadResume } from "../services/resumeService";
// import { checkATS } from "../services/atsService";

// export default function ResumeList() {
//   const [resumes, setResumes] = useState([]);
//   const [file, setFile] = useState(null);
//   const [label, setLabel] = useState("");
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     getResumes().then(setResumes);
//   }, []);

//   const handleFileSelect = (selectedFile) => {
//     setFile(selectedFile);

//     if (selectedFile) {
//       const nameWithoutExt = selectedFile.name.split(".")[0];
//       setLabel(nameWithoutExt);
//     }
//   };

//   const handleUpload = async () => {
//     if (!file || !label) {
//       alert("File and label required");
//       return;
//     }

//     try {
//       setUploading(true);

//       const analyzedResume = await checkATS(file);
//       console.log("ATS Analysis Result:", analyzedResume);

//       const newResume = await uploadResume(file, label);

//       const resumeWithScore = {
//         ...newResume,
//         atsScore: analyzedResume.score,
//       };

//       setResumes((prev) => [resumeWithScore, ...prev]);

//       setFile(null);
//       setLabel("");
//       setUploading(false);
//     } catch (error) {
//       console.error("Error uploading resume:", error);
//       setUploading(false);
//     }
//   };

//   return (
//     <DashboardLayout>
//       <div className="page-header">
//         <h2>My Resumes</h2>
//         <p>Upload and manage your resumes for ATS tracking</p>
//       </div>

//       <div className="upload-section">
//         <FileUploadBox onFileSelect={handleFileSelect} />

//         <button
//           className="btn-primary"
//           onClick={handleUpload}
//           disabled={!file || uploading}>
//           {uploading ? "Uploading..." : "Upload Resume"}
//         </button>
//       </div>

//       <div className="grid">
//         {resumes.map((resume) => (
//           <ResumeCard key={resume._id} resume={resume} />
//         ))}
//       </div>
//     </DashboardLayout>
//   );
// }
