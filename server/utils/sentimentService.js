// A list of major market sectors in India.
const sectors = [
    "Information Technology", "Financial Services", "Automotive", 
    "Pharmaceuticals", "FMCG", "Infrastructure", "Energy"
];

// Mock reasons for sentiment changes.
const buzzSnippets = {
    bullish: [
        "strong quarterly earnings reports.",
        "positive global cues and FII inflows.",
        "a new government policy boosting the sector.",
        "breakthrough innovations and strong export numbers.",
        "increased domestic demand and consumption."
    ],
    bearish: [
        "weak global demand and supply chain disruptions.",
        "concerns over rising inflation and interest rates.",
        "disappointing quarterly results from key players.",
        "regulatory headwinds and increased competition.",
        "a downgrade from a major ratings agency."
    ]
};

/**
 * Generates a random sentiment score between -1 (very bearish) and 1 (very bullish).
 */
const generateSentimentScore = () => Math.random() * 2 - 1;

/**
 * Generates a complete mock sentiment data object.
 */
const getSentimentData = () => {
    const heatmap = sectors.map(sector => {
        const retailSentiment = generateSentimentScore();
        const fiiSentiment = generateSentimentScore(); // Foreign Institutional Investors
        const diiSentiment = generateSentimentScore(); // Domestic Institutional Investors
        
        const overallSentiment = (retailSentiment + fiiSentiment + diiSentiment) / 3;
        
        let buzz = `Market is neutral on the ${sector} sector.`;
        if (overallSentiment > 0.3) {
            buzz = `Positive buzz around the ${sector} sector due to ${buzzSnippets.bullish[Math.floor(Math.random() * buzzSnippets.bullish.length)]}`;
        } else if (overallSentiment < -0.3) {
            buzz = `Negative sentiment for the ${sector} sector due to ${buzzSnippets.bearish[Math.floor(Math.random() * buzzSnippets.bearish.length)]}`;
        }

        return {
            sector,
            retailSentiment,
            fiiSentiment,
            diiSentiment,
            overallSentiment,
            buzz
        };
    });

    return heatmap;
};

module.exports = { getSentimentData };
