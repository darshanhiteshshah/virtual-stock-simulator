import axios from "axios";

// Create a reusable Axios instance
const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
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
 * Get all transactions for the current user
 * @param {string} token - JWT authentication token
 * @returns {Promise<object>} Transactions data
 */
export const fetchTransactions = async (token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        console.log('📜 Fetching all transactions...');

        const response = await apiClient.get("/transactions", config);

        console.log(`✅ Retrieved ${response.data.count || response.data.transactions?.length || 0} transactions`);

        return response.data;
    } catch (error) {
        console.error('❌ Error fetching transactions:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch transactions');
    }
};

/**
 * Get a single transaction by ID
 * @param {string} transactionId - Transaction ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<object>} Transaction data
 */
export const fetchTransactionById = async (transactionId, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        console.log(`🔍 Fetching transaction ${transactionId}...`);

        const response = await apiClient.get(`/transactions/${transactionId}`, config);

        console.log('✅ Transaction retrieved');

        return response.data;
    } catch (error) {
        console.error('❌ Error fetching transaction:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch transaction');
    }
};

/**
 * Get transactions for a specific stock symbol
 * @param {string} symbol - Stock symbol (e.g., "RELIANCE")
 * @param {string} token - JWT authentication token
 * @returns {Promise<object>} Transactions data
 */
export const fetchTransactionsBySymbol = async (symbol, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        console.log(`📊 Fetching transactions for ${symbol}...`);

        const response = await apiClient.get(`/transactions/symbol/${symbol}`, config);

        console.log(`✅ Retrieved ${response.data.count || 0} ${symbol} transactions`);

        return response.data;
    } catch (error) {
        console.error('❌ Error fetching transactions by symbol:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch transactions');
    }
};

/**
 * Get transactions by type (BUY or SELL)
 * @param {string} type - Transaction type ("BUY" or "SELL")
 * @param {string} token - JWT authentication token
 * @returns {Promise<object>} Transactions data
 */
export const fetchTransactionsByType = async (type, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        console.log(`💰 Fetching ${type} transactions...`);

        const response = await apiClient.get(`/transactions/type/${type}`, config);

        console.log(`✅ Retrieved ${response.data.count || 0} ${type} transactions`);

        return response.data;
    } catch (error) {
        console.error('❌ Error fetching transactions by type:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch transactions');
    }
};

/**
 * Get transaction statistics
 * @param {string} token - JWT authentication token
 * @returns {Promise<object>} Transaction statistics
 */
export const fetchTransactionStats = async (token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        console.log('📊 Fetching transaction statistics...');

        const response = await apiClient.get("/transactions/stats", config);

        console.log('✅ Transaction stats retrieved');

        return response.data;
    } catch (error) {
        console.error('❌ Error fetching transaction stats:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch statistics');
    }
};

export default apiClient;
