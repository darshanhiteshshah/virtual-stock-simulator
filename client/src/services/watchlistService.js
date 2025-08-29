import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:5000/api/watchlist",
    headers: { "Content-Type": "application/json" },
});

export const getWatchlist = (token) => {
    return apiClient.get("/", { headers: { Authorization: `Bearer ${token}` } });
};

export const addToWatchlist = (symbol, token) => {
    return apiClient.post("/add", { symbol }, { headers: { Authorization: `Bearer ${token}` } });
};

export const removeFromWatchlist = (symbol, token) => {
    return apiClient.post("/remove", { symbol }, { headers: { Authorization: `Bearer ${token}` } });
};
