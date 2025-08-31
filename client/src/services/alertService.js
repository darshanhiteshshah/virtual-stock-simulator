import axios from "axios";

const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/alerts`,
    headers: { "Content-Type": "application/json" },
});

export const getAlerts = (token) => {
    return apiClient.get("/", { headers: { Authorization: `Bearer ${token}` } });
};

export const createAlert = (alertData, token) => {
    return apiClient.post("/", alertData, { headers: { Authorization: `Bearer ${token}` } });
};

export const deleteAlert = (alertId, token) => {
    return apiClient.delete(`/${alertId}`, { headers: { Authorization: `Bearer ${token}` } });
};
