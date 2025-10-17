const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

const getMLPrediction = async (symbol, daysAhead = 7) => {
    try {
        console.log(`🤖 ML prediction for ${symbol}`);
        
        const cleanSymbol = symbol.replace('.BO', '').toUpperCase();
        
        const response = await axios.post(`${ML_SERVICE_URL}/predict`, {
            symbol: cleanSymbol,
            days: daysAhead
        }, {
            timeout: 30000
        });
        
        if (!response.data.success) {
            throw new Error(response.data.error);
        }
        
        console.log(`✅ Prediction: ₹${response.data.summary.predicted_price}`);
        return response.data;
        
    } catch (error) {
        console.error('❌ ML error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            return {
                success: false,
                error: 'ML service unavailable',
                fallback: true
            };
        }
        
        throw error;
    }
};

const checkMLServiceHealth = async () => {
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/health`, {
            timeout: 5000
        });
        return response.data.status === 'healthy';
    } catch (error) {
        return false;
    }
};

module.exports = {
    getMLPrediction,
    checkMLServiceHealth
};
