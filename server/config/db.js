const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const dns = require("dns");
        dns.setServers(["8.8.8.8", "8.8.4.4"]);
        // Mongoose 6+ handles connection options automatically
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
