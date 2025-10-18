const { getHistoryForSymbol } = require('./stockService');

class BacktestEngine {
    constructor(algorithm) {
        this.algorithm = algorithm;
        this.trades = [];
        this.capital = 100000; // Starting capital
        this.currentCapital = this.capital;
        this.positions = {};
    }

    async runBacktest(symbol, startDate, endDate) {
        console.log(`🔬 Running backtest for ${this.algorithm.name}`);

        try {
            // Fetch historical data
            const historicalData = await getHistoryForSymbol(symbol, '1y');
            
            if (!historicalData || historicalData.length === 0) {
                throw new Error('No historical data available');
            }

            // Calculate indicators
            const dataWithIndicators = this.calculateIndicators(historicalData);

            // Simulate trading
            for (let i = 50; i < dataWithIndicators.length; i++) {
                const currentBar = dataWithIndicators[i];
                const previousBar = dataWithIndicators[i - 1];

                // Check entry signal
                if (this.checkEntrySignal(currentBar, previousBar) && !this.positions[symbol]) {
                    this.enterPosition(symbol, currentBar, i);
                }

                // Check exit signal
                if (this.positions[symbol] && this.checkExitSignal(currentBar, previousBar, symbol)) {
                    this.exitPosition(symbol, currentBar, i);
                }
            }

            // Close any open positions
            if (this.positions[symbol]) {
                const lastBar = dataWithIndicators[dataWithIndicators.length - 1];
                this.exitPosition(symbol, lastBar, dataWithIndicators.length - 1, 'backtest_end');
            }

            // Calculate performance metrics
            const results = this.calculatePerformance();
            
            console.log(`✅ Backtest complete: ${this.trades.length} trades`);
            return results;

        } catch (error) {
            console.error('❌ Backtest error:', error);
            throw error;
        }
    }

    calculateIndicators(data) {
        const result = data.map((bar, i, arr) => {
            const enhanced = { ...bar };

            // RSI
            if (i >= 14) {
                const gains = [];
                const losses = [];
                for (let j = i - 13; j <= i; j++) {
                    const change = arr[j].close - arr[j - 1].close;
                    if (change > 0) gains.push(change);
                    else losses.push(Math.abs(change));
                }
                const avgGain = gains.reduce((a, b) => a + b, 0) / 14;
                const avgLoss = losses.reduce((a, b) => a + b, 0) / 14;
                const rs = avgGain / avgLoss;
                enhanced.rsi = 100 - (100 / (1 + rs));
            }

            // SMA
            if (i >= 20) {
                const sma20 = arr.slice(i - 19, i + 1).reduce((sum, b) => sum + b.close, 0) / 20;
                enhanced.sma20 = sma20;
            }
            if (i >= 50) {
                const sma50 = arr.slice(i - 49, i + 1).reduce((sum, b) => sum + b.close, 0) / 50;
                enhanced.sma50 = sma50;
            }

            // MACD
            if (i >= 26) {
                const ema12 = this.calculateEMA(arr.slice(0, i + 1).map(b => b.close), 12);
                const ema26 = this.calculateEMA(arr.slice(0, i + 1).map(b => b.close), 26);
                enhanced.macd = ema12 - ema26;
            }

            return enhanced;
        });

        return result;
    }

    calculateEMA(data, period) {
        const k = 2 / (period + 1);
        let ema = data[0];
        for (let i = 1; i < data.length; i++) {
            ema = data[i] * k + ema * (1 - k);
        }
        return ema;
    }

    checkEntrySignal(current, previous) {
        const { entry } = this.algorithm.strategy;

        switch (entry.indicator) {
            case 'RSI':
                if (entry.condition === 'less_than') {
                    return current.rsi < entry.value && previous.rsi >= entry.value;
                }
                if (entry.condition === 'greater_than') {
                    return current.rsi > entry.value && previous.rsi <= entry.value;
                }
                break;

            case 'SMA_CROSS':
                return current.sma20 > current.sma50 && previous.sma20 <= previous.sma50;

            case 'MACD':
                if (entry.condition === 'crosses_above') {
                    return current.macd > 0 && previous.macd <= 0;
                }
                break;

            default:
                return false;
        }

        return false;
    }

