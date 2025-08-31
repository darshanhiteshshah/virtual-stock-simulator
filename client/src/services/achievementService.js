import axios from "axios";

const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/achievements`,
    headers: { "Content-Type": "application/json" },
});

export const fetchAchievements = (token) => {
    return apiClient.get("/", { headers: { Authorization: `Bearer ${token}` } });
};
