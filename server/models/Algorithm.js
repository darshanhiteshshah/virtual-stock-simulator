const mongoose = require('mongoose');

const algorithmSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Algorithm name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    type: {
        type: String,
        enum: ['technical', 'momentum', 'mean_reversion', 'custom'],
        default: 'technical'
    },
    strategy: {
        entry: {
            indicator: {
                type: String,
                enum: ['RSI', 'MACD', 'SMA_CROSS', 'EMA_CROSS', 'BOLLINGER', 'CUSTOM']
            },
            condition: {
                type: String,
                enum: ['less_than', 'greater_than', 'crosses_above', 'crosses_below', 'equals']
            },
            value: Number,
            timeframe: {
                type: String,
                enum: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'],
                default: '1d'
            }
        },
        exit: {
            indicator: {
                type: String,
                enum: ['RSI', 'MACD', 'SMA_CROSS', 'EMA_CROSS', 'BOLLINGER', 'CUSTOM']
            },
            condition: {
                type: String,
                enum: ['less_than', 'greater_than', 'crosses_above', 'crosses_below', 'equals']
            },
            value: Number,
            stopLoss: {
                type: Number,
                min: 0,
                max: 100,
                default: 5
            },
            takeProfit: {
                type: Number,
                min: 0,
                max: 100,
                default: 10
            }
        },
        sizing: {
            type: {
                type: String,
                enum: ['fixed', 'percent_of_capital', 'kelly_criterion'],
                default: 'percent_of_capital'
            },
            amount: {
                type: Number,
                required: true,
                min: 0
            }
        }
    },
    symbols: [{
        type: String,
        uppercase: true,
        trim: true
    }],
    status: {
        type: String,
        enum: ['draft', 'backtesting', 'active', 'paused', 'stopped'],
        default: 'draft',
        index: true
    },
    backtestResults: {
        totalTrades: {
            type: Number,
            default: 0
        },
        winningTrades: {
            type: Number,
            default: 0
        },
        losingTrades: {
            type: Number,
            default: 0
        },
        winRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        totalReturn: {
            type: Number,
            default: 0
        },
        maxDrawdown: {
            type: Number,
            default: 0
        },
        sharpeRatio: {
            type: Number,
            default: 0
        },
        profitFactor: {
            type: Number,
            default: 0
        },
        avgWin: {
            type: Number,
            default: 0
        },
        avgLoss: {
            type: Number,
            default: 0
        },
        finalCapital: {
            type: Number,
            default: 0
        },
        backtestPeriod: {
            start: Date,
            end: Date
        }
    },
    livePerformance: {
        totalTrades: {
            type: Number,
            default: 0
        },
        winningTrades: {
            type: Number,
            default: 0
        },
        losingTrades: {
            type: Number,
            default: 0
        },
        totalReturn: {
            type: Number,
            default: 0
        },
        currentDrawdown: {
            type: Number,
            default: 0
        },
        lastTrade: Date
    },
    trades: [{
        symbol: String,
        type: {
            type: String,
            enum: ['LONG', 'SHORT']
        },
        quantity: Number,
        entryPrice: Number,
        exitPrice: Number,
        entryTime: Date,
        exitTime: Date,
        profit: Number,
        profitPercent: Number,
        reason: {
            type: String,
            enum: ['signal', 'stop_loss', 'take_profit', 'manual', 'backtest_end']
        }
    }],
    isActive: {
        type: Boolean,
        default: false,
        index: true
    },
    lastRun: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true 
});

// Indexes for better query performance
algorithmSchema.index({ user: 1, status: 1 });
algorithmSchema.index({ user: 1, isActive: 1 });
algorithmSchema.index({ createdAt: -1 });

// Virtual for win rate percentage
algorithmSchema.virtual('winRatePercent').get(function() {
    if (this.backtestResults && this.backtestResults.totalTrades > 0) {
        return (this.backtestResults.winningTrades / this.backtestResults.totalTrades * 100).toFixed(2);
    }
    return 0;
});

// Method to check if algorithm is profitable
algorithmSchema.methods.isProfitable = function() {
    return this.backtestResults && this.backtestResults.profitFactor > 1;
};

// Method to calculate live performance metrics
algorithmSchema.methods.updateLivePerformance = function(trade) {
    if (!this.livePerformance) {
        this.livePerformance = {
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            totalReturn: 0,
            currentDrawdown: 0
        };
    }
    
    this.livePerformance.totalTrades += 1;
    if (trade.profit > 0) {
        this.livePerformance.winningTrades += 1;
    } else {
        this.livePerformance.losingTrades += 1;
    }
    this.livePerformance.totalReturn += trade.profitPercent;
    this.livePerformance.lastTrade = trade.exitTime;
};

// Pre-save middleware to validate
algorithmSchema.pre('save', function(next) {
    // Ensure at least one symbol
    if (!this.symbols || this.symbols.length === 0) {
        return next(new Error('At least one symbol is required'));
    }
    
    // Ensure strategy is complete
    if (!this.strategy.entry.indicator || !this.strategy.exit.indicator) {
        return next(new Error('Entry and exit strategies must be defined'));
    }
    
    next();
});

module.exports = mongoose.model('Algorithm', algorithmSchema);
