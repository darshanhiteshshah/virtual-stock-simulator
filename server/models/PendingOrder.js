const mongoose = require("mongoose");

const pendingOrderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        symbol: { type: String, required: true, uppercase: true },
        quantity: { type: Number, required: true },
        targetPrice: { type: Number, required: true },
        orderType: { type: String, enum: ["LIMIT", "STOP_LOSS"], required: true },
        tradeType: { type: String, enum: ["BUY", "SELL"], required: true },
        status: { type: String, enum: ["PENDING", "EXECUTED", "CANCELLED", "FAILED"], default: "PENDING" },
        executedPrice: { type: Number },
    },
    { timestamps: true }
);

module.exports = mongoose.model("PendingOrder", pendingOrderSchema);