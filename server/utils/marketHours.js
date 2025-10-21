/**
 * Indian Stock Market Hours Checker
 * BSE/NSE Trading Hours: 9:15 AM - 3:30 PM IST (Monday - Friday)
 */

// Market timings (IST)
const MARKET_OPEN_HOUR = 9;
const MARKET_OPEN_MINUTE = 15;
const MARKET_CLOSE_HOUR = 15;
const MARKET_CLOSE_MINUTE = 30;

// Pre-market: 9:00 AM - 9:15 AM
const PREMARKET_OPEN_HOUR = 9;
const PREMARKET_OPEN_MINUTE = 0;

// Post-market: 3:30 PM - 4:00 PM (for orders, not execution)
const POSTMARKET_CLOSE_HOUR = 16;
const POSTMARKET_CLOSE_MINUTE = 0;

// Market holidays 2025 (BSE/NSE)
const MARKET_HOLIDAYS_2025 = [
    '2025-01-26', // Republic Day
    '2025-03-14', // Holi
    '2025-03-31', // Id-Ul-Fitr
    '2025-04-10', // Mahavir Jayanti
    '2025-04-18', // Good Friday
    '2025-05-01', // Maharashtra Day
    '2025-06-07', // Id-Ul-Adha (Bakri Id)
    '2025-07-06', // Muharram
    '2025-08-15', // Independence Day
    '2025-08-27', // Ganesh Chaturthi
    '2025-10-02', // Gandhi Jayanti
    '2025-10-02', // Dussehra
    '2025-10-21', // Diwali Laxmi Pujan
    '2025-10-22', // Diwali Balipratipada
    '2025-11-05', // Guru Nanak Jayanti
    '2025-12-25', // Christmas
];

/**
 * Check if market is currently open
 */
function isMarketOpen() {
    const now = new Date();
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    const day = istTime.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = istTime.getHours();
    const minute = istTime.getMinutes();
    
    // Check if weekend
    if (day === 0 || day === 6) {
        return { isOpen: false, reason: 'Market closed on weekends' };
    }
    
    // Check if holiday
    const dateStr = istTime.toISOString().split('T')[0];
    if (MARKET_HOLIDAYS_2025.includes(dateStr)) {
        return { isOpen: false, reason: 'Market holiday' };
    }
    
    // Convert current time to minutes for comparison
    const currentMinutes = hour * 60 + minute;
    const openMinutes = MARKET_OPEN_HOUR * 60 + MARKET_OPEN_MINUTE;
    const closeMinutes = MARKET_CLOSE_HOUR * 60 + MARKET_CLOSE_MINUTE;
    
    // Check if within trading hours (9:15 AM - 3:30 PM)
    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
        return { 
            isOpen: true, 
            message: 'Market is open for trading',
            closesAt: `${MARKET_CLOSE_HOUR}:${MARKET_CLOSE_MINUTE.toString().padStart(2, '0')} PM IST`
        };
    }
    
    // Market closed
    if (currentMinutes < openMinutes) {
        return { 
            isOpen: false, 
            reason: 'Market not yet opened',
            opensAt: `${MARKET_OPEN_HOUR}:${MARKET_OPEN_MINUTE.toString().padStart(2, '0')} AM IST`
        };
    }
    
    return { 
        isOpen: false, 
        reason: 'Market closed for the day',
        opensAt: 'Tomorrow at 9:15 AM IST'
    };
}

/**
 * Check if in pre-market hours (9:00 AM - 9:15 AM)
 */
function isPreMarket() {
    const now = new Date();
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    const day = istTime.getDay();
    const hour = istTime.getHours();
    const minute = istTime.getMinutes();
    
    if (day === 0 || day === 6) return false;
    
    const dateStr = istTime.toISOString().split('T')[0];
    if (MARKET_HOLIDAYS_2025.includes(dateStr)) return false;
    
    const currentMinutes = hour * 60 + minute;
    const preMarketStart = PREMARKET_OPEN_HOUR * 60 + PREMARKET_OPEN_MINUTE;
    const marketOpen = MARKET_OPEN_HOUR * 60 + MARKET_OPEN_MINUTE;
    
    return currentMinutes >= preMarketStart && currentMinutes < marketOpen;
}

/**
 * Get next market open time
 */
function getNextMarketOpen() {
    const now = new Date();
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    let nextOpen = new Date(istTime);
    nextOpen.setHours(MARKET_OPEN_HOUR, MARKET_OPEN_MINUTE, 0, 0);
    
    // If market already opened today or it's after closing, move to next day
    const currentMinutes = istTime.getHours() * 60 + istTime.getMinutes();
    const openMinutes = MARKET_OPEN_HOUR * 60 + MARKET_OPEN_MINUTE;
    
    if (currentMinutes >= openMinutes) {
        nextOpen.setDate(nextOpen.getDate() + 1);
    }
    
    // Skip weekends
    while (nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
        nextOpen.setDate(nextOpen.getDate() + 1);
    }
    
    // Skip holidays
    let dateStr = nextOpen.toISOString().split('T')[0];
    while (MARKET_HOLIDAYS_2025.includes(dateStr)) {
        nextOpen.setDate(nextOpen.getDate() + 1);
        // Skip weekend after holiday
        while (nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
            nextOpen.setDate(nextOpen.getDate() + 1);
        }
        dateStr = nextOpen.toISOString().split('T')[0];
    }
    
    return nextOpen;
}

/**
 * Get market status message for display
 */
function getMarketStatus() {
    const status = isMarketOpen();
    const now = new Date();
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    return {
        isOpen: status.isOpen,
        status: status.isOpen ? 'OPEN' : 'CLOSED',
        message: status.message || status.reason,
        currentTime: istTime.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        }),
        nextOpen: status.isOpen ? null : (status.opensAt || getNextMarketOpen().toLocaleString('en-IN')),
        isPreMarket: isPreMarket(),
        tradingHours: '9:15 AM - 3:30 PM IST'
    };
}

/**
 * Check if trading is allowed (for testing, can override)
 */
function canTrade() {
    // For development/testing, check environment variable
    if (process.env.DISABLE_MARKET_HOURS === 'true') {
        return { allowed: true, message: 'Market hours check disabled (dev mode)' };
    }
    
    const status = isMarketOpen();
    
    if (status.isOpen) {
        return { allowed: true, message: 'Trading allowed' };
    }
    
    return { 
        allowed: false, 
        message: status.reason,
        details: `Market opens at ${status.opensAt || '9:15 AM IST'}`
    };
}

module.exports = {
    isMarketOpen,
    isPreMarket,
    getNextMarketOpen,
    getMarketStatus,
    canTrade,
    MARKET_HOLIDAYS_2025
};
