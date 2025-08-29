// A list of mock news headlines. We can associate them with symbols for more relevance.
const newsTemplates = [
    { symbol: 'RELIANCE', headline: 'Reliance Industries announces record profits in Q4, shares surge.' },
    { symbol: 'TCS', headline: 'TCS secures major AI development deal with European banking giant.' },
    { symbol: 'HDFCBANK', headline: 'HDFC Bank reports steady loan growth amidst rising interest rates.' },
    { symbol: 'INFY', headline: 'Infosys launches new cloud platform, analysts optimistic.' },
    { symbol: 'ITC', headline: 'ITC expands its FMCG portfolio with new line of organic products.' },
    { symbol: 'TATAMOTORS', headline: 'Tata Motors unveils new EV model, targets 20% market share.' },
    { symbol: 'MRF', headline: 'MRF Tyres posts strong sales figures due to increased demand in the auto sector.' },
    { symbol: 'BSE', headline: 'BSE reports a significant increase in daily trading volumes for the month.' },
    { symbol: 'ZOMATO', headline: 'Zomato expands into 15 new cities, stock reacts positively.' },
    { headline: 'Market Watch: Sensex closes up 300 points on positive global cues.' },
    { headline: 'Sector Analysis: IT stocks rally on strong outsourcing demand.' },
    { headline: 'Economic Outlook: RBI holds interest rates steady, citing inflation concerns.' },
    { headline: 'Pharma stocks see gains after new government healthcare policy announced.' },
    { headline: 'Auto Sector in Focus: Festive season sales expected to break records this year.' },
];

/**
 * Shuffles an array and returns a slice of it.
 * @param {Array} array - The array to shuffle.
 * @param {number} numItems - The number of items to return.
 * @returns {Array} A new array with shuffled items.
 */
const shuffleAndSlice = (array, numItems) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numItems);
};


/**
 * Gets a random selection of recent news articles.
 * @returns {Array<{headline: string, date: Date}>}
 */
const getRecentNews = () => {
    const news = shuffleAndSlice(newsTemplates, 7); // Get 7 random news items
    return news.map(item => ({
        ...item,
        date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time within last 24h
    }));
};

// ... (existing code)

/**
 * Gets news, prioritizing headlines that match the given symbol.
 * @param {string} symbol - The stock symbol to find news for.
 * @returns {Array<{headline: string, date: Date}>}
 */
const getNewsForSymbol = (symbol) => {
    const relevantNews = newsTemplates.filter(item => item.symbol === symbol);
    const genericNews = newsTemplates.filter(item => !item.symbol);
    
    // Combine relevant news with a few generic articles
    const combined = [...relevantNews, ...shuffleAndSlice(genericNews, 3)];

    return combined.map(item => ({
        ...item,
        date: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000), // Random time within last 48h
    }));
};

module.exports = { getRecentNews, getNewsForSymbol };


