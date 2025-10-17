// controllers/stockController.js
const { 
    getMockStockData, 
    getAllStockData, 
    getHistoryForSymbol,
    getAvailableStocks,
    stockTemplates 
} = require("../services/stockService.js");
const { getNewsForSymbol } = require("../utils/newsService");

/**
 * @desc    Get live price for a single stock symbol
 * @route   GET /api/stocks/price/:symbol
 * @access  Private
 */
exports.getStockPrice = async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const stockData = await getMockStockData(symbol);

        if (!stockData) {
            return res.status(404).json({ 
                message: `Stock symbol '${symbol}' not found.` 
            });
        }
        
        res.json({
            symbol,
            ...stockData
        });
    } catch (error) {
        console.error("Error in getStockPrice controller:", error.message);
        res.status(500).json({ 
            message: "Server error fetching stock data",
            error: error.message 
        });
    }
};

/**
 * @desc    Get list of all available stocks (for dropdown)
 * @route   GET /api/stocks
 * @access  Private
 */
exports.getAllStocks = async (req, res) => {
    try {
        // Returns full stock data with live prices
        const stocks = await getAllStockData();
        res.json(stocks);
    } catch (error) {
        console.error("Error in getAllStocks controller:", error.message);
        res.status(500).json({ 
            message: "Server error fetching stock list",
            error: error.message 
        });
    }
};

/**
 * @desc    Get live prices for multiple stock symbols at once (for ticker)
 * @route   POST /api/stocks/prices
 * @access  Private
 * @body    { symbols: ['TCS', 'RELIANCE', 'INFY'] }
 */
exports.getMultipleStockPrices = async (req, res) => {
    try {
        const { symbols } = req.body;

        if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
            return res.status(400).json({ 
                message: "Request body must contain an array of symbols." 
            });
        }

        // Fetch all symbols in parallel
        const promises = symbols.map(symbol => 
            getMockStockData(symbol.toUpperCase())
                .then(data => data ? { symbol: symbol.toUpperCase(), ...data } : null)
                .catch(err => {
                    console.error(`Error fetching ${symbol}:`, err.message);
                    return null;
                })
        );

        const results = await Promise.all(promises);
        
        // Filter out null values (failed fetches)
        const prices = results.filter(Boolean);

        res.json(prices);
    } catch (error) {
        console.error("Error in getMultipleStockPrices controller:", error.message);
        res.status(500).json({ 
            message: "Server error fetching multiple stock prices",
            error: error.message 
        });
    }
};

/**
 * @desc    Get historical OHLC data for charts
 * @route   GET /api/stocks/history/:symbol?period=1mo
 * @access  Private
 */
exports.getStockHistory = async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const { period = '1mo' } = req.query;
        
        const history = await getHistoryForSymbol(symbol, period);

        if (!history || history.length === 0) {
            return res.status(404).json({ 
                message: `Historical data for '${symbol}' not found.` 
            });
        }
        
        res.json(history);
    } catch (error) {
        console.error("Error in getStockHistory controller:", error.message);
        res.status(500).json({ 
            message: "Server error fetching stock history",
            error: error.message 
        });
    }
};

/**
 * @desc    Screen stocks by filters (sector, market cap, P/E ratio)
 * @route   POST /api/stocks/screener
 * @access  Private
 * @body    { sector, minMarketCap, maxMarketCap, minPeRatio, maxPeRatio }
 */
exports.screenStocks = async (req, res) => {
    try {
        const { sector, minMarketCap, maxMarketCap, minPeRatio, maxPeRatio } = req.body;

        // Start with templates for sector filtering
        let filteredTemplates = stockTemplates;

        // Filter by sector first (no API call needed)
        if (sector) {
            filteredTemplates = filteredTemplates.filter(stock => stock.sector === sector);
        }

        // Fetch live data for filtered symbols
        const stockPromises = filteredTemplates.map(template => 
            getMockStockData(template.symbol)
                .then(data => ({
                    symbol: template.symbol,
                    name: template.name,
                    sector: template.sector,
                    ...data
                }))
                .catch(err => {
                    console.error(`Error fetching ${template.symbol}:`, err.message);
                    return null;
                })
        );

        let allStocks = await Promise.all(stockPromises);
        allStocks = allStocks.filter(Boolean); // Remove null values

        // Apply market cap filters
        if (minMarketCap) {
            allStocks = allStocks.filter(stock => {
                const cap = parseFloat(stock.marketCap);
                return !isNaN(cap) && cap >= Number(minMarketCap);
            });
        }
        if (maxMarketCap) {
            allStocks = allStocks.filter(stock => {
                const cap = parseFloat(stock.marketCap);
                return !isNaN(cap) && cap <= Number(maxMarketCap);
            });
        }

        // Apply P/E ratio filters
        if (minPeRatio) {
            allStocks = allStocks.filter(stock => {
                if (stock.peRatio === 'N/A') return false;
                const pe = parseFloat(stock.peRatio);
                return !isNaN(pe) && pe >= Number(minPeRatio);
            });
        }
        if (maxPeRatio) {
            allStocks = allStocks.filter(stock => {
                if (stock.peRatio === 'N/A') return false;
                const pe = parseFloat(stock.peRatio);
                return !isNaN(pe) && pe <= Number(maxPeRatio);
            });
        }

        res.json(allStocks);
    } catch (error) {
        console.error("Error in screenStocks controller:", error.message);
        res.status(500).json({ 
            message: "Server error during stock screening",
            error: error.message 
        });
    }
};

/**
 * @desc    Get full profile for a single stock (quote + history + news)
 * @route   GET /api/stocks/profile/:symbol
 * @access  Private
 */
exports.getStockProfile = async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();

        // Fetch all data in parallel for better performance
        const [stockData, history, news] = await Promise.all([
            getMockStockData(symbol),
            getHistoryForSymbol(symbol),
            Promise.resolve(getNewsForSymbol(symbol)) // Wrap in Promise.resolve if not async
        ]);

        if (!stockData) {
            return res.status(404).json({ 
                message: `Stock '${symbol}' not found.` 
            });
        }

        res.json({
            profile: {
                symbol,
                ...stockData
            },
            history: history || [],
            news: news || []
        });
    } catch (error) {
        console.error("Error in getStockProfile controller:", error.message);
        res.status(500).json({ 
            message: "Server error fetching stock profile",
            error: error.message 
        });
    }
};
