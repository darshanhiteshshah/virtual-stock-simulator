import axios from "axios";

// Create a reusable Axios instance with a predefined base URL.
const apiClient = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Fetches the transaction history for the logged-in user.
 * @param {string} token - The user's authentication JWT.
 * @returns {Promise<object>} A promise that resolves to the server's response data containing the transactions.
 */
export const fetchTransactions = (token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        // The request is made to '/transactions' which is appended to the baseURL.
        return apiClient.get("/transactions", config);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw error;
    }
};
