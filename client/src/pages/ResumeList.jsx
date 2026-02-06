import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import ResumeCard from "../components/ResumeCard";
import { getResumes, uploadResume } from "../services/resumeService";

export default function ResumeList() {
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    getResumes().then(setResumes);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    const newResume = await uploadResume(file);
    setResumes((prev) => [newResume, ...prev]);
    setFile(null);
  };

  return (
    <DashboardLayout>
      <h2>My Resumes</h2>

      <div className="upload-row">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
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
