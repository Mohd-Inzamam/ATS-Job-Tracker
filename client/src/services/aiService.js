import { apiFetch } from "../api/api";

export const parseJD = (jobDescription) =>
  apiFetch("/ai/parse-jd", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobDescription }),
  });

export const getDashboardInsight = (data) =>
  apiFetch("/ai/dashboard-insight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
