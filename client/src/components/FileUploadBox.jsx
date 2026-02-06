export default function FileUploadBox({ onFileSelect }) {
  return (
    <input
      type="file"
      accept=".pdf,.doc,.docx"
      onChange={(e) => onFileSelect(e.target.files[0])}
    />
  );
}
