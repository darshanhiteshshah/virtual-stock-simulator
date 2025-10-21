const axios = require('axios');

// News API Configuration
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

// Cache configuration
const NEWS_CACHE_DURATION = 3600000; // 1 hour
const newsCache = new Map();

/**
 * Fetch news from NewsAPI
 */
async function fetchNewsFromNewsAPI(query, pageSize = 10) {
    if (!NEWS_API_KEY) {
        throw new Error('NEWS_API_KEY not configured. Get your key from https://newsapi.org/');
    }

    try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: query,
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: pageSize,
                apiKey: NEWS_API_KEY,
                domains: 'economictimes.indiatimes.com,moneycontrol.com,business-standard.com,livemint.com,reuters.com,bloomberg.com'
            },
            timeout: 10000
        });

        if (!response.data || !response.data.articles || response.data.articles.length === 0) {
            throw new Error('No articles found');
        }

        return response.data.articles.map(article => ({
            headline: article.title,
            description: article.description || article.title,
            url: article.url,
            source: article.source.name,
            publishedAt: new Date(article.publishedAt),
            imageUrl: article.urlToImage,
            author: article.author
        }));
    } catch (error) {
        console.error('❌ NewsAPI error:', error.message);
        throw error;
    }
}

/**
 * Fetch news from GNews API
 */
async function fetchNewsFromGNews(query, max = 10) {
    if (!GNEWS_API_KEY) {
        throw new Error('GNEWS_API_KEY not configured. Get your key from https://gnews.io/');
    }

    try {
        const response = await axios.get('https://gnews.io/api/v4/search', {
            params: {
                q: query,
                lang: 'en',
                country: 'in',
                max: max,
                apikey: GNEWS_API_KEY
            },
            timeout: 10000
        });

        if (!response.data || !response.data.articles || response.data.articles.length === 0) {
            throw new Error('No articles found');
        }

        return response.data.articles.map(article => ({
            headline: article.title,
            description: article.description || article.title,
            url: article.url,
            source: article.source.name,
            publishedAt: new Date(article.publishedAt),
            imageUrl: article.image,
            author: article.source.name
        }));
    } catch (error) {
        console.error('❌ GNews API error:', error.message);
        throw error;
    }
}

/**
 * Fetch Indian stock market news
 */
