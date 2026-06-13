const axios = require("axios");

const BASE_URL = "https://www.alphavantage.co/query";
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

async function getDailyHistory(symbol) {
    const response = await axios.get(BASE_URL, {
        params: {
            function: "TIME_SERIES_DAILY_ADJUSTED",
            symbol: `${symbol}.BSE`,
            outputsize: "full",
            apikey: API_KEY
        }
    });

    const data = response.data["Time Series (Daily)"];
    if (!data) return [];

    return Object.entries(data)
        .map(([date, d]) => ({
            date,
            open: +d["1. open"],
            high: +d["2. high"],
            low: +d["3. low"],
            close: +d["4. close"],
            volume: +d["6. volume"]
        }))
        .reverse();
}

module.exports = { getDailyHistory };
