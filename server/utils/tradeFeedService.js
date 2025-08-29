// This is an in-memory store for the most recent trades.
// In a production app, this might be handled by a more robust system like Redis.
const recentTrades = [];
const MAX_FEED_ITEMS = 15; // We will only show the latest 15 trades

/**
 * Adds a new trade to the feed.
 * @param {object} trade - An object containing trade details.
 */
const addTradeToFeed = (trade) => {
    const feedItem = {
        symbol: trade.symbol,
        quantity: trade.quantity,
        price: trade.price,
        type: trade.type,
        timestamp: new Date(),
    };

    // Add the new trade to the beginning of the array
    recentTrades.unshift(feedItem);

    // If the feed is too long, remove the oldest item
    if (recentTrades.length > MAX_FEED_ITEMS) {
        recentTrades.pop();
    }
};

/**
 * Gets the current list of recent trades.
 * @returns {Array}
 */
const getTradeFeed = () => {
    return recentTrades;
};

module.exports = { addTradeToFeed, getTradeFeed };
