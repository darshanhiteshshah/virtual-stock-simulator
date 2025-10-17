import axios from "axios";

// Create a reusable Axios instance
const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate", // Force no cache
        "Pragma": "no-cache",
        "Expires": "0"
    },
});

/**
 * Fetches the live price and details for a specific stock symbol
 */
export const fetchStockPrice = async (symbol, token) => {
    try {
        const config = { 
            headers: { 
                Authorization: `Bearer ${token}`,
                "Cache-Control": "no-cache"
            },
            params: { _t: Date.now() } // Cache buster
        };
        const response = await apiClient.get(`/stocks/price/${symbol}`, config);
        
        console.log(`📡 Fetched ${symbol}:`, response.data.price, response.data.exchange);
        
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch stock price for ${symbol}:`, error);
        throw error;
    }
};

/**
 * Fetches the list of all available stocks
 */
export const fetchAllStocks = async (token) => {
    try {
        const config = { 
            headers: { 
                Authorization: `Bearer ${token}`,
                "Cache-Control": "no-cache"
            },
            params: { _t: Date.now() } // Cache buster
        };
        
        console.log('📡 Fetching all stocks from:', `${import.meta.env.VITE_API_URL}/api/stocks`);
        
        const response = await apiClient.get("/stocks", config);
        
        console.log('✅ Received stocks:', response.data?.length);
        if (response.data?.[0]) {
            console.log('First stock exchange:', response.data[0].exchange);
        }
        
        return response.data;
    } catch (error) {
        console.error("Failed to fetch all stocks:", error);
        throw error;
    }
};

/**
 * Fetches live prices for multiple stock symbols
 */
export const fetchMultipleStockPrices = async (symbols, token) => {
    try {
        const config = { 
            headers: { 
                Authorization: `Bearer ${token}`,
                "Cache-Control": "no-cache"
            } 
        };
        const response = await apiClient.post("/stocks/prices", { symbols }, config);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch multiple stock prices:", error);
        throw error;
    }
};

/**
 * Fetches 30-day historical price data
 */
export const fetchStockHistory = async (symbol, token, period = '1mo') => {
    try {
        const config = { 
            headers: { 
                Authorization: `Bearer ${token}`,
                "Cache-Control": "no-cache"
            },
            params: { period, _t: Date.now() }
        };
        const response = await apiClient.get(`/stocks/history/${symbol}`, config);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch stock history for ${symbol}:`, error);
        throw error;
    }
};

/**
 * Screen stocks by filters
 */
export const screenStocks = async (filters, token) => {
    try {
        const config = { 
            headers: { 
                Authorization: `Bearer ${token}`,
                "Cache-Control": "no-cache"
            } 
        };
        const response = await apiClient.post("/stocks/screener", filters, config);
        return response.data;
    } catch (error) {
        console.error("Failed to screen stocks:", error);
        throw error;
    }
};

/**
 * Fetch full stock profile
 */
export const fetchStockProfile = async (symbol, token) => {
    try {
        const config = { 
            headers: { 
                Authorization: `Bearer ${token}`,
                "Cache-Control": "no-cache"
            },
            params: { _t: Date.now() }
        };
        const response = await apiClient.get(`/stocks/profile/${symbol}`, config);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch stock profile for ${symbol}:`, error);
        throw error;
    }
};

export default apiClient;
