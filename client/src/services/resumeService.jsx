import { apiFetch } from "../api/api";

export const getResumes = () => apiFetch("/resume");

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  return apiFetch("/resume", {
    method: "POST",
    body: formData,
  });
};

export const deleteResume = (id) =>
  apiFetch(`/resume/${id}`, { method: "DELETE" });
