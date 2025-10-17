// server/utils/snapshotService.js
const User = require("../models/User");
const PortfolioSnapshot = require("../models/PortfolioSnapshot");
const Decimal = require("decimal.js");
const { getMockStockData } = require("../services/stockService"); // Fixed path
const cron = require("node-cron");

/**
 * Take daily portfolio snapshots for all users
 */
const takeSnapshots = async () => {
    console.log("\n📸 ========================================");
    console.log("📸 Starting daily portfolio snapshot process...");
    console.log(`📅 Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    console.log("📸 ========================================\n");

    try {
        const users = await User.find({}).select("portfolio walletBalance username");
        
        if (users.length === 0) {
            console.log("ℹ️ No users found to snapshot.");
            return;
        }

        console.log(`👥 Processing snapshots for ${users.length} users...\n`);

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to beginning of day

        let successCount = 0;
        let failureCount = 0;

        for (const user of users) {
            try {
                let portfolioValue = new Decimal(0);

                // Calculate portfolio value with live Yahoo Finance data
                for (const stock of user.portfolio) {
                    try {
                        // Fetch current price from Yahoo Finance (async)
                        const stockData = await getMockStockData(stock.symbol);
                        
                        if (stockData && stockData.price) {
                            const price = new Decimal(stockData.price);
                            const quantity = new Decimal(stock.quantity);
                            const stockValue = price.times(quantity);
                            portfolioValue = portfolioValue.plus(stockValue);

                            console.log(`  💼 ${stock.symbol}: ${stock.quantity} × ₹${price} = ₹${stockValue.toFixed(2)}`);
                        } else {
                            console.warn(`  ⚠️ No price data for ${stock.symbol}, skipping`);
                        }
                    } catch (stockError) {
                        console.error(`  ❌ Error fetching ${stock.symbol}:`, stockError.message);
                        continue;
                    }
                }

                const netWorth = new Decimal(user.walletBalance).plus(portfolioValue).toNumber();

                // Update or create snapshot
                await PortfolioSnapshot.findOneAndUpdate(
                    { user: user._id, date: today },
                    { 
                        netWorth,
                        portfolioValue: portfolioValue.toNumber(),
                        walletBalance: user.walletBalance,
                        timestamp: new Date()
                    },
                    { upsert: true, new: true }
                );

                console.log(`✅ ${user.username}: Portfolio ₹${portfolioValue.toFixed(2)} + Wallet ₹${user.walletBalance.toFixed(2)} = Net Worth ₹${netWorth.toFixed(2)}\n`);
                successCount++;

            } catch (userError) {
                console.error(`❌ Error processing user ${user.username}:`, userError.message);
                failureCount++;
                continue;
            }
        }

        console.log("\n📸 ========================================");
        console.log(`✅ Snapshot process completed!`);
        console.log(`   Success: ${successCount} users`);
        if (failureCount > 0) {
            console.log(`   Failed: ${failureCount} users`);
        }
        console.log("📸 ========================================\n");

    } catch (error) {
        console.error("\n❌ Critical error in snapshot service:", error.message);
        console.error(error.stack);
    }
};

/**
 * Start the snapshot service with cron scheduling
 */
const startSnapshotService = () => {
    console.log("⏰ Daily portfolio snapshot service initializing...");

    // Run immediately on startup (optional - comment out if not needed)
    console.log("🚀 Taking initial snapshot on startup...");
    takeSnapshots().catch(err => {
        console.error("❌ Initial snapshot failed:", err.message);
    });

    // Schedule daily at midnight IST
    cron.schedule('0 0 * * *', () => {
        console.log("\n⏰ Cron job triggered: Daily snapshot");
        takeSnapshots();
    }, {
        timezone: "Asia/Kolkata",
        scheduled: true
    });

    console.log("✅ Daily snapshot service scheduled (00:00 IST)");
    console.log("📅 Next run: Tomorrow at midnight IST\n");
};

/**
 * Manual trigger for testing
 */
const triggerSnapshotManually = async () => {
    console.log("🔧 Manual snapshot trigger activated");
    await takeSnapshots();
};

module.exports = { 
    startSnapshotService, 
    takeSnapshots,
    triggerSnapshotManually 
};
