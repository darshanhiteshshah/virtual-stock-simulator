const mongoose = require("mongoose");

const portfolioSnapshotSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    netWorth: { type: Number, required: true },
    date: { type: Date, required: true },
});

// Compound index to ensure only one snapshot per user per day
portfolioSnapshotSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("PortfolioSnapshot", portfolioSnapshotSchema);