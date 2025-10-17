import axios from "axios";

// Create a reusable Axios instance with predefined base URL
const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000, // 30 second timeout
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
    (config) => {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
    },
    (error) => {
        if (error.response) {
            console.error(`❌ ${error.response.status} - ${error.response.data?.message || error.message}`);
        } else if (error.request) {
            console.error('❌ No response received:', error.message);
        } else {
            console.error('❌ Request error:', error.message);
        }
        return Promise.reject(error);
    }
);

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
        
        console.log(`🛒 Buying ${quantity} shares of ${symbol}...`);
        
        const response = await apiClient.post("/trade/buy", { symbol, quantity }, config);
        
        console.log(`✅ Successfully bought ${quantity} shares of ${symbol}`);
        console.log('Transaction:', response.data);
        
        return response.data;
    } catch (error) {
        console.error(`❌ Error buying ${symbol}:`, error.response?.data || error.message);
        
        // Throw user-friendly error message
        const errorMessage = error.response?.data?.message || error.message || 'Failed to buy stock';
        throw new Error(errorMessage);
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
        
        console.log(`💰 Selling ${quantity} shares of ${symbol}...`);
        
        const response = await apiClient.post("/trade/sell", { symbol, quantity }, config);
        
        console.log(`✅ Successfully sold ${quantity} shares of ${symbol}`);
        console.log('Transaction:', response.data);
        
        return response.data;
    } catch (error) {
        console.error(`❌ Error selling ${symbol}:`, error.response?.data || error.message);
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to sell stock';
        throw new Error(errorMessage);
    }
};

/**
 * Places a limit/stop order for a stock
 * @param {object} orderData - Order details (symbol, quantity, type, price, etc.)
 * @param {string} token - The user's authentication JWT
 * @returns {Promise<object>} The placed order details
 */
export const placeOrder = async (orderData, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        
        console.log(`📝 Placing ${orderData.orderType} order for ${orderData.symbol}:`, orderData);
        
        const response = await apiClient.post("/trade/place-order", orderData, config);
        
        console.log('✅ Order placed successfully:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('❌ Error placing order:', error.response?.data || error.message);
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to place order';
        throw new Error(errorMessage);
    }
};

/**
 * Gets all pending orders for the current user
 * @param {string} token - The user's authentication JWT
 * @returns {Promise<Array>} Array of pending orders
 */
export const getPendingOrders = async (token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        
        console.log('📋 Fetching pending orders...');
        
        const response = await apiClient.get("/trade/pending-orders", config);
        
        console.log(`✅ Retrieved ${response.data.length || 0} pending orders`);
        
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching pending orders:', error.response?.data || error.message);
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch pending orders';
        throw new Error(errorMessage);
    }
};

/**
 * Cancels a pending order
 * @param {string} orderId - The ID of the order to cancel
 * @param {string} token - The user's authentication JWT
 * @returns {Promise<object>} Cancellation confirmation
 */
export const cancelOrder = async (orderId, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        
        console.log(`🚫 Cancelling order ${orderId}...`);
        
        const response = await apiClient.delete(`/trade/cancel-order/${orderId}`, config);
        
        console.log('✅ Order cancelled successfully');
        
        return response.data;
    } catch (error) {
        console.error(`❌ Error cancelling order ${orderId}:`, error.response?.data || error.message);
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel order';
        throw new Error(errorMessage);
    }
};

/**
 * Gets trade history for the current user
 * @param {string} token - The user's authentication JWT
 * @param {object} filters - Optional filters (startDate, endDate, symbol)
 * @returns {Promise<Array>} Array of completed trades
 */
export const getTradeHistory = async (token, filters = {}) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: filters,
        };
        
        console.log('📜 Fetching trade history...', filters);
        
        const response = await apiClient.get("/trade/history", config);
        
        console.log(`✅ Retrieved ${response.data.length || 0} trades`);
        
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching trade history:', error.response?.data || error.message);
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch trade history';
        throw new Error(errorMessage);
    }
};

/**
 * Validates if user can buy a stock (checks wallet balance)
 * @param {string} symbol - Stock symbol
 * @param {number} quantity - Number of shares
 * @param {number} price - Current stock price
 * @param {string} token - JWT token
 * @returns {Promise<object>} Validation result
 */
export const validateBuyOrder = async (symbol, quantity, price, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        
        const response = await apiClient.post(
            "/trade/validate-buy", 
            { symbol, quantity, price }, 
            config
        );
        
        return response.data;
    } catch (error) {
        console.error('❌ Validation error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Validation failed');
    }
};

/**
 * Validates if user can sell a stock (checks holdings)
 * @param {string} symbol - Stock symbol
 * @param {number} quantity - Number of shares
 * @param {string} token - JWT token
 * @returns {Promise<object>} Validation result
 */
export const validateSellOrder = async (symbol, quantity, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        
        const response = await apiClient.post(
            "/trade/validate-sell", 
            { symbol, quantity }, 
            config
        );
        
        return response.data;
    } catch (error) {
        console.error('❌ Validation error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Validation failed');
    }
};

export default apiClient;
