const API_BASE_URL = 'http://localhost:5000/api';

export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    // Build headers conditionally — never send "undefined" as a value
    const headers = { ...(options.headers || {}) };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (refreshToken) headers["x-refresh-token"] = `Bearer ${refreshToken}`;

    let res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    // Access token expired — attempt refresh
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
            const retryHeaders = { ...(options.headers || {}) };
            retryHeaders["Authorization"] = `Bearer ${refreshData.token}`;

            res = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: retryHeaders
            });
        } else {
            // Refresh failed → force logout
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/";
            throw new Error("Session expired");
        }
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "API Error");
    }

    return res.json();
}
