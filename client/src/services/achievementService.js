import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:5000/api/achievements",
    headers: { "Content-Type": "application/json" },
});

export const fetchAchievements = (token) => {
    return apiClient.get("/", { headers: { Authorization: `Bearer ${token}` } });
};
