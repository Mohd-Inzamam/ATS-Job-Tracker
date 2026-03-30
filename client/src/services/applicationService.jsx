import { apiFetch } from "../api/api";

export const getApplications = () => apiFetch("/applications");

export const createApplication = (data) =>
  apiFetch("/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const updateApplicationStatus = (id, status) =>
  apiFetch(`/applications/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

export const deleteApplication = (id) =>
  apiFetch(`/applications/${id}`, { method: "DELETE" });
