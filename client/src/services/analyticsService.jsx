import { apiFetch } from "../api/api";

export const getOverview = () => apiFetch("/analytics/overview");

export const getTrends = () => apiFetch("/analytics/trends");

export const getResumePerformance = (jobDescription) =>
  apiFetch("/analytics/resume-performance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobDescription }),
  });

export const getSuccessRate = () => apiFetch("/analytics/success-rate");
