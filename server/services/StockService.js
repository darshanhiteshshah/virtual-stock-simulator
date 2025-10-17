// services/stockService.js - YAHOO FINANCE ONLY (NO MOCK FALLBACK)

const yahooFinance = require('yahoo-finance2').default;

// Stock templates - ONLY for metadata (name, sector)
const stockTemplates = [
    { symbol: '3MINDIA', name: '3M India', sector: 'Conglomerate' },
    { symbol: 'ABB', name: 'A B B', sector: 'Infrastructure' },
    { symbol: 'ABBOTINDIA', name: 'Abbott India', sector: 'Pharmaceuticals' },
    { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', sector: 'Conglomerate' },
    { symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd.', sector: 'Energy' },
    { symbol: 'ADANIPORTS', name: 'Adani Ports and SEZ Ltd.', sector: 'Infrastructure' },
    { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', sector: 'FMCG' },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', sector: 'Financial Services' },
    { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd.', sector: 'Automotive' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', sector: 'Financial Services' },
    { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', sector: 'Financial Services' },
    { symbol: 'BANKBARODA', name: 'Bank of Baroda', sector: 'Financial Services' },
    { symbol: 'BEL', name: 'Bharat Electronics Ltd.', sector: 'Defence' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', sector: 'Telecommunication' },
    { symbol: 'BPCL', name: 'Bharat Petroleum Corp. Ltd.', sector: 'Energy' },
    { symbol: 'BRITANNIA', name: 'Britannia Inds.', sector: 'FMCG' },
    { symbol: 'CIPLA', name: 'Cipla Ltd.', sector: 'Pharmaceuticals' },
    { symbol: 'COALINDIA', name: 'Coal India', sector: 'Energy' },
    { symbol: 'CUMMINSIND', name: 'Cummins India Ltd.', sector: 'Engineering' },
    { symbol: 'DLF', name: 'DLF Ltd.', sector: 'Real Estate' },
    { symbol: 'DIVISLAB', name: "Divi's Laboratories Ltd.", sector: 'Pharmaceuticals' },
    { symbol: 'DRREDDY', name: "Dr. Reddy's Labs Ltd.", sector: 'Pharmaceuticals' },
    { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd.', sector: 'Automotive' },
    { symbol: 'GODREJCP', name: 'Godrej Consumer Products Ltd.', sector: 'FMCG' },
    { symbol: 'GRASIM', name: 'Grasim Industries Ltd.', sector: 'Conglomerate' },
    { symbol: 'HAVELLS', name: 'Havells India Ltd.', sector: 'Electronics' },
    { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', sector: 'Information Technology' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Financial Services' },
    { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Co. Ltd.', sector: 'Financial Services' },
    { symbol: 'HDFCAMC', name: 'HDFC Asset Management Co. Ltd.', sector: 'Financial Services' },
    { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd.', sector: 'Automotive' },
    { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd.', sector: 'Metals' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', sector: 'FMCG' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', sector: 'Financial Services' },
    { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank Ltd.', sector: 'Financial Services' },
    { symbol: 'INDHOTEL', name: 'Indian Hotels Co.', sector: 'Hospitality' },
    { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd.', sector: 'Financial Services' },
    { symbol: 'INFY', name: 'Infosys', sector: 'Information Technology' },
    { symbol: 'IOC', name: 'Indian Oil Corporation Ltd.', sector: 'Energy' },
    { symbol: 'INFOEDGE', name: 'Info Edge (India) Ltd.', sector: 'Internet' },
    { symbol: 'ITC', name: 'ITC Ltd.', sector: 'FMCG' },
    { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd.', sector: 'Metals' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', sector: 'Financial Services' },
    { symbol: 'LIC', name: 'Life Insurance Corporation of India', sector: 'Insurance' },
    { symbol: 'LUPIN', name: 'Lupin Ltd.', sector: 'Pharmaceuticals' },
    { symbol: 'LT', name: 'Larsen & Toubro Ltd.', sector: 'Infrastructure' },
    { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', sector: 'Automotive' },
    { symbol: 'MARICO', name: 'Marico Ltd.', sector: 'FMCG' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', sector: 'Automotive' },
    { symbol: 'MCDOWELL-N', name: 'United Spirits Ltd.', sector: 'Beverages' },
    { symbol: 'MRF', name: 'MRF Ltd.', sector: 'Automotive' },
    { symbol: 'NESTLEIND', name: 'Nestle India', sector: 'FMCG' },
    { symbol: 'NTPC', name: 'NTPC Ltd.', sector: 'Energy' },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corp. Ltd.', sector: 'Energy' },
    { symbol: 'PFC', name: 'Power Finance Corporation Ltd.', sector: 'Finance' },
    { symbol: 'PIDILITE', name: 'Pidilite Industries Ltd.', sector: 'Chemicals' },
    { symbol: 'PNB', name: 'Punjab National Bank', sector: 'Financial Services' },
    { symbol: 'POWERGRID', name: 'Power Grid Corp. of India Ltd.', sector: 'Energy' },
    { symbol: 'PERSISTENT', name: 'Persistent Systems Ltd.', sector: 'Information Technology' },
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Conglomerate' },
    { symbol: 'SBILIFE', name: 'SBI Life Insurance Co. Ltd.', sector: 'Financial Services' },
    { symbol: 'SBIN', name: 'State Bank of India', sector: 'Financial Services' },
    { symbol: 'SHREECEM', name: 'Shree Cement Ltd.', sector: 'Infrastructure' },
    { symbol: 'SRF', name: 'SRF Ltd.', sector: 'Chemicals' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Inds. Ltd.', sector: 'Pharmaceuticals' },
    { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd.', sector: 'FMCG' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', sector: 'Automotive' },
    { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', sector: 'Metals' },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', sector: 'Information Technology' },
    { symbol: 'TECHM', name: 'Tech Mahindra Ltd.', sector: 'Information Technology' },
    { symbol: 'TITAN', name: 'Titan Company Ltd.', sector: 'FMCG' },
    { symbol: 'TRENT', name: 'Trent Ltd.', sector: 'Retail' },
    { symbol: 'TUBEINVEST', name: 'Tube Investments of India Ltd.', sector: 'Engineering' },
    { symbol: 'TVSMOTOR', name: 'TVS Motor Co. Ltd.', sector: 'Automotive' },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', sector: 'Infrastructure' },
    { symbol: 'VARUNBEV', name: 'Varun Beverages Ltd.', sector: 'Beverages' },
    { symbol: 'VEDANTA', name: 'Vedanta Ltd.', sector: 'Metals' },
    { symbol: 'WIPRO', name: 'Wipro Ltd.', sector: 'Information Technology' },
    { symbol: 'YESBANK', name: 'Yes Bank Ltd.', sector: 'Financial Services' },
].sort((a, b) => a.name.localeCompare(b.name));

// Configuration
console.log('════════════════════════════════════════════');
console.log('📊 STOCK SERVICE - YAHOO FINANCE ONLY');
console.log('════════════════════════════════════════════');
console.log('🔥 NO MOCK FALLBACK - Pure Yahoo Finance BSE data');
console.log('════════════════════════════════════════════\n');

const CACHE_DURATION = 60000; // 1 minute

// Cache
const priceCache = new Map();
const historyCache = new Map();

// Helper: Convert to Yahoo BSE symbol format
const getYahooSymbol = (symbol) => {
    return `${symbol}.BO`;
};

// Helper: Check cache validity
const isCacheValid = (cacheKey, cacheMap) => {
    const cached = cacheMap.get(cacheKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_DURATION;
};

// Helper: Find sector from template
function findSectorFromTemplate(symbol) {
    const template = stockTemplates.find(t => t.symbol === symbol);
    return template ? template.sector : 'Other';
}

// Fetch live quote from Yahoo Finance (BSE) - NO FALLBACK
async function fetchLiveQuote(symbol) {
    const cacheKey = `quote:${symbol}`;
    
    // Return cached data if valid
    if (isCacheValid(cacheKey, priceCache)) {
        const cached = priceCache.get(cacheKey).data;
        console.log(`💾 Using cached data for ${symbol}`);
        return cached;
    }

    try {
        const yahooSymbol = getYahooSymbol(symbol);
        console.log(`📡 Fetching LIVE BSE data for ${yahooSymbol}...`);
        
        const quote = await yahooFinance.quote(yahooSymbol);
        
        if (!quote || !quote.regularMarketPrice) {
            throw new Error(`No price data available for ${symbol}`);
        }

        const data = {
            name: quote.longName || quote.shortName || symbol,
            price: parseFloat((quote.regularMarketPrice).toFixed(2)),
            previousClose: parseFloat((quote.regularMarketPreviousClose || quote.regularMarketPrice).toFixed(2)),
            volume: quote.regularMarketVolume || 0,
            week52High: parseFloat((quote.fiftyTwoWeekHigh || 0).toFixed(2)),
            week52Low: parseFloat((quote.fiftyTwoWeekLow || 0).toFixed(2)),
            marketCap: quote.marketCap ? parseFloat((quote.marketCap / 10000000).toFixed(2)) : 0, // Crores
            peRatio: quote.trailingPE ? parseFloat(quote.trailingPE.toFixed(2)) : 'N/A',
            sector: quote.sector || findSectorFromTemplate(symbol),
            open: parseFloat((quote.regularMarketOpen || quote.regularMarketPrice).toFixed(2)),
            high: parseFloat((quote.regularMarketDayHigh || quote.regularMarketPrice).toFixed(2)),
            low: parseFloat((quote.regularMarketDayLow || quote.regularMarketPrice).toFixed(2)),
            change: parseFloat((quote.regularMarketChange || 0).toFixed(2)),
            changePercent: parseFloat((quote.regularMarketChangePercent || 0).toFixed(2)),
            exchange: 'BSE',
            lastUpdated: new Date().toISOString()
        };

        priceCache.set(cacheKey, { data, timestamp: Date.now() });
        console.log(`✅ Successfully fetched ${symbol} from BSE at ₹${data.price}`);
        return data;
    } catch (error) {
        console.error(`❌ Failed to fetch Yahoo data for ${symbol}:`, error.message);
        // NO FALLBACK - Throw error
        throw new Error(`Unable to fetch live data for ${symbol} from Yahoo Finance BSE. ${error.message}`);
    }
}

// Fetch historical data from Yahoo Finance (BSE) - NO FALLBACK
async function fetchLiveHistory(symbol, days = 30) {
    const cacheKey = `history:${symbol}:${days}`;
    
    if (isCacheValid(cacheKey, historyCache)) {
        return historyCache.get(cacheKey).data;
    }

    try {
        const yahooSymbol = getYahooSymbol(symbol);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        console.log(`📊 Fetching BSE history for ${yahooSymbol} (${days} days)...`);

        const history = await yahooFinance.historical(yahooSymbol, {
            period1: startDate,
            period2: endDate,
            interval: '1d'
        });

        if (!history || history.length === 0) {
            throw new Error(`No historical data available for ${symbol}`);
        }

        const data = history.map(item => ({
            date: item.date.toISOString().split('T')[0],
            open: parseFloat(item.open.toFixed(2)),
            high: parseFloat(item.high.toFixed(2)),
            low: parseFloat(item.low.toFixed(2)),
            close: parseFloat(item.close.toFixed(2)),
            volume: item.volume
        }));

        historyCache.set(cacheKey, { data, timestamp: Date.now() });
        console.log(`✅ Successfully fetched ${data.length} days of history for ${symbol}`);
        return data;
    } catch (error) {
        console.error(`❌ Failed to fetch Yahoo history for ${symbol}:`, error.message);
        // NO FALLBACK - Throw error
        throw new Error(`Unable to fetch historical data for ${symbol} from Yahoo Finance BSE. ${error.message}`);
    }
}

// Get single stock data - YAHOO ONLY
async function getMockStockData(symbol) {
    return await fetchLiveQuote(symbol);
}

// Get all stock data with rate limiting - YAHOO ONLY
async function getAllStockData() {
    const symbols = stockTemplates.map(t => t.symbol);
    
    console.log(`🔄 Fetching live BSE data for ${symbols.length} stocks from Yahoo Finance...`);
    
    // Fetch in batches to respect rate limits
    const BATCH_SIZE = 5;
    const BATCH_DELAY = 1000; // 1 second between batches
    const results = [];
    const errors = [];
    
    for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
        const batch = symbols.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(symbols.length / BATCH_SIZE);
        
        console.log(`📦 Processing batch ${batchNumber}/${totalBatches}: ${batch.join(', ')}`);
        
        const batchPromises = batch.map(async (symbol) => {
            try {
                const data = await getMockStockData(symbol);
                return { symbol, ...data };
            } catch (error) {
                console.error(`⚠️  Failed to fetch ${symbol}: ${error.message}`);
                errors.push({ symbol, error: error.message });
                return null; // Return null for failed fetches
            }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.filter(Boolean)); // Filter out nulls
        
        // Delay between batches
        if (i + BATCH_SIZE < symbols.length) {
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
    }
    
    console.log(`✅ Completed: ${results.length}/${symbols.length} stocks fetched successfully`);
    if (errors.length > 0) {
        console.log(`⚠️  ${errors.length} stocks failed to fetch`);
    }
    
    return results;
}

// Get historical data - YAHOO ONLY
async function getHistoryForSymbol(symbol, days = 30) {
    return await fetchLiveHistory(symbol, days);
}

// Get available stocks list
function getAvailableStocks() {
    return stockTemplates.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector
    }));
}

// Search stocks
function searchStocks(query) {
    const lowerQuery = query.toLowerCase();
    return stockTemplates
        .filter(stock => 
            stock.symbol.toLowerCase().includes(lowerQuery) ||
            stock.name.toLowerCase().includes(lowerQuery)
        )
        .map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            sector: stock.sector
        }));
}

// Screen stocks by filters
async function screenStocks(filters) {
    const { sector, minMarketCap, maxMarketCap, minPeRatio, maxPeRatio } = filters;
    
    // Start with templates for sector filtering
    let filteredTemplates = stockTemplates;

    if (sector) {
        filteredTemplates = filteredTemplates.filter(stock => stock.sector === sector);
    }

    // Fetch live data for filtered symbols
    console.log(`🔍 Screening ${filteredTemplates.length} stocks with filters...`);
    
    const stockPromises = filteredTemplates.map(template => 
        getMockStockData(template.symbol)
            .then(data => ({
                symbol: template.symbol,
                name: template.name,
                sector: template.sector,
                ...data
            }))
            .catch(err => {
                console.error(`⚠️  Error fetching ${template.symbol}:`, err.message);
                return null;
            })
    );

    let allStocks = await Promise.all(stockPromises);
    allStocks = allStocks.filter(Boolean); // Remove nulls

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

    return allStocks;
}

// Clear cache
function clearCache() {
    priceCache.clear();
    historyCache.clear();
    console.log('📦 Cache cleared');
}

// Get stock profile (includes quote + history)
async function getStockProfile(symbol) {
    try {
        const [quote, history] = await Promise.all([
            getMockStockData(symbol),
            getHistoryForSymbol(symbol)
        ]);

        return {
            profile: { symbol, ...quote },
            history: history,
            news: [] // Add news service if needed
        };
    } catch (error) {
        console.error(`Error fetching profile for ${symbol}:`, error.message);
        throw error;
    }
}

// Export
module.exports = {
    getMockStockData,
    getAllStockData,
    getAvailableStocks,
    getHistoryForSymbol,
    searchStocks,
    screenStocks,
    clearCache,
    getStockProfile,
    stockTemplates
};
