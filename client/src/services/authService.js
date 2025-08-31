import axios from "axios";

// Create a reusable Axios instance with a predefined base URL.
// This makes the code cleaner and easier to update if the API URL changes.
const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/auth`,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Registers a new user.
 * @param {object} userData - The user's registration data (username, email, password).
 * @returns {Promise} - The Axios promise for the request.
 */
export const registerUser = (userData) => {
    return apiClient.post("/register", userData);
};

/**
 * Logs in an existing user.
 * @param {object} credentials - The user's login credentials (username, password).
 * @returns {Promise} - The Axios promise for the request.
 */
export const loginUser = (credentials) => {
    return apiClient.post("/login", credentials);
};
