import axios from "axios";

const apiClient = axios.create({
    baseURL: `${import.meta.env.REACT_APP_API_URL}/api/user`,
    headers: { "Content-Type": "application/json" },
});

export const getUserProfile = (token) => {
    return apiClient.get("/profile", { headers: { Authorization: `Bearer ${token}` } });
};

export const updateUserPassword = (passwordData, token) => {
    return apiClient.put("/profile/password", passwordData, { headers: { Authorization: `Bearer ${token}` } });
};

// --- NEW FUNCTION ---
export const logoutOtherSessions = (token) => {
    return apiClient.post("/profile/logout-others", {}, { headers: { Authorization: `Bearer ${token}` } });
};

export const getPortfolioHistory = (token) => {
    return apiClient.get("/portfolio-history", { headers: { Authorization: `Bearer ${token}` } });
};