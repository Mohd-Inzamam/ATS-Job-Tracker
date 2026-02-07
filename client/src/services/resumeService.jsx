import { apiFetch } from "../api/api";

export const getResumes = () => apiFetch("/resumes");

export const uploadResume = (file, label) => {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("label", label);

  return apiFetch("/resumes", {
    method: "POST",
    body: formData,
  });
};

export const deleteResume = (id) =>
  apiFetch(`/resumes/${id}`, { method: "DELETE" });
