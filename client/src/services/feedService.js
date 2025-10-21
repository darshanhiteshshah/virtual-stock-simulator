import axios from "axios";

const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: { "Content-Type": "application/json" },
});

// Trade Feed APIs
export const fetchTradeFeed = (limit = 15) => {
    return apiClient.get(`/feed?limit=${limit}`);
};

export const fetchTradeFeedStats = () => {
    return apiClient.get("/feed/stats");
};

// Export apiClient for other uses
export default apiClient;
