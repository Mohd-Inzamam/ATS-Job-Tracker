const API_BASE_URL = 'http://localhost:5000/api';

export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    let res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: token ? `Bearer ${token}` : undefined,
            "x-refresh-token": refreshToken ? `Bearer ${refreshToken}` : undefined
        }
    });

    // If access token expired
    if (res.status === 401 && refreshToken) {
        console.log("Access token expired. Attempting refresh...");

        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "x-refresh-token": `Bearer ${refreshToken}`
            }
        });

        if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            localStorage.setItem("token", refreshData.token);

            // Retry original request with new token
            res = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    Authorization: `Bearer ${refreshData.token}`
                }
            });
        } else {
            // Refresh failed → logout
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/";
            throw new Error("Session expired");
        }
    }

    if (!res.ok) throw new Error("API Error");

    return res.json();
}

// export async function apiFetch(endpoint, options = {}) {
//     const token = localStorage.getItem("token");
//     const refreshToken = localStorage.getItem("refreshToken");

//     const res = await fetch(`${API_BASE_URL}${endpoint}`, {
//         ...options,
//         headers: {
//             ...(options.headers || {}),
//             Authorization: token ? `Bearer ${token}` : undefined,
//             "x-refresh-token": refreshToken ? `Bearer ${refreshToken}` : undefined
//         }
//     });


//     if (!res.ok) throw new Error("API Error");
//     return res.json();
// }

export const checkATS = async (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    const response = await fetch(`${API_BASE_URL}/ats/check`, {
        method: "POST",
        body: formData,
    });
    return response.json();
};

export const uploadResume = async (file, label) => {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("label", label);

    const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
        method: "POST",
        body: formData,
        credentials: "include", // IMPORTANT (JWT cookie)
    });

    return response.json();
};