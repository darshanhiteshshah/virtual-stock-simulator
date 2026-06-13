// server/services/stockService.js
const axios = require("axios");

console.log("upstox service loaded...");

// ==========================
// CONFIG
// ==========================
// const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
// const BASE_URL = "https://www.alphavantage.co/query";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// map your symbols → instrument keys
const instrumentMap = {
    RELIANCE: "NSE_EQ|INE002A01018",
    TCS: "NSE_EQ|INE467B01029",
    INFY: "NSE_EQ|INE009A01021",
    HDFCBANK: "NSE_EQ|INE040A01034",
    ICICIBANK: "NSE_EQ|INE090A01021",
    ITC: "NSE_EQ|INE154A01025",
    SBIN: "NSE_EQ|INE062A01020",
    AXISBANK: "NSE_EQ|INE238A01034",
    LT: "NSE_EQ|INE018A01030",
    TATAMOTORS: "NSE_EQ|INE155A01022",


    // 🔥 ADD THESE (your missing ones)
    BRITANNIA: "NSE_EQ|INE216A01030",
    BAJAJFINSV: "NSE_EQ|INE918I01026",
    BHARTIARTL: "NSE_EQ|INE397D01024",
    BEL: "NSE_EQ|INE263A01024",
    "3MINDIA": "NSE_EQ|INE470A01017",
    BANKBARODA: "NSE_EQ|INE028A01039",
    ATUL: "NSE_EQ|INE100A01010",
    SUNPHARMA: "NSE_EQ|INE044A01036",
    KOTAKBANK: "NSE_EQ|INE237A01028",
    HINDUNILVR: "NSE_EQ|INE030A01027",
    "BAJAJ-AUTO": "NSE_EQ|INE917I01010",
    ULTRACEMCO: "NSE_EQ|INE481G01011",
    TITAN: "NSE_EQ|INE280A01028",
    HAL: "NSE_EQ|INE066F01012",
    PAGEIND: "NSE_EQ|INE761H01022",
    DIVISLAB: "NSE_EQ|INE361B01024",
    LUPIN: "NSE_EQ|INE326A01037",
    ASHOKLEY: "NSE_EQ|INE208A01029",
    ADANIGREEN: "NSE_EQ|INE364U01010",
    ADANIENT: "NSE_EQ|INE423A01024",
    ACC: "NSE_EQ|INE012A01025"
};
// Cache (to avoid rate limit)
const CACHE_DURATION = 60 * 1000; // 1 minute
const priceCache = new Map();
const historyCache = new Map();

