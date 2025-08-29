const User = require("../models/User");
const PortfolioSnapshot = require("../models/PortfolioSnapshot");
const Decimal = require("decimal.js");
const { getMockStockData } = require("./mockStockService");
const cron = require("node-cron");

const takeSnapshots = async () => {
    console.log("📸 Starting daily portfolio snapshot process...");
    try {
        const users = await User.find({}).select("portfolio walletBalance");
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to the beginning of the day

        for (const user of users) {
            const portfolioValue = user.portfolio.reduce((acc, stock) => {
                const stockData = getMockStockData(stock.symbol);
                if (stockData) {
                    const price = new Decimal(stockData.price);
                    const quantity = new Decimal(stock.quantity);
                    return acc.plus(price.times(quantity));
                }
                return acc;
            }, new Decimal(0));

            const netWorth = new Decimal(user.walletBalance).plus(portfolioValue).toNumber();

            // Update existing snapshot for today or create a new one
            await PortfolioSnapshot.findOneAndUpdate(
                { user: user._id, date: today },
                { netWorth },
                { upsert: true, new: true }
            );
        }
        console.log("✅ Daily portfolio snapshots completed successfully.");
    } catch (error) {
        console.error("❌ Error taking portfolio snapshots:", error);
    }
};

// Schedule the job to run once every day at midnight
const startSnapshotService = () => {
    // cron pattern: 'minute hour day-of-month month day-of-week'
    cron.schedule('0 0 * * *', takeSnapshots, {
        timezone: "Asia/Kolkata"
    });
    console.log('⏰ Daily portfolio snapshot service scheduled.');
};

module.exports = { startSnapshotService };