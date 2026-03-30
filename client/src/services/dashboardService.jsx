import { apiFetch } from "../api/api";

export const getDashboardMetrics = async () => {
  const [resumes, applications] = await Promise.all([
    apiFetch("/resumes"),
    apiFetch("/applications"),
  ]);

  const avgScore = null;

  return {
    resumeCount: resumes.length,
    applicationCount: applications.length,
    avgScore,
  };
};
