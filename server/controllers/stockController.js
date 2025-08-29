const { getMockStockData, getAvailableStocks,getHistoryForSymbol,getAllStockData } = require("../utils/mockStockService");
const { getNewsForSymbol } = require("../utils/newsService"); 
/**
 * Controller to get the live price for a single stock symbol.
 */
exports.getStockPrice = async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const stockData = getMockStockData(symbol);

        if (!stockData) {
            return res.status(404).json({ message: `Stock symbol '${symbol}' not found.` });
        }
        
        res.json(stockData);
    } catch (error) {
        console.error("Error in getStockPrice controller:", error.message);
        res.status(500).json({ message: "Server error fetching stock data" });
    }
};

/**
 * Controller to get a list of all available stocks for the dropdown.
 */
exports.getAllStocks = async (req, res) => {
    try {
        const stockList = getAvailableStocks();
        res.json(stockList);
    } catch (error) {
        console.error("Error in getAllStocks controller:", error.message);
        res.status(500).json({ message: "Server error fetching stock list" });
    }
};

/**
 * NEW: Controller to get live prices for multiple stock symbols at once.
 * This is used for the stock ticker.
 */
exports.getMultipleStockPrices = async (req, res) => {
    try {
        // Expects an array of symbols in the request body, e.g., { symbols: ['TCS', 'RELIANCE'] }
        const { symbols } = req.body;

        if (!symbols || !Array.isArray(symbols)) {
            return res.status(400).json({ message: "Request body must be an array of symbols." });
        }

        const prices = symbols.map(symbol => getMockStockData(symbol)).filter(Boolean); // filter(Boolean) removes any nulls for symbols not found

        res.json(prices);
    } catch (error) {
        console.error("Error in getMultipleStockPrices controller:", error.message);
        res.status(500).json({ message: "Server error fetching multiple stock prices" });
    }
};

exports.getStockHistory = async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const history = getHistoryForSymbol(symbol);

        if (!history) {
            return res.status(404).json({ message: `Historical data for '${symbol}' not found.` });
        }
        
        res.json(history);
    } catch (error) {
        console.error("Error in getStockHistory controller:", error.message);
        res.status(500).json({ message: "Server error fetching stock history" });
    }
};


exports.screenStocks = async (req, res) => {
    try {
        const { sector, minMarketCap, maxMarketCap, minPeRatio, maxPeRatio } = req.body;
        let allStocks = getAllStockData();

        // Apply filters if they are provided
        if (sector) {
            allStocks = allStocks.filter(stock => stock.sector === sector);
        }
        if (minMarketCap) {
            allStocks = allStocks.filter(stock => stock.marketCap >= Number(minMarketCap));
        }
        if (maxMarketCap) {
            allStocks = allStocks.filter(stock => stock.marketCap <= Number(maxMarketCap));
        }
        if (minPeRatio) {
            allStocks = allStocks.filter(stock => stock.peRatio >= Number(minPeRatio));
        }
        if (maxPeRatio) {
            allStocks = allStocks.filter(stock => stock.peRatio <= Number(maxPeRatio));
        }

        res.json(allStocks);
    } catch (error) {
        console.error("Error in screenStocks controller:", error.message);
        res.status(500).json({ message: "Server error during stock screening" });
    }
};

// --- NEW FUNCTION ---
// @desc    Get a full profile for a single stock
// @route   GET /api/stocks/profile/:symbol
exports.getStockProfile = async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();

        const stockData = getMockStockData(symbol);
        if (!stockData) {
            return res.status(404).json({ message: "Stock not found." });
        }

        const history = getHistoryForSymbol(symbol);
        const news = getNewsForSymbol(symbol);

        res.json({
            profile: stockData,
            history: history,
            news: news,
        });
    } catch (error) {
        console.error("Error in getStockProfile controller:", error.message);
        res.status(500).json({ message: "Server error fetching stock profile" });
    }
};