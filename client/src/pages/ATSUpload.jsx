import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUploadBox from "../components/FileUploadBox";
import PrimaryButton from "../components/PrimaryButton";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { checkATS } from "../api/api";
import PublicNavbar from "../components/PublicNavbar";

export default function ATSUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheck = async () => {
    if (!file) return;

    setLoading(true);

    const res = await checkATS(file);

    setLoading(false);

    navigate("/ats/result", { state: { ...res, file } });
  };

  return (
    <div className="container">
      <PublicNavbar />
      <h2>ATS Resume Checker</h2>
      <FileUploadBox onFileSelect={setFile} />
      {loading ? <LoadingSkeleton /> : null}
      <PrimaryButton onClick={handleCheck}>Analyze Resume</PrimaryButton>
    </div>
  );
}
