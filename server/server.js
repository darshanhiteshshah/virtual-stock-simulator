const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { startUpdating } = require("./utils/mockStockService");
const { startAlertChecker } = require("./utils/alertChecker");
const { startOrderExecutor } = require("./utils/orderExecutor"); 
const { startSnapshotService } = require("./utils/snapshotService");
const { startCorporateActionsService } = require("./utils/corporateActionsService"); // --- NEW ---

// Route imports
const authRoutes = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const stockRoutes = require("./routes/stockRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const watchlistRoutes = require("./routes/watchListRoutes");
const userRoutes = require("./routes/userRoutes");
const newsRoutes = require("./routes/newsRoutes");
const sentimentRoutes = require("./routes/sentimentRoutes");
const alertRoutes = require("./routes/alertRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const feedRoutes = require("./routes/feedRoutes");

// Load environment variables
dotenv.config();

// Initialize database connection
connectDB();

// Start background services
startUpdating();
startAlertChecker();
startOrderExecutor();
startSnapshotService();
startCorporateActionsService();

const app = express();

// Middleware
app.use(cors({
  origin: "https://virtual-stock-simulator-qwe1.vercel.app",
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/user", userRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/sentiment", sentimentRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/feed", feedRoutes);

// Root route should be above error middlewares
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Error Handling Middleware (should be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
