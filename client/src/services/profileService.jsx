import { apiFetch } from "../api/api";

export const updateProfile = (data) =>
  apiFetch("/auth/updateProfile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
