import axios from "axios";

const apiClient = axios.create({
    baseURL: "process.env.REACT_APP_API_URL/api/achievements",
    headers: { "Content-Type": "application/json" },
});

export const fetchAchievements = (token) => {
    return apiClient.get("/", { headers: { Authorization: `Bearer ${token}` } });
};
