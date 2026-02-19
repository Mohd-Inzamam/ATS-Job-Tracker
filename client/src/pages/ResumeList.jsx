import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import ResumeCard from "../components/ResumeCard";
import { getResumes, uploadResume } from "../services/resumeService";

export default function ResumeList() {
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    getResumes().then(setResumes);
  }, []);

  const handleUpload = async () => {
    console.log("Uploading file:", file);
    console.log("With label:", label);
    if (!file || !label) return alert("File and label required");

    const newResume = await uploadResume(file, label);
    setResumes((prev) => [newResume, ...prev]);
    setFile(null);
    setLabel("");
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h2>My Resumes</h2>
        <p>Upload and manage your resumes for ATS tracking</p>
      </div>

      <div className="upload-row">
        <input
          type="file"
          onChange={(e) => {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            if (selectedFile) {
              const nameWithoutExt = selectedFile.name.split(".")[0];
              setLabel(nameWithoutExt);
            }
          }}
        />
        <button className="btn-primary" onClick={handleUpload}>
          Upload Resume
        </button>
      </div>

      <div className="grid">
        {resumes.map((resume) => (
          <ResumeCard key={resume._id} resume={resume} />
        ))}
      </div>
    </DashboardLayout>
  );
}
