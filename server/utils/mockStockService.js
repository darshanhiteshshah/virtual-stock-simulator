// A large list of companies listed on the BSE, now with sector information.
const stockTemplates = [
    { symbol: '3MINDIA', name: '3M India', initialPrice: 31230.00, sector: 'Conglomerate' },
    { symbol: 'ABB', name: 'A B B', initialPrice: 5643.00, sector: 'Infrastructure' },
    { symbol: 'ABBOTINDIA', name: 'Abbott India', initialPrice: 33780.00, sector: 'Pharmaceuticals' },
    { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', initialPrice: 3200.00, sector: 'Conglomerate' },
    { symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd.', initialPrice: 1800.00, sector: 'Energy' },
    { symbol: 'ADANIPORTS', name: 'Adani Ports and SEZ Ltd.', initialPrice: 1350.00, sector: 'Infrastructure' },
    { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', initialPrice: 2900.00, sector: 'FMCG' },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', initialPrice: 1150.00, sector: 'Financial Services' },
    { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd.', initialPrice: 9900.00, sector: 'Automotive' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', initialPrice: 7200.00, sector: 'Financial Services' },
    { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', initialPrice: 1600.00, sector: 'Financial Services' },
    { symbol: 'BANKBARODA', name: 'Bank of Baroda', initialPrice: 250.00, sector: 'Financial Services' },
    { symbol: 'BEL', name: 'Bharat Electronics Ltd.', initialPrice: 220.00, sector: 'Defence' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', initialPrice: 1200.00, sector: 'Telecommunication' },
    { symbol: 'BPCL', name: 'Bharat Petroleum Corp. Ltd.', initialPrice: 600.00, sector: 'Energy' },
    { symbol: 'BRITANNIA', name: 'Britannia Inds.', initialPrice: 5594.00, sector: 'FMCG' },
    { symbol: 'CIPLA', name: 'Cipla Ltd.', initialPrice: 1500.00, sector: 'Pharmaceuticals' },
    { symbol: 'COALINDIA', name: 'Coal India', initialPrice: 380.80, sector: 'Energy' },
    { symbol: 'CUMMINSIND', name: 'Cummins India Ltd.', initialPrice: 1900.00, sector: 'Engineering' },
    { symbol: 'DLF', name: 'DLF Ltd.', initialPrice: 750.00, sector: 'Real Estate' },
    { symbol: 'DIVISLAB', name: "Divi's Laboratories Ltd.", initialPrice: 4500.00, sector: 'Pharmaceuticals' },
    { symbol: 'DRREDDY', name: "Dr. Reddy's Labs Ltd.", initialPrice: 6200.00, sector: 'Pharmaceuticals' },
    { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd.', initialPrice: 4000.00, sector: 'Automotive' },
    { symbol: 'GODREJCP', name: 'Godrej Consumer Products Ltd.', initialPrice: 1150.00, sector: 'FMCG' },
    { symbol: 'GRASIM', name: 'Grasim Industries Ltd.', initialPrice: 2350.00, sector: 'Conglomerate' },
    { symbol: 'HAVELLS', name: 'Havells India Ltd.', initialPrice: 1300.00, sector: 'Electronics' },
    { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', initialPrice: 1400.00, sector: 'Information Technology' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', initialPrice: 1500.00, sector: 'Financial Services' },
    { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Co. Ltd.', initialPrice: 600.00, sector: 'Financial Services' },
    { symbol: 'HDFCAMC', name: 'HDFC Asset Management Co. Ltd.', initialPrice: 2600.00, sector: 'Financial Services' },
    { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd.', initialPrice: 5400.00, sector: 'Automotive' },
    { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd.', initialPrice: 670.00, sector: 'Metals' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', initialPrice: 2400.00, sector: 'FMCG' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', initialPrice: 1100.00, sector: 'Financial Services' },
    { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank Ltd.', initialPrice: 90.00, sector: 'Financial Services' },
    { symbol: 'INDHOTEL', name: 'Indian Hotels Co.', initialPrice: 450.00, sector: 'Hospitality' },
    { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd.', initialPrice: 1500.00, sector: 'Financial Services' },
    { symbol: 'INFY', name: 'Infosys', initialPrice: 1515.70, sector: 'Information Technology' },
    { symbol: 'IOC', name: 'Indian Oil Corporation Ltd.', initialPrice: 160.00, sector: 'Energy' },
    { symbol: 'INFOEDGE', name: 'Info Edge (India) Ltd.', initialPrice: 4700.00, sector: 'Internet' },
    { symbol: 'ITC', name: 'ITC Ltd.', initialPrice: 409.40, sector: 'FMCG' },
    { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd.', initialPrice: 900.00, sector: 'Metals' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', initialPrice: 1700.00, sector: 'Financial Services' },
    { symbol: 'LIC', name: 'Life Insurance Corporation of India', initialPrice: 1000.00, sector: 'Insurance' },
    { symbol: 'LUPIN', name: 'Lupin Ltd.', initialPrice: 1350.00, sector: 'Pharmaceuticals' },
    { symbol: 'LT', name: 'Larsen & Toubro Ltd.', initialPrice: 3600.00, sector: 'Infrastructure' },
    { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', initialPrice: 2500.00, sector: 'Automotive' },
    { symbol: 'MARICO', name: 'Marico Ltd.', initialPrice: 550.00, sector: 'FMCG' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', initialPrice: 12500.00, sector: 'Automotive' },
    { symbol: 'MCDOWELL-N', name: 'United Spirits Ltd.', initialPrice: 1200.00, sector: 'Beverages' },
    { symbol: 'MRF', name: 'MRF Ltd.', initialPrice: 128000.00, sector: 'Automotive' },
    { symbol: 'NESTLEIND', name: 'Nestle India', initialPrice: 2274.60, sector: 'FMCG' },
    { symbol: 'NTPC', name: 'NTPC Ltd.', initialPrice: 360.00, sector: 'Energy' },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corp. Ltd.', initialPrice: 270.00, sector: 'Energy' },
    { symbol: 'PFC', name: 'Power Finance Corporation Ltd.', initialPrice: 275.00, sector: 'Finance' },
    { symbol: 'PIDILITE', name: 'Pidilite Industries Ltd.', initialPrice: 3000.00, sector: 'Chemicals' },
    { symbol: 'PNB', name: 'Punjab National Bank', initialPrice: 80.00, sector: 'Financial Services' },
    { symbol: 'POWERGRID', name: 'Power Grid Corp. of India Ltd.', initialPrice: 300.00, sector: 'Energy' },
    { symbol: 'PERSISTENT', name: 'Persistent Systems Ltd.', initialPrice: 4000.00, sector: 'Information Technology' },
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', initialPrice: 2800.00, sector: 'Conglomerate' },
    { symbol: 'SBILIFE', name: 'SBI Life Insurance Co. Ltd.', initialPrice: 1450.00, sector: 'Financial Services' },
    { symbol: 'SBIN', name: 'State Bank of India', initialPrice: 830.00, sector: 'Financial Services' },
    { symbol: 'SHREECEM', name: 'Shree Cement Ltd.', initialPrice: 27000.00, sector: 'Infrastructure' },
    { symbol: 'SRF', name: 'SRF Ltd.', initialPrice: 2500.00, sector: 'Chemicals' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Inds. Ltd.', initialPrice: 1500.00, sector: 'Pharmaceuticals' },
    { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd.', initialPrice: 1100.00, sector: 'FMCG' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', initialPrice: 970.00, sector: 'Automotive' },
    { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', initialPrice: 165.00, sector: 'Metals' },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', initialPrice: 3135.80, sector: 'Information Technology' },
    { symbol: 'TECHM', name: 'Tech Mahindra Ltd.', initialPrice: 1300.00, sector: 'Information Technology' },
    { symbol: 'TITAN', name: 'Titan Company Ltd.', initialPrice: 3500.00, sector: 'FMCG' },
    { symbol: 'TRENT', name: 'Trent Ltd.', initialPrice: 4700.00, sector: 'Retail' },
    { symbol: 'TUBEINVEST', name: 'Tube Investments of India Ltd.', initialPrice: 3300.00, sector: 'Engineering' },
    { symbol: 'TVSMOTOR', name: 'TVS Motor Co. Ltd.', initialPrice: 1800.00, sector: 'Automotive' },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', initialPrice: 10800.00, sector: 'Infrastructure' },
    { symbol: 'VARUNBEV', name: 'Varun Beverages Ltd.', initialPrice: 1400.00, sector: 'Beverages' },
    { symbol: 'VEDANTA', name: 'Vedanta Ltd.', initialPrice: 250.00, sector: 'Metals' },
    { symbol: 'WIPRO', name: 'Wipro Ltd.', initialPrice: 480.00, sector: 'Information Technology' },
    { symbol: 'YESBANK', name: 'Yes Bank Ltd.', initialPrice: 20.00, sector: 'Financial Services' },
].sort((a, b) => a.name.localeCompare(b.name));

const stocks = {};
const stockHistory = {};

const generateHistoricalOHLCData = (startPrice) => {
    const history = [];
    let lastClose = startPrice;

    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        
        const open = parseFloat(lastClose.toFixed(2));
        const change = open * (Math.random() - 0.48) * 0.1; // Fluctuate by up to 5%
        const close = parseFloat(Math.max(10, open + change).toFixed(2));
        
        const high = parseFloat(Math.max(open, close) * (1 + Math.random() * 0.03)).toFixed(2); // Up to 3% higher
        const low = parseFloat(Math.min(open, close) * (1 - Math.random() * 0.03)).toFixed(2); // Up to 3% lower

        history.push({
            date: date.toISOString().split('T')[0],
            open,
            high,
            low,
            close,
        });
        lastClose = close;
    }
    return history;
};

function initializeStocks() {
    console.log(`🏭 Initializing mock data for ${stockTemplates.length} BSE stocks...`);
    stockTemplates.forEach(template => {
        const price = template.initialPrice;
        const previousClose = parseFloat((price * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2));
        
        const week52High = price * (1 + (Math.random() * 0.2 + 0.1));
        const week52Low = price * (1 - (Math.random() * 0.2 + 0.1));
        const marketCap = Math.floor(Math.random() * 500000) + 5000;
        const peRatio = parseFloat((Math.random() * (80 - 10) + 10).toFixed(2));

        stocks[template.symbol] = {
            name: template.name,
            price: price,
            previousClose: previousClose,
            volume: Math.floor(Math.random() * (10000000 - 100000) + 100000),
            week52High: parseFloat(week52High.toFixed(2)),
            week52Low: parseFloat(week52Low.toFixed(2)),
            marketCap: marketCap,
            peRatio: peRatio,
            sector: template.sector,
        };
        // Generate and store historical OHLC data for each stock
        stockHistory[template.symbol] = generateHistoricalOHLCData(price);
    });
    console.log('✅ Mock data initialization complete.');
}

function updateStockPrices() {
    for (const symbol in stocks) {
        const stock = stocks[symbol];
        const changePercent = (Math.random() - 0.5) * 0.04;
        const changeAmount = stock.price * changePercent;
        stock.price = Math.max(0.01, stock.price + changeAmount);
    }
}

function startUpdating(interval = 2000) {
    initializeStocks();
    console.log('📈 Mock Stock Price Updater has started. Prices will update every 2 seconds.');
    setInterval(updateStockPrices, interval);
}

function getMockStockData(symbol) {
    const stock = stocks[symbol.toUpperCase()];
    if (!stock) return null;
    return {
        symbol: symbol.toUpperCase(),
        ...stock,
        price: stock.price.toFixed(2),
    };
}

function getAvailableStocks() {
    return stockTemplates.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
    }));
}

// This function now returns the OHLC data
function getHistoryForSymbol(symbol) {
    return stockHistory[symbol.toUpperCase()] || null;
}


function splitStock(symbol) {
    const stock = stocks[symbol.toUpperCase()];
    if (stock) {
        stock.price /= 2;
        stock.previousClose /= 2;
        stock.week52High /= 2;
        stock.week52Low /= 2;
    }
}

const mockStockService = {
    splitStock
};

function getAllStockData() {
    return Object.keys(stocks).map(symbol => getMockStockData(symbol));
}
module.exports = { startUpdating, getMockStockData, getAvailableStocks, getHistoryForSymbol, mockStockService,getAllStockData, splitStock, stockHistory, stocks, stockTemplates };

