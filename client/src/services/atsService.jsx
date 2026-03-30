const API_BASE_URL = "http://localhost:5000/api";

// No auth needed — public endpoint
export const checkATS = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await fetch(`${API_BASE_URL}/ats/check`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "ATS check failed");
  }

  return response.json();
};
