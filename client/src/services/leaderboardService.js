import axios from "axios";

// Create a reusable Axios instance with a predefined base URL.
// This makes your service files clean and easy to manage.
const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Fetches the leaderboard data from the server.
 * This is a public route and does not require an auth token.
 * @returns {Promise<Array>} A promise that resolves to the leaderboard data.
 */
export const fetchLeaderboard = async () => {
    try {
        // The request is made to '/leaderboard' which is appended to the baseURL.
        const response = await apiClient.get("/leaderboard");
        return response.data;
    } catch (error) {
        // Log the error for debugging and re-throw it so the component can handle it.
        console.error("Failed to fetch leaderboard data:", error);
        throw error;
    }
};
