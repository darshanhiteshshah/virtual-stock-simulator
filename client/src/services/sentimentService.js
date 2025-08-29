import axios from "axios";

const apiClient = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api`,
    headers: { "Content-Type": "application/json" },
});

export const fetchSentimentData = (token) => {
    return apiClient.get("/sentiment", { headers: { Authorization: `Bearer ${token}` } });
};
