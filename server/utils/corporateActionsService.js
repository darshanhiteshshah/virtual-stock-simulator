const User = require("../models/User");
const { getAvailableStocks, getMockStockData, mockStockService } = require("./mockStockService");
const Decimal = require("decimal.js");
const cron = require("node-cron");

const triggerCorporateAction = async () => {
    console.log("⚙️ Checking if a corporate action should be triggered...");
    
    // Trigger an event on a 25% chance
    if (Math.random() > 0.75) {
        console.log("No corporate action triggered this time.");
        return;
    }

    try {
        const availableStocks = getAvailableStocks();
        const stock = availableStocks[Math.floor(Math.random() * availableStocks.length)];
        const actionType = Math.random() > 0.5 ? 'DIVIDEND' : 'STOCK_SPLIT';

        const usersHoldingStock = await User.find({ "portfolio.symbol": stock.symbol });
        if (usersHoldingStock.length === 0) {
            console.log(`Corporate action for ${stock.symbol} skipped: No users hold this stock.`);
            return;
        }

        if (actionType === 'DIVIDEND') {
            const stockData = getMockStockData(stock.symbol);
            const dividendPerShare = new Decimal(stockData.price).times(0.005).toNumber(); // 0.5% dividend

            for (const user of usersHoldingStock) {
                const stockInPortfolio = user.portfolio.find(s => s.symbol === stock.symbol);
                const dividendEarned = new Decimal(stockInPortfolio.quantity).times(dividendPerShare).toNumber();
                
                user.walletBalance = new Decimal(user.walletBalance).plus(dividendEarned).toNumber();
                user.transactions.push({
                    type: "DIVIDEND",
                    symbol: stock.symbol,
                    quantity: stockInPortfolio.quantity,
                    price: dividendPerShare, // Price here is dividend per share
                });
                await user.save();
            }
            console.log(`💵 Dividend of ₹${dividendPerShare.toFixed(2)}/share paid out for ${stock.symbol}.`);
        } else { // STOCK_SPLIT (2-for-1)
            for (const user of usersHoldingStock) {
                const stockInPortfolio = user.portfolio.find(s => s.symbol === stock.symbol);
                stockInPortfolio.quantity *= 2;
                stockInPortfolio.avgBuyPrice /= 2;
                await user.save();
            }
            // Update the base price in the mock service
            mockStockService.splitStock(stock.symbol);
            console.log(`✂️ Stock split (2-for-1) executed for ${stock.symbol}.`);
        }
    } catch (error) {
        console.error("❌ Error during corporate action:", error);
    }
};

const startCorporateActionsService = () => {
    // Runs every 4 hours
    cron.schedule('0 */4 * * *', triggerCorporateAction);
    console.log('🏭 Corporate Actions service scheduled.');
};

module.exports = { startCorporateActionsService };