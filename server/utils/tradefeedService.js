// In-memory store for recent trades
// In production, use Redis or MongoDB for persistence
const recentTrades = [];
const MAX_FEED_ITEMS = 50; // Show latest 50 trades

/**
 * Adds a new trade to the feed with user info
 * @param {object} trade - Trade details
 * @param {string} username - User who made the trade
 */
const addTradeToFeed = (trade, username = 'Anonymous') => {
    const feedItem = {
        username: username || 'Anonymous',
        symbol: trade.symbol,
        quantity: trade.quantity,
        price: trade.price,
        type: trade.type,
        totalValue: (trade.quantity * trade.price).toFixed(2),
        timestamp: new Date(),
    };

    // Add to beginning (newest first)
    recentTrades.unshift(feedItem);

    // Keep only latest N trades
    if (recentTrades.length > MAX_FEED_ITEMS) {
        recentTrades.pop();
    }

    console.log(`📢 Trade added to feed: ${username} ${trade.type} ${trade.quantity} ${trade.symbol}`);
};

/**
 * Gets the current list of recent trades
 * @param {number} limit - Max number of trades to return (default: 15)
 * @returns {Array}
 */
const getTradeFeed = (limit = 15) => {
    return recentTrades.slice(0, limit);
};

/**
 * Get trade stats for analytics
 */
const getTradeFeedStats = () => {
    const buyCount = recentTrades.filter(t => t.type === 'BUY').length;
    const sellCount = recentTrades.filter(t => t.type === 'SELL').length;
    
    return {
        totalTrades: recentTrades.length,
        buyCount,
        sellCount,
        mostTradedStocks: getMostTradedStocks(),
    };
};

/**
 * Get most traded stocks
 */
const getMostTradedStocks = () => {
    const stockCounts = {};
    
    recentTrades.forEach(trade => {
        stockCounts[trade.symbol] = (stockCounts[trade.symbol] || 0) + 1;
    });
    
    return Object.entries(stockCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([symbol, count]) => ({ symbol, count }));
};

module.exports = { 
    addTradeToFeed, 
    getTradeFeed,
    getTradeFeedStats 
};
