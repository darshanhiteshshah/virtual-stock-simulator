import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" },
});

export const fetchSentimentData = (token) => {
    return apiClient.get("/sentiment", { headers: { Authorization: `Bearer ${token}` } });
};
