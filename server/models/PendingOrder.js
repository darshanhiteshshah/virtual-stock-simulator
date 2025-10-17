const mongoose = require("mongoose");

const pendingOrderSchema = new mongoose.Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        symbol: { 
            type: String, 
            required: true, 
            uppercase: true 
        },
        quantity: { 
            type: Number, 
            required: true,
            min: 1
        },
        targetPrice: { 
            type: Number, 
            required: function() {
                return this.orderType === 'LIMIT';
            }
        },
        stopPrice: {
            type: Number,
            required: function() {
                return this.orderType === 'STOP_LOSS';
            }
        },
        orderType: { 
            type: String, 
            enum: ["LIMIT", "STOP_LOSS"], 
            required: true 
        },
        tradeType: { 
            type: String, 
            enum: ["BUY", "SELL"], 
            required: true 
        },
        status: { 
            type: String, 
            enum: ["PENDING", "EXECUTED", "CANCELLED", "FAILED", "EXPIRED"], 
            default: "PENDING" 
        },
        executedPrice: { 
            type: Number 
        },
        executedAt: { 
            type: Date 
        },
        failureReason: { 
            type: String 
        },
        expiresAt: {
            type: Date,
            default: function() {
                // Default: 30 days from now
                return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            }
        },
        notes: {
            type: String
        }
    },
    { 
        timestamps: true 
    }
);

// Indexes for faster queries
pendingOrderSchema.index({ user: 1, status: 1 });
pendingOrderSchema.index({ symbol: 1, status: 1 });
pendingOrderSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model("PendingOrder", pendingOrderSchema);
