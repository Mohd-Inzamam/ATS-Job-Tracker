const API_BASE_URL = 'http://localhost:5000/api';



export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("token");


    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: token ? `Bearer ${token}` : undefined
        }
    });


    if (!res.ok) throw new Error("API Error");
    return res.json();
}

export const checkATS = async (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    const response = await fetch(`${API_BASE_URL}api/ats/check`, {
        method: "POST",
        body: formData,
    });
    return response.json();
};

export const uploadResume = async (file, label) => {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("label", label);

    const response = await fetch(`${API_BASE_URL}api/resumes/upload`, {
        method: "POST",
        body: formData,
        credentials: "include", // IMPORTANT (JWT cookie)
    });

    return response.json();
};