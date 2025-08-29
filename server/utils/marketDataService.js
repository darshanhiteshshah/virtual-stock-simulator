const axios = require('axios');
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';
const { getNewsForSymbol } = require("./newsService"); // For combining news into profiles

/**
 * Transforms raw Alpha Vantage quote data into our application's format.
 */
const transformQuoteData = (quote, symbol) => {
    if (!quote || Object.keys(quote).length === 0) {
        console.warn(`No quote data for symbol: ${symbol}. API limit may be reached.`);
        return null;
    }
    return {
        symbol: quote['01. symbol'],
        name: symbol, // The GLOBAL_QUOTE endpoint doesn't include the full name
        price: parseFloat(quote['05. price']),
        volume: parseInt(quote['06. volume']),
        previousClose: parseFloat(quote['08. previous close']),
        // Note: Other details like marketCap, peRatio, etc., require a separate API call (function=OVERVIEW)
    };
};

/**
 * Fetches the latest quote for a single stock symbol.
 */
const fetchLiveStockData = async (symbol) => {
    try {
        // Appending .BSE for Bombay Stock Exchange symbols as an example
        const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}.BSE&apikey=${API_KEY}`;
        const response = await axios.get(url);
        return transformQuoteData(response.data['Global Quote'], symbol);
    } catch (error) {
        console.error(`Error fetching live data for ${symbol}:`, error.message);
        return null;
    }
};

/**
 * Fetches historical daily data for a stock.
 */
const fetchStockHistory = async (symbol) => {
    try {
        const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}.BSE&apikey=${API_KEY}`;
        const response = await axios.get(url);
        const timeSeries = response.data['Time Series (Daily)'];

        if (!timeSeries) return [];

        return Object.entries(timeSeries).map(([date, values]) => ({
            date,
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            close: parseFloat(values['4. close']),
        }));
    } catch (error) {
        console.error(`Error fetching history for ${symbol}:`, error.message);
        return [];
    }
};

/**
 * ✅ NEW: Fetches live prices for multiple stock symbols concurrently.
 * This is the efficient function for the leaderboard and background jobs.
 */
const fetchMultipleLivePrices = async (symbols) => {
    if (!symbols || symbols.length === 0) return [];
    
    // Use Promise.all to make all API calls in parallel for maximum speed
    const pricePromises = symbols.map(symbol => fetchLiveStockData(symbol));
    const results = await Promise.all(pricePromises);

    // Filter out any results that may have failed (e.g., due to API limits or invalid symbols)
    return results.filter(Boolean);
};

/**
 * ✅ NEW: Fetches all necessary data for the stock profile page.
 */
const fetchStockProfile = async (symbol) => {
    // Fetch live data and historical data concurrently
    const [profile, history] = await Promise.all([
        fetchLiveStockData(symbol),
        fetchStockHistory(symbol),
    ]);

    if (!profile) return null;

    // We can still use our mock news service for this part
    const news = getNewsForSymbol(symbol);

    return {
        profile,
        history,
        news,
    };
};


module.exports = {
    fetchLiveStockData,
    fetchStockHistory,
    fetchMultipleLivePrices,
    fetchStockProfile,
};