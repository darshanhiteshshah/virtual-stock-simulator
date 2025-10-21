

/**
 * Fetch recent market news
 * @param {number} limit - Number of articles to fetch (default: 10)
 */
export const fetchMarketNews = async (limit = 10) => {
    try {
        const response = await apiClient.get(`/news?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching market news:', error);
        throw error;
    }
};

/**
 * Fetch news for specific stock symbol
 * @param {string} symbol - Stock symbol (e.g., 'RELIANCE')
 * @param {number} limit - Number of articles to fetch (default: 5)
 */
export const fetchStockNews = async (symbol, limit = 5) => {
    try {
        const response = await apiClient.get(`/news/${symbol}?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error);
        throw error;
    }
};

/**
 * Check if news service is configured on backend
 */
export const fetchNewsStatus = async () => {
    try {
        const response = await apiClient.get('/news/status');
        return response.data;
    } catch (error) {
        console.error('Error checking news service status:', error);
        throw error;
    }
};