// ==========================
// STOCK MASTER LIST
// ==========================
const stockTemplates = [
    { symbol: "RELIANCE", name: "Reliance Industries", sector: "Conglomerate" },
    { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT" },
    { symbol: "INFY", name: "Infosys", sector: "IT" },
    { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking" },
    { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking" },
    { symbol: "ITC", name: "ITC Ltd", sector: "FMCG" },
    { symbol: "SBIN", name: "State Bank of India", sector: "Banking" },
    { symbol: "AXISBANK", name: "Axis Bank", sector: "Banking" },
    { symbol: "LT", name: "Larsen & Toubro", sector: "Infrastructure" },
    { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Automotive" }
];

// ==========================
// UTIL HELPERS
// ==========================
const isCacheValid = (cache, key) => {
    const cached = cache.get(key);
    return cached && Date.now() - cached.timestamp < CACHE_DURATION;
};

const getStockMeta = (symbol) => {
    return stockTemplates.find(s => s.symbol === symbol) || {
        symbol,
        name: symbol,
        sector: "Other"
    };
};

// ==========================
// LIVE PRICE (Alpha Vantage)
// ==========================
// async function fetchLiveQuote(symbol) {
//     const cacheKey = `price:${symbol}`;

//     if (isCacheValid(priceCache, cacheKey)) {
//         return priceCache.get(cacheKey).data;
//     }

//     try {
//         const response = await axios.get(BASE_URL, {
//             params: {
//                 function: "GLOBAL_QUOTE",
//                 symbol: `${symbol}.BSE`,
//                 apikey: ALPHA_VANTAGE_KEY
//             }
//         });

//         const quote = response.data["Global Quote"];
//         if (!quote || !quote["05. price"]) {
//             throw new Error("Invalid Alpha Vantage response");
//         }

//         const meta = getStockMeta(symbol);

//         const stockData = {
//             symbol,
//             name: meta.name,
//             sector: meta.sector,
//             exchange: "BSE",
//             price: parseFloat(quote["05. price"]),
//             changePercent: parseFloat(quote["10. change percent"] || "0"),
//             volume: parseInt(quote["06. volume"] || "0"),
//             source: "ALPHA_VANTAGE",
//             lastUpdated: new Date().toISOString()
//         };

//         priceCache.set(cacheKey, {
//             data: stockData,
//             timestamp: Date.now()
//         });

//         return stockData;

//     } catch (err) {
//         console.error(`❌ Alpha Vantage price error for ${symbol}:`, err.message);

//         // SAFE FALLBACK (never crash app)
//         return {
//             symbol,
//             name: symbol,
//             sector: "Other",
//             exchange: "BSE",
//             price: 1000,
//             changePercent: 0,
//             volume: 0,
//             source: "FALLBACK"
//         };
//     }
// }
async function fetchLiveQuote(symbol) {

    const cacheKey = `price:${symbol}`;

    if (isCacheValid(priceCache, cacheKey)) {
        return priceCache.get(cacheKey).data;
    }

    try {
        const instrumentKey = instrumentMap[symbol];

        if (!instrumentKey) {
            throw new Error("Invalid symbol");
        }

        const response = await axios.get(
            `https://api.upstox.com/v2/market-quote/ltp?instrument_key=${instrumentKey}`,
            {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${ACCESS_TOKEN}`
                }
            }
        );

        const data = response.data.data;
        const stock = Object.values(data)[0];

        const meta = getStockMeta(symbol);

        const stockData = {
            symbol,
            name: meta.name,
            sector: meta.sector,
            exchange: "NSE",
            price: stock.last_price,
            changePercent: 0, // Upstox LTP doesn’t give this directly
            volume: 0,
            source: "UPSTOX",
            lastUpdated: new Date().toISOString()
        };

        priceCache.set(cacheKey, {
            data: stockData,
            timestamp: Date.now()
        });

        return stockData;

    } catch (err) {
        console.error(`❌ Upstox error for ${symbol}:`, err.message);

        return {
            symbol,
            name: symbol,
            sector: "Other",
            exchange: "NSE",
            price: 1000,
            changePercent: 0,
            volume: 0,
            source: "FALLBACK"
        };
    }
}
// ==========================
// HISTORICAL DATA (Backtest)
// ==========================
// async function getHistoryForSymbol(symbol, period = "1y") {
//     const cacheKey = `history:${symbol}`;

//     if (isCacheValid(historyCache, cacheKey)) {
//         return historyCache.get(cacheKey).data;
//     }

//     try {
//         const response = await axios.get(BASE_URL, {
//             params: {
//                 function: "TIME_SERIES_DAILY_ADJUSTED",
//                 symbol: `${symbol}.BSE`,
//                 outputsize: "compact",
//                 apikey: ALPHA_VANTAGE_KEY
//             }
//         });

//         const series = response.data["Time Series (Daily)"];
//         if (!series) {
//             throw new Error("No historical data");
//         }

//         const history = Object.entries(series)
//             .map(([date, d]) => ({
//                 date,
//                 open: parseFloat(d["1. open"]),
//                 high: parseFloat(d["2. high"]),
//                 low: parseFloat(d["3. low"]),
//                 close: parseFloat(d["4. close"]),
//                 volume: parseInt(d["6. volume"])
//             }))
//             .reverse();

//         historyCache.set(cacheKey, {
//             data: history,
//             timestamp: Date.now()
//         });

//         return history;

//     } catch (err) {
//         console.error(`❌ Alpha Vantage history error for ${symbol}:`, err.message);
//         return [];
//     }
// }
async function getHistoryForSymbol(symbol, interval = "day") {

    const cacheKey = `history:${symbol}`;

    if (isCacheValid(historyCache, cacheKey)) {
        return historyCache.get(cacheKey).data;
    }

    try {

        const instrumentKey = instrumentMap[symbol];

        if (!instrumentKey) {
            throw new Error("Invalid symbol");
        }

        const response = await axios.get(
            `https://api.upstox.com/v2/historical-candle/${instrumentKey}/${interval}/2026-06-13/2025-06-13`,
            {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${ACCESS_TOKEN}`
                }
            }
        );

        const candles = response.data.data.candles || [];

        const history = candles.map(candle => ({
            date: candle[0],
            open: candle[1],
            high: candle[2],
            low: candle[3],
            close: candle[4],
            volume: candle[5]
        }));

        historyCache.set(cacheKey, {
            data: history,
            timestamp: Date.now()
        });

        return history;

    } catch (err) {

        console.error(`❌ Upstox history error for ${symbol}:`, err.message);

        return [];
    }
}

// ==========================
// PUBLIC SERVICE FUNCTIONS
// ==========================
async function getMockStockData(symbol) {
    return await fetchLiveQuote(symbol);
}

async function getAllStockData() {
    const results = [];
    for (const stock of stockTemplates) {
        const data = await fetchLiveQuote(stock.symbol);
        results.push(data);
        await new Promise(r => setTimeout(r, 1200)); // rate-limit safe
    }
    return results;
}

function getAvailableStocks() {
    return stockTemplates;
}

function searchStocks(query) {
    const q = query.toLowerCase();
    return stockTemplates.filter(
        s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
}

function clearCache() {
    priceCache.clear();
    historyCache.clear();
    console.log("🗑️ Stock cache cleared");
}

// ==========================
// EXPORTS (VERY IMPORTANT)
// ==========================
module.exports = {
    getMockStockData,
    getAllStockData,
    getAvailableStocks,
    searchStocks,
    clearCache,
    getHistoryForSymbol,
    stockTemplates
};
