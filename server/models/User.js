const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const stockSchema = new mongoose.Schema({
    symbol: { type: String, required: true },
    quantity: { type: Number, required: true },
    avgBuyPrice: { type: Number, required: true },
});

const transactionSchema = new mongoose.Schema({
    type: { type: String, enum: ["BUY", "SELL", "DIVIDEND"], required: true },
    symbol: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

const alertSchema = new mongoose.Schema({
    symbol: { type: String, required: true },
    targetPrice: { type: Number, required: true },
    condition: { type: String, enum: ["above", "below"], required: true },
    createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        walletBalance: { type: Number, default: 100000 },
        portfolio: [stockSchema],
        transactions: [transactionSchema],
        watchlist: { type: [String], default: [] },
        priceAlerts: [alertSchema],
        achievements: {
            type: [String],
            default: [],
        },
        // --- NEW FIELD ---
        tokenVersion: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);