import { apiFetch } from "../api/api";

export const analyzeMatch = (resumeId, jobDescription) =>
  apiFetch("/match/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeId, jobDescription }),
  });

export const matchWithApplication = (applicationId) =>
  apiFetch(`/match/application/${applicationId}`, {
    method: "POST",
  });
