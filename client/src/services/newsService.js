import axios from "axios";

const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: { "Content-Type": "application/json" },
});

export const fetchNews = (token) => {
    return apiClient.get("/news", { headers: { Authorization: `Bearer ${token}` } });
};
