import { useState } from "react";
import FileUploadBox from "../components/FileUploadBox";
import PrimaryButton from "../components/PrimaryButton";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ScoreBadge from "../components/ScoreBadge";
import FeedbackCard from "../components/FeedbackCard";
import { checkATS } from "../api/api";
import PublicNavbar from "../components/PublicNavbar";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";

export default function ATSUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleCheck = async () => {
    if (!file) return;

    setLoading(true);

    const res = await checkATS(file);

    setLoading(false);
    setResult(res);
  };

  const handleReset = () => {
    setResult(null);
    setFile(null);
  };

  return (
    <>
      <PublicNavbar />

      <div className="upload-page">
        <div className="upload-wrapper">
          {!result ? (
            <>
              {/* Upload State */}
              <div className="upload-header">
                <div className="upload-icon">
                  <span className="material-symbols-outlined">description</span>
                </div>

                <h2>ATS Resume Checker</h2>
                <p>
                  Upload your resume and get an instant compatibility score.
                </p>
              </div>

              <div className="upload-card">
                <FileUploadBox onFileSelect={setFile} />

                {loading && (
                  <div className="upload-loading">
                    <LoadingSkeleton />
                    <p>Analyzing your resume...</p>
                  </div>
                )}

                <PrimaryButton
                  onClick={handleCheck}
                  disabled={!file || loading}>
                  {loading ? "Analyzing..." : "Analyze Resume"}
                </PrimaryButton>
              </div>
            </>
          ) : (
            <>
              {/* Result State */}
              {result?.atsScore >= 80 && <Confetti numberOfPieces={200} />}
              <div className={`bottom-sheet ${result ? "open" : ""}`}>
                <div className="result-container">
                  <ScoreBadge score={result.atsScore} />

                  <div className="result-feedback">
                    {result.sections?.map((sec, idx) => (
                      <div
                        key={idx}
                        className="feedback-animate"
                        style={{ animationDelay: `${idx * 0.15}s` }}>
                        <FeedbackCard title={sec.title} text={sec.feedback} />
                      </div>
                    ))}
                  </div>

                  <div className="result-actions">
                    <PrimaryButton onClick={() => navigate("/signup")}>
                      Save & Improve My Resume
                    </PrimaryButton>

                    <button className="secondary-btn" onClick={handleReset}>
                      Analyze Another Resume
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
