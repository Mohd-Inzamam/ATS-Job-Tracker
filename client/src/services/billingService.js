import { apiFetch } from "../api/api";

export const activateDemoProService = () =>
  apiFetch("/billing/activate-demo", { method: "POST" });

export const cancelPlanService = () =>
  apiFetch("/billing/cancel", { method: "POST" });

export const getBillingStatusService = () => apiFetch("/billing/status");
