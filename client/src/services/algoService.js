import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

// Get all user algorithms
export const getAlgorithms = async (token) => {
    const response = await axios.get(`${API_URL}/api/algo`, getAuthHeader(token));
    return response.data;
};

// Get single algorithm
export const getAlgorithm = async (id, token) => {
    const response = await axios.get(`${API_URL}/api/algo/${id}`, getAuthHeader(token));
    return response.data;
};

// Create algorithm
export const createAlgorithm = async (algoData, token) => {
    const response = await axios.post(`${API_URL}/api/algo`, algoData, getAuthHeader(token));
    return response.data;
};

// Update algorithm
export const updateAlgorithm = async (id, algoData, token) => {
    const response = await axios.put(`${API_URL}/api/algo/${id}`, algoData, getAuthHeader(token));
    return response.data;
};

// Delete algorithm
export const deleteAlgorithm = async (id, token) => {
    const response = await axios.delete(`${API_URL}/api/algo/${id}`, getAuthHeader(token));
    return response.data;
};

// Run backtest
export const backtestAlgorithm = async (id, token) => {
    const response = await axios.post(`${API_URL}/api/algo/${id}/backtest`, {}, getAuthHeader(token));
    return response.data;
};

// Activate algorithm
export const activateAlgorithm = async (id, token) => {
    const response = await axios.post(`${API_URL}/api/algo/${id}/activate`, {}, getAuthHeader(token));
    return response.data;
};

// Stop algorithm
export const stopAlgorithm = async (id, token) => {
    const response = await axios.post(`${API_URL}/api/algo/${id}/stop`, {}, getAuthHeader(token));
    return response.data;
};

// Get algorithm stats
export const getAlgorithmStats = async (id, token) => {
    const response = await axios.get(`${API_URL}/api/algo/${id}/stats`, getAuthHeader(token));
    return response.data;
};

// Get strategy templates
export const getTemplates = async (token) => {
    const response = await axios.get(`${API_URL}/api/algo/templates`, getAuthHeader(token));
    return response.data;
};
