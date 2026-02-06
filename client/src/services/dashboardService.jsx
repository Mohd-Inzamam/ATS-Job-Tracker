import { apiFetch } from "../api/api";

export const getDashboardMetrics = async () => {
  const [resumes, applications] = await Promise.all([
    apiFetch("/resumes"),
    apiFetch("/applications"),
  ]);

  const avgScore = resumes.length
    ? Math.round(
        resumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / resumes.length,
      )
    : null;

  return {
    resumeCount: resumes.length,
    applicationCount: applications.length,
    avgScore,
  };
};