async function fetchIndianMarketNews(maxArticles = 10) {
    const cacheKey = 'market_news';
    
    // Check cache
    if (newsCache.has(cacheKey)) {
        const cached = newsCache.get(cacheKey);
        if (Date.now() - cached.timestamp < NEWS_CACHE_DURATION) {
            console.log('📰 Using cached market news');
            return cached.data;
        }
    }

    console.log('📡 Fetching live market news...');

    let news = null;
    let lastError = null;

    // Try NewsAPI first
    try {
        news = await fetchNewsFromNewsAPI('India stock market OR BSE OR NSE OR Sensex OR Nifty', maxArticles);
    } catch (error) {
        console.log('⚠️ NewsAPI failed:', error.message);
        lastError = error;
    }
    
    // Try GNews if NewsAPI fails
    if (!news) {
        try {
            console.log('⚠️ Trying GNews as fallback...');
            news = await fetchNewsFromGNews('India stock market OR BSE OR NSE', maxArticles);
        } catch (error) {
            console.log('⚠️ GNews failed:', error.message);
            lastError = error;
        }
    }

    // If both APIs failed, throw error
    if (!news || news.length === 0) {
        throw new Error(`Failed to fetch news from all sources. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    // Cache the results
    newsCache.set(cacheKey, {
        data: news,
        timestamp: Date.now()
    });

    console.log(`✅ Fetched ${news.length} news articles`);
    return news;
}

/**
 * Fetch news for specific stock symbol
 */
async function fetchNewsForSymbol(symbol, maxArticles = 5) {
    const cacheKey = `news_${symbol}`;
    
    // Check cache
    if (newsCache.has(cacheKey)) {
        const cached = newsCache.get(cacheKey);
        if (Date.now() - cached.timestamp < NEWS_CACHE_DURATION) {
            console.log(`📰 Using cached news for ${symbol}`);
            return cached.data;
        }
    }

    // Stock name mapping for better search
    const stockNames = {
        'RELIANCE': 'Reliance Industries',
        'TCS': 'Tata Consultancy Services',
        'HDFCBANK': 'HDFC Bank',
        'INFY': 'Infosys',
        'ITC': 'ITC Limited',
        'TATAMOTORS': 'Tata Motors',
        'BHARTIARTL': 'Bharti Airtel',
        'SBIN': 'State Bank of India',
        'WIPRO': 'Wipro',
        'MARUTI': 'Maruti Suzuki',
        'ASIANPAINT': 'Asian Paints',
        'AXISBANK': 'Axis Bank',
        'BAJFINANCE': 'Bajaj Finance',
        'HINDUNILVR': 'Hindustan Unilever',
        'ICICIBANK': 'ICICI Bank',
        'KOTAKBANK': 'Kotak Mahindra Bank',
        'LT': 'Larsen & Toubro',
        'SUNPHARMA': 'Sun Pharmaceutical',
        'TATASTEEL': 'Tata Steel',
        'TITAN': 'Titan Company',
        'ADANIENT': 'Adani Enterprises',
        'ADANIGREEN': 'Adani Green Energy',
        'ADANIPORTS': 'Adani Ports',
        'BAJAJ-AUTO': 'Bajaj Auto',
        'BRITANNIA': 'Britannia Industries',
        'CIPLA': 'Cipla',
        'COALINDIA': 'Coal India',
        'DIVISLAB': 'Divi\'s Laboratories',
        'DRREDDY': 'Dr Reddy\'s Laboratories',
        'EICHERMOT': 'Eicher Motors',
        'GRASIM': 'Grasim Industries',
        'HCLTECH': 'HCL Technologies',
        'HEROMOTOCO': 'Hero MotoCorp',
        'HINDALCO': 'Hindalco Industries',
        'INDUSINDBK': 'IndusInd Bank',
        'JSWSTEEL': 'JSW Steel',
        'M&M': 'Mahindra & Mahindra',
        'NESTLEIND': 'Nestle India',
        'NTPC': 'NTPC',
        'ONGC': 'Oil and Natural Gas Corporation',
        'POWERGRID': 'Power Grid Corporation',
        'SHREECEM': 'Shree Cement',
        'ULTRACEMCO': 'UltraTech Cement'
    };

    const companyName = stockNames[symbol] || symbol;
    const query = `${companyName} OR ${symbol}`;

    console.log(`📡 Fetching news for ${symbol}...`);

    let news = null;
    let lastError = null;

    // Try NewsAPI first
    try {
        news = await fetchNewsFromNewsAPI(query, maxArticles);
    } catch (error) {
        console.log(`⚠️ NewsAPI failed for ${symbol}:`, error.message);
        lastError = error;
    }
    
    // Try GNews as fallback
    if (!news) {
        try {
            console.log(`⚠️ Trying GNews for ${symbol}...`);
            news = await fetchNewsFromGNews(query, maxArticles);
        } catch (error) {
            console.log(`⚠️ GNews failed for ${symbol}:`, error.message);
            lastError = error;
        }
    }

    // If both failed, throw error
    if (!news || news.length === 0) {
        throw new Error(`No news found for ${symbol}. ${lastError?.message || ''}`);
    }

    // Cache results
    newsCache.set(cacheKey, {
        data: news,
        timestamp: Date.now()
    });

    console.log(`✅ Fetched ${news.length} articles for ${symbol}`);
    return news;
}

/**
 * Get recent news (wrapper)
 */
async function getRecentNews() {
    return await fetchIndianMarketNews(10);
}

/**
 * Get news for symbol (wrapper)
 */
async function getNewsForSymbol(symbol) {
    return await fetchNewsForSymbol(symbol, 7);
}

/**
 * Clear news cache
 */
function clearNewsCache() {
    newsCache.clear();
    console.log('📦 News cache cleared');
}

/**
 * Check if news service is configured
 */
function isNewsServiceConfigured() {
    return !!(NEWS_API_KEY || GNEWS_API_KEY);
}

module.exports = { 
    getRecentNews, 
    getNewsForSymbol,
    clearNewsCache,
    isNewsServiceConfigured
};
