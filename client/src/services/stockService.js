import axios from "axios";

// Create a reusable Axios instance with a predefined base URL for all API calls.
const apiClient = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" },
});

/**
 * Fetches the live price and details for a specific stock symbol from the backend.
 * @param {string} symbol - The stock ticker symbol.
 * @param {string} token - The user's authentication JWT.
 * @returns {Promise<object>} A promise that resolves to the stock data.
 */
export const fetchStockPrice = async (symbol, token) => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await apiClient.get(`/stocks/price/${symbol}`, config);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch stock price for ${symbol}:`, error);
        throw error;
    }
};

/**
 * Fetches the list of all available stocks for the dropdown menu.
 * @param {string} token - The user's authentication JWT.
 * @returns {Promise<Array>} A promise that resolves to the list of stocks.
 */
export const fetchAllStocks = async (token) => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await apiClient.get("/stocks", config); 
        // Ensure we return response.data, which is the array of stocks.
        return response.data;
    } catch (error) {
        console.error("Failed to fetch all stocks:", error);
        throw error;
    }
};

/**
 * Fetches live prices for a list of stock symbols, used for the ticker.
 * @param {string[]} symbols - An array of stock ticker symbols.
 * @param {string} token - The user's authentication JWT.
 * @returns {Promise<Array>} A promise that resolves to the list of stocks with prices.
 */
export const fetchMultipleStockPrices = async (symbols, token) => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await apiClient.post("/stocks/prices", { symbols }, config);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch multiple stock prices:", error);
        throw error;
    }
};

/**
 * Fetches 30-day historical price data for a stock.
 * @param {string} symbol - The stock ticker symbol.
 * @param {string} token - The user's authentication JWT.
 * @returns {Promise<Array>} A promise that resolves to the historical data.
 */
export const fetchStockHistory = async (symbol, token) => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await apiClient.get(`/stocks/history/${symbol}`, config);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch stock history for ${symbol}:`, error);
        throw error;
    }
};


// ... (existing functions)

// --- NEW FUNCTION ---
/**
 * Fetches a list of stocks based on filter criteria.
 * @param {object} filters - The filter criteria (sector, marketCap, etc.).
 * @param {string} token - The user's authentication JWT.
 * @returns {Promise<Array>} A promise that resolves to the filtered list of stocks.
 */
export const screenStocks = async (filters, token) => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await apiClient.post("/stocks/screener", filters, config);
        return response.data;
    } catch (error) {
        console.error("Failed to screen stocks:", error);
        throw error;
    }
};

// ... (existing functions)

// --- NEW FUNCTION ---
/**
 * Fetches the full profile for a single stock.
 * @param {string} symbol - The stock ticker symbol.
 * @param {string} token - The user's authentication JWT.
 * @returns {Promise<object>} A promise that resolves to the stock's full profile data.
 */
export const fetchStockProfile = async (symbol, token) => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await apiClient.get(`/stocks/profile/${symbol}`, config);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch stock profile for ${symbol}:`, error);
        throw error;
    }
};
