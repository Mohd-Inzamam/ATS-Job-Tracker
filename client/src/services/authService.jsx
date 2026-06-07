import { apiFetch } from "../api/api";

export const loginService = (data) =>
  apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const registerService = (data) =>
  apiFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const getUserProfileService = () => apiFetch("/auth/getProfile");

export const resendVerificationEmail = (email) =>
  apiFetch("/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

export const changePasswordService = ({ currentPassword, newPassword }) =>
  apiFetch("/auth/change-password", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const deleteAccountService = () =>
  apiFetch("/auth/account", { method: "DELETE" });