    checkExitSignal(current, previous, symbol) {
        const position = this.positions[symbol];
        const { exit } = this.algorithm.strategy;

        // Check stop loss
        if (exit.stopLoss) {
            const loss = ((current.close - position.entryPrice) / position.entryPrice) * 100;
            if (loss <= -exit.stopLoss) {
                return true;
            }
        }

        // Check take profit
        if (exit.takeProfit) {
            const profit = ((current.close - position.entryPrice) / position.entryPrice) * 100;
            if (profit >= exit.takeProfit) {
                return true;
            }
        }

        // Check indicator exit
        switch (exit.indicator) {
            case 'RSI':
                if (exit.condition === 'greater_than') {
                    return current.rsi > exit.value;
                }
                break;

            case 'SMA_CROSS':
                return current.sma20 < current.sma50 && previous.sma20 >= previous.sma50;
        }

        return false;
    }

    enterPosition(symbol, bar, index) {
        const { sizing } = this.algorithm.strategy;
        
        let investAmount;
        if (sizing.type === 'percent_of_capital') {
            investAmount = this.currentCapital * (sizing.amount / 100);
        } else {
            investAmount = sizing.amount;
        }

        const quantity = Math.floor(investAmount / bar.close);
        const totalCost = quantity * bar.close;

        if (totalCost > this.currentCapital) return;

        this.positions[symbol] = {
            entryPrice: bar.close,
            quantity: quantity,
            entryTime: bar.date,
            entryIndex: index
        };

        this.currentCapital -= totalCost;
        
        console.log(`📈 BUY ${quantity} ${symbol} @ ₹${bar.close}`);
    }

    exitPosition(symbol, bar, index, reason = 'signal') {
        const position = this.positions[symbol];
        if (!position) return;

        const exitValue = position.quantity * bar.close;
        const profit = exitValue - (position.quantity * position.entryPrice);
        const profitPercent = (profit / (position.quantity * position.entryPrice)) * 100;

        this.trades.push({
            symbol,
            type: 'LONG',
            quantity: position.quantity,
            entryPrice: position.entryPrice,
            exitPrice: bar.close,
            entryTime: position.entryTime,
            exitTime: bar.date,
            profit,
            profitPercent,
            reason
        });

        this.currentCapital += exitValue;
        delete this.positions[symbol];

        console.log(`📉 SELL ${position.quantity} ${symbol} @ ₹${bar.close} | P/L: ₹${profit.toFixed(2)}`);
    }

    calculatePerformance() {
        const winningTrades = this.trades.filter(t => t.profit > 0);
        const losingTrades = this.trades.filter(t => t.profit < 0);
        
        const totalReturn = ((this.currentCapital - this.capital) / this.capital) * 100;
        const winRate = (winningTrades.length / this.trades.length) * 100 || 0;
        
        const avgWin = winningTrades.length > 0 
            ? winningTrades.reduce((sum, t) => sum + t.profit, 0) / winningTrades.length 
            : 0;
        const avgLoss = losingTrades.length > 0 
            ? Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length)
            : 0;
        
        const profitFactor = avgLoss > 0 ? (avgWin * winningTrades.length) / (avgLoss * losingTrades.length) : 0;

        return {
            totalTrades: this.trades.length,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            winRate: winRate.toFixed(2),
            totalReturn: totalReturn.toFixed(2),
            finalCapital: this.currentCapital.toFixed(2),
            profitFactor: profitFactor.toFixed(2),
            avgWin: avgWin.toFixed(2),
            avgLoss: avgLoss.toFixed(2),
            trades: this.trades
        };
    }
}

module.exports = BacktestEngine;
