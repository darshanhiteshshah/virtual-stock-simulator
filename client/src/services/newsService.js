import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" },
});

export const fetchNews = (token) => {
    return apiClient.get("/news", { headers: { Authorization: `Bearer ${token}` } });
};
