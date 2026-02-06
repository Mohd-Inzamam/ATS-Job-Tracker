import { apiFetch } from "../api/api";

export const getResumes = () => apiFetch("/resumes");

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  return apiFetch("/resumes", {
    method: "POST",
    body: formData,
  });
};

export const deleteResume = (id) =>
  apiFetch(`/resumes/${id}`, { method: "DELETE" });
