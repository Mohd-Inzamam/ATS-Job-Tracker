import { useRef, useState } from "react";

export default function FileUploadBox({ onFileSelect }) {
  const inputRef = useRef();
  const [fileName, setFileName] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    onFileSelect(file);
  };

  return (
    <div className="file-upload-box" onClick={() => inputRef.current.click()}>
      {!fileName ? (
        <>
          <span className="material-symbols-outlined upload-icon">
            upload_file
          </span>
          <p>Tap to upload resume</p>
          <span className="file-hint">PDF, DOC, DOCX</span>
        </>
      ) : (
        <div className="file-chip">
          <span className="material-symbols-outlined">description</span>
          <span className="file-name">{fileName}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        hidden
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}
