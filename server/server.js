// server.js - FIXED VERSION
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables FIRST
dotenv.config();

// Error handlers BEFORE anything else
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error.message);
    console.error(error.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    process.exit(1);
});

console.log('🚀 Starting Virtual Stock Simulator Server...\n');

// Now load other modules
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Background Services
const { startAlertChecker } = require("./utils/alertChecker");
const { startOrderExecutor } = require("./utils/orderExecutor"); 
const { startSnapshotService } = require("./utils/snapshotService");
const { startCorporateActionsService } = require("./utils/corporateActionsService");

// Route imports
const authRoutes = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const stockRoutes = require("./routes/stockRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const watchlistRoutes = require("./routes/watchListRoutes");
const userRoutes = require("./routes/userRoutes");
const newsRoutes = require("./routes/newsRoutes");
const sentimentRoutes = require("./routes/sentimentRoutes");
const alertRoutes = require("./routes/alertRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const feedRoutes = require("./routes/feedRoutes");
const algoRoutes = require('./routes/algoRoutes');
const marketRoutes = require('./routes/marketRoutes');


console.log('✅ All modules loaded successfully\n');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: [
    "https://virtual-stock-simulator-2znc.vercel.app",
    "https://virtual-stock-simulator-768i.vercel.app",
    "https://virtual-stock-simulator-qwe1.vercel.app",
    "https://virtual-stock-simulator.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true,
}));
app.use(express.json());

console.log('✅ Middleware configured\n');

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/user", userRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/sentiment", sentimentRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/feed", feedRoutes);
app.use('/api/algo', algoRoutes);
app.use('/api/market', marketRoutes);



console.log('✅ Routes registered\n');

// Health check route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Virtual Stock Simulator API",
    dataSource: process.env.USE_YAHOO_FINANCE === 'true' ? 'Yahoo Finance (BSE)' : 'Mock Data',
    timestamp: new Date().toISOString()
  });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Server initialization
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('📊 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected\n');

    // Start the server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 ===================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Data Source: ${process.env.USE_YAHOO_FINANCE === 'true' ? 'Yahoo Finance (BSE) ✨' : 'Mock Data 🎭'}`);
      console.log('🚀 ===================================\n');

      // Start background services
      console.log('🔧 Starting background services...\n');
      
      try {
        startAlertChecker();
        console.log('✅ Alert checker started');
      } catch (err) {
        console.error('❌ Alert checker failed:', err.message);
      }

      try {
        startOrderExecutor();
        console.log('✅ Order executor started');
      } catch (err) {
        console.error('❌ Order executor failed:', err.message);
      }

      try {
        startSnapshotService();
        console.log('✅ Snapshot service started');
      } catch (err) {
        console.error('❌ Snapshot service failed:', err.message);
      }

      try {
        startCorporateActionsService();
        console.log('✅ Corporate actions started');
      } catch (err) {
        console.error('❌ Corporate actions failed:', err.message);
      }

      console.log('\n✅ Server is ready!\n');
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error.message);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Handle shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️ SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️ SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  console.error('💥 Fatal error during startup:', error);
  process.exit(1);
});
