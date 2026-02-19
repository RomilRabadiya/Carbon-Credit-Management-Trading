const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const config = {
    apiBaseUrl: API_BASE_URL,
    endpoints: {
        auth: {
            login: `${API_BASE_URL}/oauth2/authorization/google`,
            logout: `${API_BASE_URL}/logout`,
        },
        geo: {
            analyze: "/api/geo/analyze", // Relative path to use proxy
        },
    },
};
