import axios from "axios";

// Create a reusable Axios instance with a predefined base URL.
const apiClient = axios.create({
    baseURL: "process.env.REACT_APP_API_URL/api",
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Fetches the user's portfolio data from the server.
 * @param {string} token - The user's authentication JWT.
 * @returns {Promise<object>} A promise that resolves to the user's portfolio data.
 */
export const fetchPortfolio = (token) => {
    // The request is made to '/portfolio' which is appended to the baseURL.
    // The Authorization header is added for this specific, protected request.
    return apiClient.get("/portfolio", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
