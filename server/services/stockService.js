// services/stockService.js - YAHOO FINANCE ONLY (NO MOCK FALLBACK)

const yahooFinance = require('yahoo-finance2').default;

// Stock templates - ONLY for metadata (name, sector)
const stockTemplates = [
    // Current 79 stocks (keeping all)
    { symbol: '3MINDIA', name: '3M India', sector: 'Conglomerate' },
    { symbol: 'ABB', name: 'ABB India', sector: 'Infrastructure' },
    { symbol: 'ABBOTINDIA', name: 'Abbott India', sector: 'Pharmaceuticals' },
    { symbol: 'ADANIENT', name: 'Adani Enterprises', sector: 'Conglomerate' },
    { symbol: 'ADANIGREEN', name: 'Adani Green Energy', sector: 'Energy' },
    { symbol: 'ADANIPORTS', name: 'Adani Ports and SEZ', sector: 'Infrastructure' },
    { symbol: 'ASIANPAINT', name: 'Asian Paints', sector: 'FMCG' },
    { symbol: 'AXISBANK', name: 'Axis Bank', sector: 'Financial Services' },
    { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto', sector: 'Automotive' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'Financial Services' },
    { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv', sector: 'Financial Services' },
    { symbol: 'BANKBARODA', name: 'Bank of Baroda', sector: 'Financial Services' },
    { symbol: 'BEL', name: 'Bharat Electronics', sector: 'Defence' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecommunication' },
    { symbol: 'BPCL', name: 'Bharat Petroleum', sector: 'Energy' },
    { symbol: 'BRITANNIA', name: 'Britannia Industries', sector: 'FMCG' },
    { symbol: 'CIPLA', name: 'Cipla', sector: 'Pharmaceuticals' },
    { symbol: 'COALINDIA', name: 'Coal India', sector: 'Energy' },
    { symbol: 'CUMMINSIND', name: 'Cummins India', sector: 'Engineering' },
    { symbol: 'DLF', name: 'DLF Ltd.', sector: 'Real Estate' },
    { symbol: 'DIVISLAB', name: "Divi's Laboratories", sector: 'Pharmaceuticals' },
    { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories", sector: 'Pharmaceuticals' },
    { symbol: 'EICHERMOT', name: 'Eicher Motors', sector: 'Automotive' },
    { symbol: 'GODREJCP', name: 'Godrej Consumer Products', sector: 'FMCG' },
    { symbol: 'GRASIM', name: 'Grasim Industries', sector: 'Conglomerate' },
    { symbol: 'HAVELLS', name: 'Havells India', sector: 'Electronics' },
    { symbol: 'HCLTECH', name: 'HCL Technologies', sector: 'Information Technology' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Financial Services' },
    { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance', sector: 'Financial Services' },
    { symbol: 'HDFCAMC', name: 'HDFC Asset Management', sector: 'Financial Services' },
    { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp', sector: 'Automotive' },
    { symbol: 'HINDALCO', name: 'Hindalco Industries', sector: 'Metals' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'FMCG' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Financial Services' },
    { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank', sector: 'Financial Services' },
    { symbol: 'INDHOTEL', name: 'Indian Hotels Co.', sector: 'Hospitality' },
    { symbol: 'INDUSINDBK', name: 'IndusInd Bank', sector: 'Financial Services' },
    { symbol: 'INFY', name: 'Infosys', sector: 'Information Technology' },
    { symbol: 'IOC', name: 'Indian Oil Corporation', sector: 'Energy' },
    { symbol: 'ITC', name: 'ITC Ltd.', sector: 'FMCG' },
    { symbol: 'JSWSTEEL', name: 'JSW Steel', sector: 'Metals' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Financial Services' },
    { symbol: 'LUPIN', name: 'Lupin', sector: 'Pharmaceuticals' },
    { symbol: 'LT', name: 'Larsen & Toubro', sector: 'Infrastructure' },
    { symbol: 'M&M', name: 'Mahindra & Mahindra', sector: 'Automotive' },
    { symbol: 'MARICO', name: 'Marico', sector: 'FMCG' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India', sector: 'Automotive' },
    { symbol: 'MRF', name: 'MRF Ltd.', sector: 'Automotive' },
    { symbol: 'NESTLEIND', name: 'Nestle India', sector: 'FMCG' },
    { symbol: 'NTPC', name: 'NTPC Ltd.', sector: 'Energy' },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', sector: 'Energy' },
    { symbol: 'PFC', name: 'Power Finance Corporation', sector: 'Finance' },
    { symbol: 'PNB', name: 'Punjab National Bank', sector: 'Financial Services' },
    { symbol: 'POWERGRID', name: 'Power Grid Corp of India', sector: 'Energy' },
    { symbol: 'PERSISTENT', name: 'Persistent Systems', sector: 'Information Technology' },
    { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Conglomerate' },
    { symbol: 'SBILIFE', name: 'SBI Life Insurance', sector: 'Financial Services' },
    { symbol: 'SBIN', name: 'State Bank of India', sector: 'Financial Services' },
    { symbol: 'SHREECEM', name: 'Shree Cement', sector: 'Infrastructure' },
    { symbol: 'SRF', name: 'SRF Ltd.', sector: 'Chemicals' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'Pharmaceuticals' },
    { symbol: 'TATACONSUM', name: 'Tata Consumer Products', sector: 'FMCG' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Automotive' },
    { symbol: 'TATASTEEL', name: 'Tata Steel', sector: 'Metals' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Information Technology' },
    { symbol: 'TECHM', name: 'Tech Mahindra', sector: 'Information Technology' },
    { symbol: 'TITAN', name: 'Titan Company', sector: 'FMCG' },
    { symbol: 'TRENT', name: 'Trent Ltd.', sector: 'Retail' },
    { symbol: 'TVSMOTOR', name: 'TVS Motor Co.', sector: 'Automotive' },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', sector: 'Infrastructure' },
    { symbol: 'WIPRO', name: 'Wipro', sector: 'Information Technology' },
    { symbol: 'YESBANK', name: 'Yes Bank', sector: 'Financial Services' },
    
    // Additional 71 popular BSE stocks
    { symbol: 'ACC', name: 'ACC Ltd.', sector: 'Infrastructure' },
    { symbol: 'ADANIPOWER', name: 'Adani Power', sector: 'Energy' },
    { symbol: 'AMARAJABAT', name: 'Amara Raja Batteries', sector: 'Automotive' },
    { symbol: 'AMBUJACEM', name: 'Ambuja Cements', sector: 'Infrastructure' },
    { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals', sector: 'Healthcare' },
    { symbol: 'APOLLOTYRE', name: 'Apollo Tyres', sector: 'Automotive' },
    { symbol: 'ASHOKLEY', name: 'Ashok Leyland', sector: 'Automotive' },
    { symbol: 'ASTRAL', name: 'Astral Ltd.', sector: 'Infrastructure' },
    { symbol: 'ATUL', name: 'Atul Ltd.', sector: 'Chemicals' },
    { symbol: 'AUROPHARMA', name: 'Aurobindo Pharma', sector: 'Pharmaceuticals' },
    { symbol: 'BANDHANBNK', name: 'Bandhan Bank', sector: 'Financial Services' },
    { symbol: 'BANKOFIND', name: 'Bank of India', sector: 'Financial Services' },
    { symbol: 'BATAINDIA', name: 'Bata India', sector: 'Retail' },
    { symbol: 'BERGEPAINT', name: 'Berger Paints', sector: 'FMCG' },
    { symbol: 'BHARATFORG', name: 'Bharat Forge', sector: 'Engineering' },
    { symbol: 'BIOCON', name: 'Biocon', sector: 'Pharmaceuticals' },
    { symbol: 'BOSCHLTD', name: 'Bosch Ltd.', sector: 'Automotive' },
    { symbol: 'CADILAHC', name: 'Cadila Healthcare', sector: 'Pharmaceuticals' },
    { symbol: 'CANBK', name: 'Canara Bank', sector: 'Financial Services' },
    { symbol: 'CHOLAFIN', name: 'Cholamandalam Finance', sector: 'Financial Services' },
    { symbol: 'COLPAL', name: 'Colgate Palmolive', sector: 'FMCG' },
    { symbol: 'CONCOR', name: 'Container Corporation', sector: 'Logistics' },
    { symbol: 'COROMANDEL', name: 'Coromandel International', sector: 'Chemicals' },
    { symbol: 'DABUR', name: 'Dabur India', sector: 'FMCG' },
    { symbol: 'DEEPAKNTR', name: 'Deepak Nitrite', sector: 'Chemicals' },
    { symbol: 'DIXON', name: 'Dixon Technologies', sector: 'Electronics' },
    { symbol: 'ESCORTS', name: 'Escorts Ltd.', sector: 'Automotive' },
    { symbol: 'EXIDEIND', name: 'Exide Industries', sector: 'Automotive' },
    { symbol: 'FEDERALBNK', name: 'Federal Bank', sector: 'Financial Services' },
    { symbol: 'GAIL', name: 'GAIL India', sector: 'Energy' },
    { symbol: 'GLENMARK', name: 'Glenmark Pharma', sector: 'Pharmaceuticals' },
    { symbol: 'GMRINFRA', name: 'GMR Infrastructure', sector: 'Infrastructure' },
    { symbol: 'GODREJPROP', name: 'Godrej Properties', sector: 'Real Estate' },
    { symbol: 'GUJGASLTD', name: 'Gujarat Gas', sector: 'Energy' },
    { symbol: 'HAL', name: 'Hindustan Aeronautics', sector: 'Defence' },
    { symbol: 'HINDPETRO', name: 'Hindustan Petroleum', sector: 'Energy' },
    { symbol: 'HINDZINC', name: 'Hindustan Zinc', sector: 'Metals' },
    { symbol: 'IDEA', name: 'Vodafone Idea', sector: 'Telecommunication' },
    { symbol: 'INDIGO', name: 'InterGlobe Aviation', sector: 'Aviation' },
    { symbol: 'INDUSTOWER', name: 'Indus Towers', sector: 'Telecommunication' },
    { symbol: 'IGL', name: 'Indraprastha Gas', sector: 'Energy' },
    { symbol: 'IPCALAB', name: 'IPCA Laboratories', sector: 'Pharmaceuticals' },
    { symbol: 'IRCTC', name: 'IRCTC', sector: 'Transportation' },
    { symbol: 'JINDALSTEL', name: 'Jindal Steel & Power', sector: 'Metals' },
    { symbol: 'JUBLFOOD', name: 'Jubilant Foodworks', sector: 'Retail' },
    { symbol: 'L&TFH', name: 'L&T Finance Holdings', sector: 'Financial Services' },
    { symbol: 'LICHSGFIN', name: 'LIC Housing Finance', sector: 'Financial Services' },
    { symbol: 'LTIM', name: 'LTIMindtree', sector: 'Information Technology' },
    { symbol: 'LTTS', name: 'L&T Technology Services', sector: 'Information Technology' },
    { symbol: 'MANAPPURAM', name: 'Manappuram Finance', sector: 'Financial Services' },
    { symbol: 'MFSL', name: 'Max Financial Services', sector: 'Financial Services' },
    { symbol: 'MOTHERSON', name: 'Samvardhana Motherson', sector: 'Automotive' },
    { symbol: 'MPHASIS', name: 'MPhasis', sector: 'Information Technology' },
    { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance', sector: 'Financial Services' },
    { symbol: 'NATIONALUM', name: 'National Aluminium', sector: 'Metals' },
    { symbol: 'NAUKRI', name: 'Info Edge India', sector: 'Internet' },
    { symbol: 'NMDC', name: 'NMDC Ltd.', sector: 'Metals' },
    { symbol: 'OBEROIRLTY', name: 'Oberoi Realty', sector: 'Real Estate' },
    { symbol: 'OFSS', name: 'Oracle Financial Services', sector: 'Information Technology' },
    { symbol: 'OIL', name: 'Oil India', sector: 'Energy' },
    { symbol: 'PAGEIND', name: 'Page Industries', sector: 'Retail' },
    { symbol: 'PEL', name: 'Piramal Enterprises', sector: 'Financial Services' },
    { symbol: 'PETRONET', name: 'Petronet LNG', sector: 'Energy' },
    { symbol: 'PIIND', name: 'PI Industries', sector: 'Chemicals' },
    { symbol: 'PVR', name: 'PVR Ltd.', sector: 'Entertainment' },
    { symbol: 'RAMCOCEM', name: 'Ramco Cements', sector: 'Infrastructure' },
    { symbol: 'RECLTD', name: 'REC Ltd.', sector: 'Financial Services' },
    { symbol: 'SAIL', name: 'Steel Authority of India', sector: 'Metals' },
    { symbol: 'SIEMENS', name: 'Siemens', sector: 'Engineering' },
    { symbol: 'SOLARINDS', name: 'Solar Industries', sector: 'Chemicals' },
    { symbol: 'TORNTPHARM', name: 'Torrent Pharma', sector: 'Pharmaceuticals' },
    { symbol: 'UBL', name: 'United Breweries', sector: 'Beverages' },
    { symbol: 'UPL', name: 'UPL Ltd.', sector: 'Chemicals' },
    { symbol: 'VOLTAS', name: 'Voltas', sector: 'Electronics' },
    { symbol: 'WHIRLPOOL', name: 'Whirlpool of India', sector: 'Electronics' },
    { symbol: 'ZEEL', name: 'Zee Entertainment', sector: 'Media' },
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
// Fetch historical data from Yahoo Finance (BSE) - NO FALLBACK
async function fetchLiveHistory(symbol, period = '1mo') {
    // Convert period string to days
    const periodToDays = {
        '1d': 1,
        '5d': 5,
        '1mo': 30,
        '3mo': 90,
        '6mo': 180,
        '1y': 365,
        '2y': 730,
        '5y': 1825
    };
    
    const days = periodToDays[period] || 30; // Default to 30 days
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
            period1: startDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
            period2: endDate.toISOString().split('T')[0],   // Format: YYYY-MM-DD
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
