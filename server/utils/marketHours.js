/**
 * Check if current time is within market hours (9:15 AM - 3:30 PM IST)
 * BSE/NSE trading hours: Monday to Friday
 */

// Force IST timezone
const getISTTime = () => {
    const now = new Date();
    
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const istTime = new Date(utcTime + istOffset);
    
    return istTime;
};

const isMarketOpen = () => {
    const now = getISTTime(); // Use IST time always
    
    // Get day of week (0 = Sunday, 6 = Saturday)
    const day = now.getDay();
    
    // Market closed on weekends
    if (day === 0 || day === 6) {
        return false;
    }
    
    // Get current time in IST
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 100 + minutes;
    
    // Market hours: 9:15 AM (0915) to 3:30 PM (1530)
    const marketOpen = 915;  // 9:15 AM
    const marketClose = 1530; // 3:30 PM
    
    return currentTime >= marketOpen && currentTime <= marketClose;
};

// ✅ ADD THIS FUNCTION - Required for trade controller
const canTrade = () => {
    // For development: allow trading anytime
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_TRADING_ANYTIME === 'true') {
        return true;
    }
    
    // For production: check market hours and holidays
    const now = getISTTime();
    
    // Check if today is a holiday
    if (isMarketHoliday(now)) {
        return false;
    }
    
    // Check if market is open
    return isMarketOpen();
};

const getMarketStatus = () => {
    const now = getISTTime();
    const day = now.getDay();
    
    // Weekend check
    if (day === 0 || day === 6) {
        return {
            isOpen: false,
            status: 'CLOSED',
            message: 'Market is closed on weekends',
            nextOpen: getNextMarketOpen(now)
        };
    }
    
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 100 + minutes;
    
    const preMarket = 900;   // 9:00 AM
    const marketOpen = 915;  // 9:15 AM
    const marketClose = 1530; // 3:30 PM
    const postMarket = 1600;  // 4:00 PM
    
    if (currentTime < preMarket) {
        return {
            isOpen: false,
            status: 'PRE_MARKET',
            message: 'Pre-market period',
            nextOpen: getNextMarketOpen(now)
        };
    } else if (currentTime >= preMarket && currentTime < marketOpen) {
        return {
            isOpen: false,
            status: 'OPENING_SOON',
            message: 'Market opens at 9:15 AM IST',
            nextOpen: getNextMarketOpen(now)
        };
    } else if (currentTime >= marketOpen && currentTime <= marketClose) {
        return {
            isOpen: true,
            status: 'OPEN',
            message: 'Market is open for trading',
            closesAt: '3:30 PM IST'
        };
    } else if (currentTime > marketClose && currentTime < postMarket) {
        return {
            isOpen: false,
            status: 'POST_MARKET',
            message: 'Post-market period',
            nextOpen: getNextMarketOpen(now)
        };
    } else {
        return {
            isOpen: false,
            status: 'CLOSED',
            message: 'Market is closed',
            nextOpen: getNextMarketOpen(now)
        };
    }
};

const getNextMarketOpen = (currentDate) => {
    const now = currentDate || getISTTime();
    let nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(9, 15, 0, 0);
    
    // Skip weekends and holidays
    while (nextDay.getDay() === 0 || nextDay.getDay() === 6 || isMarketHoliday(nextDay)) {
        nextDay.setDate(nextDay.getDate() + 1);
    }
    
    return nextDay.toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium', 
        timeStyle: 'short' 
    });
};

// Holiday list for 2025 (BSE/NSE)
const marketHolidays2025 = [
    '2025-01-26', // Republic Day
    '2025-03-14', // Holi
    '2025-03-31', // Id-Ul-Fitr
    '2025-04-10', // Mahavir Jayanti
    '2025-04-14', // Dr. Ambedkar Jayanti
    '2025-04-18', // Good Friday
    '2025-05-01', // Maharashtra Day
    '2025-06-07', // Id-Ul-Adha (Bakri Id)
    '2025-07-07', // Muharram
    '2025-08-15', // Independence Day
    '2025-08-27', // Ganesh Chaturthi
    '2025-10-02', // Mahatma Gandhi Jayanti
    '2025-10-12', // Dussehra
    '2025-10-20', // Diwali Laxmi Pujan
    '2025-10-21', // Diwali Balipratipada
    '2025-11-05', // Guru Nanak Jayanti
    '2025-12-25', // Christmas
];

const isMarketHoliday = (date = getISTTime()) => {
    const dateStr = date.toISOString().split('T')[0];
    return marketHolidays2025.includes(dateStr);
};

const getMarketStatusWithHolidays = () => {
    const now = getISTTime();
    
    // Check for holidays first
    if (isMarketHoliday(now)) {
        return {
            isOpen: false,
            status: 'HOLIDAY',
            message: 'Market is closed for a holiday',
            nextOpen: getNextMarketOpen(now)
        };
    }
    
    return getMarketStatus();
};

module.exports = {
    isMarketOpen,
    getMarketStatus: getMarketStatusWithHolidays,
    isMarketHoliday,
    getISTTime,
    canTrade  // ✅ EXPORT THIS - Required by trade controller
};
