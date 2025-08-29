import axios from "axios";

// Create a reusable Axios instance with a predefined base URL.
const apiClient = axios.create({
    baseURL: "process.env.REACT_APP_API_URL/api",
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Sends a request to the backend to buy a specified quantity of a stock.
 * @param {string} symbol - The stock ticker symbol.
 * @param {number} quantity - The number of shares to buy.
 * @param {string} token - The user's authentication JWT.
 * @returns {Promise<object>} A promise that resolves to the server's response data.
 */
export const buyStock = async (symbol, quantity, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        // The request is made to '/trade/buy' which is appended to the baseURL.
        const response = await apiClient.post("/trade/buy", { symbol, quantity }, config);
        return response.data;
    } catch (error) {
        console.error("Error buying stock:", error);
        throw error;
    }
};

/**
 * Sends a request to the backend to sell a specified quantity of a stock.
 * @param {string} symbol - The stock ticker symbol.
 * @param {number} quantity - The number of shares to sell.
 * @param {string} token - The user's authentication JWT.
 * @returns {Promise<object>} A promise that resolves to the server's response data.
 */
export const sellStock = async (symbol, quantity, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        // The request is made to '/trade/sell' which is appended to the baseURL.
        const response = await apiClient.post("/trade/sell", { symbol, quantity }, config);
        return response.data;
    } catch (error) {
        console.error("Error selling stock:", error);
        throw error;
    }
};


export const placeOrder = async (orderData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await apiClient.post("/trade/place-order", orderData, config);
    return response.data;
};

export const getPendingOrders = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await apiClient.get("/trade/pending-orders", config);
    return response.data;
};

export const cancelOrder = async (orderId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await apiClient.delete(`/trade/cancel-order/${orderId}`, config);
    return response.data;
};