const Algorithm = require('../models/Algorithm');
const BacktestEngine = require('../services/backtestService');
const { getAllStockData } = require('../services/stockService');

/**
 * @desc    Create new algorithm
 * @route   POST /api/algo
 * @access  Private
 */
exports.createAlgorithm = async (req, res) => {
    try {
        const { name, description, type, strategy, symbols } = req.body;

        // Validate strategy
        if (!strategy.entry || !strategy.exit) {
            return res.status(400).json({
                message: 'Entry and exit conditions are required'
            });
        }

        const algorithm = await Algorithm.create({
            user: req.user._id,
            name,
            description,
            type,
            strategy,
            symbols,
            status: 'draft'
        });

        console.log(`✅ Algorithm created: ${name} by user ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Algorithm created successfully',
            algorithm
        });

    } catch (error) {
        console.error('Create algo error:', error);
        res.status(500).json({
            message: 'Failed to create algorithm',
            error: error.message
        });
    }
};

/**
 * @desc    Get user's algorithms
 * @route   GET /api/algo
 * @access  Private
 */
exports.getAlgorithms = async (req, res) => {
    try {
        const algorithms = await Algorithm.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: algorithms.length,
            algorithms
        });

    } catch (error) {
        console.error('Get algos error:', error);
        res.status(500).json({
            message: 'Failed to fetch algorithms',
            error: error.message
        });
    }
};

/**
 * @desc    Get single algorithm
 * @route   GET /api/algo/:id
 * @access  Private
 */
exports.getAlgorithm = async (req, res) => {
    try {
        const algorithm = await Algorithm.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!algorithm) {
            return res.status(404).json({
                message: 'Algorithm not found'
            });
        }

        res.json({
            success: true,
            algorithm
        });

    } catch (error) {
        console.error('Get algo error:', error);
        res.status(500).json({
            message: 'Failed to fetch algorithm',
            error: error.message
        });
    }
};

/**
 * @desc    Update algorithm
 * @route   PUT /api/algo/:id
 * @access  Private
 */
exports.updateAlgorithm = async (req, res) => {
    try {
        const algorithm = await Algorithm.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!algorithm) {
            return res.status(404).json({
                message: 'Algorithm not found'
            });
        }

        // Don't allow updates to active algorithms
        if (algorithm.status === 'active') {
            return res.status(400).json({
                message: 'Cannot update active algorithm. Stop it first.'
            });
        }

        const { name, description, strategy, symbols } = req.body;

        if (name) algorithm.name = name;
        if (description) algorithm.description = description;
        if (strategy) algorithm.strategy = strategy;
        if (symbols) algorithm.symbols = symbols;

        await algorithm.save();

        res.json({
            success: true,
            message: 'Algorithm updated successfully',
            algorithm
        });

    } catch (error) {
        console.error('Update algo error:', error);
        res.status(500).json({
            message: 'Failed to update algorithm',
            error: error.message
        });
    }
};

/**
 * @desc    Delete algorithm
 * @route   DELETE /api/algo/:id
 * @access  Private
 */
exports.deleteAlgorithm = async (req, res) => {
    try {
        const algorithm = await Algorithm.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!algorithm) {
            return res.status(404).json({
                message: 'Algorithm not found'
            });
        }

        // Don't allow deletion of active algorithms
        if (algorithm.status === 'active') {
            return res.status(400).json({
                message: 'Cannot delete active algorithm. Stop it first.'
            });
        }

        await algorithm.deleteOne();

        res.json({
            success: true,
            message: 'Algorithm deleted successfully'
        });

    } catch (error) {
        console.error('Delete algo error:', error);
        res.status(500).json({
            message: 'Failed to delete algorithm',
            error: error.message
        });
    }
};

/**
 * @desc    Run backtest on algorithm
 * @route   POST /api/algo/:id/backtest
 * @access  Private
 */
exports.backtestAlgorithm = async (req, res) => {
    try {
        const algorithm = await Algorithm.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!algorithm) {
            return res.status(404).json({
                message: 'Algorithm not found'
            });
        }

        console.log(`🔬 Running backtest for: ${algorithm.name}`);

        // Update status
        algorithm.status = 'backtesting';
        await algorithm.save();

        // Run backtest for each symbol
        const symbol = algorithm.symbols[0]; // For now, test first symbol
        
        const backtester = new BacktestEngine(algorithm);
        const results = await backtester.runBacktest(symbol);

        // Save results
        algorithm.backtestResults = {
            totalTrades: results.totalTrades,
            winningTrades: results.winningTrades,
            losingTrades: results.losingTrades,
            winRate: parseFloat(results.winRate),
            totalReturn: parseFloat(results.totalReturn),
            profitFactor: parseFloat(results.profitFactor),
            avgWin: parseFloat(results.avgWin),
            avgLoss: parseFloat(results.avgLoss),
            backtestPeriod: {
                start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                end: new Date()
            }
        };

        algorithm.trades = results.trades;
        algorithm.status = 'draft';
        await algorithm.save();

        console.log(`✅ Backtest complete: ${results.totalTrades} trades, ${results.winRate}% win rate`);

        res.json({
            success: true,
            message: 'Backtest completed successfully',
            results: algorithm.backtestResults,
            trades: results.trades
        });

    } catch (error) {
        console.error('Backtest error:', error);
        
        // Update status on error
        try {
            const algorithm = await Algorithm.findById(req.params.id);
            if (algorithm) {
                algorithm.status = 'draft';
                await algorithm.save();
            }
        } catch (e) {
            console.error('Error updating status:', e);
        }

        res.status(500).json({
            message: 'Backtest failed',
            error: error.message
        });
    }
};

/**
 * @desc    Activate algorithm for live trading
 * @route   POST /api/algo/:id/activate
 * @access  Private
 */
exports.activateAlgorithm = async (req, res) => {
    try {
        const algorithm = await Algorithm.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!algorithm) {
            return res.status(404).json({
                message: 'Algorithm not found'
            });
        }

        // Require backtest before activation
        if (!algorithm.backtestResults || algorithm.backtestResults.totalTrades === 0) {
            return res.status(400).json({
                message: 'Run backtest before activating algorithm'
            });
        }

        algorithm.status = 'active';
        algorithm.isActive = true;
        algorithm.lastRun = new Date();
        await algorithm.save();

        console.log(`🚀 Algorithm activated: ${algorithm.name}`);

        res.json({
            success: true,
            message: 'Algorithm activated successfully',
            algorithm
        });

    } catch (error) {
        console.error('Activate algo error:', error);
        res.status(500).json({
            message: 'Failed to activate algorithm',
            error: error.message
        });
    }
};

/**
 * @desc    Pause/Stop algorithm
 * @route   POST /api/algo/:id/stop
 * @access  Private
 */
exports.stopAlgorithm = async (req, res) => {
    try {
        const algorithm = await Algorithm.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!algorithm) {
            return res.status(404).json({
                message: 'Algorithm not found'
            });
        }

        algorithm.status = 'paused';
        algorithm.isActive = false;
        await algorithm.save();

        console.log(`⏸️ Algorithm stopped: ${algorithm.name}`);

        res.json({
            success: true,
            message: 'Algorithm stopped successfully',
            algorithm
        });

    } catch (error) {
        console.error('Stop algo error:', error);
        res.status(500).json({
            message: 'Failed to stop algorithm',
            error: error.message
        });
    }
};

/**
 * @desc    Get algorithm performance stats
 * @route   GET /api/algo/:id/stats
 * @access  Private
 */
exports.getAlgorithmStats = async (req, res) => {
    try {
        const algorithm = await Algorithm.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!algorithm) {
            return res.status(404).json({
                message: 'Algorithm not found'
            });
        }

        // Calculate detailed stats
        const stats = {
            backtest: algorithm.backtestResults,
            live: algorithm.livePerformance,
            recentTrades: algorithm.trades.slice(-10), // Last 10 trades
            status: algorithm.status,
            isActive: algorithm.isActive,
            lastRun: algorithm.lastRun
        };

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};

/**
 * @desc    Get available strategy templates
 * @route   GET /api/algo/templates
 * @access  Private
 */
exports.getTemplates = async (req, res) => {
    try {
        const templates = [
            {
                name: 'RSI Oversold',
                description: 'Buy when RSI < 30, Sell when RSI > 70',
                type: 'momentum',
                strategy: {
                    entry: {
                        indicator: 'RSI',
                        condition: 'less_than',
                        value: 30,
                        timeframe: '1d'
                    },
                    exit: {
                        indicator: 'RSI',
                        condition: 'greater_than',
                        value: 70,
                        stopLoss: 5,
                        takeProfit: 10
                    },
                    sizing: {
                        type: 'percent_of_capital',
                        amount: 10
                    }
                }
            },
            {
                name: 'Moving Average Crossover',
                description: 'Buy when SMA20 crosses above SMA50',
                type: 'technical',
                strategy: {
                    entry: {
                        indicator: 'SMA_CROSS',
                        condition: 'crosses_above',
                        value: 0,
                        timeframe: '1d'
                    },
                    exit: {
                        indicator: 'SMA_CROSS',
                        condition: 'crosses_below',
                        value: 0,
                        stopLoss: 3,
                        takeProfit: 8
                    },
                    sizing: {
                        type: 'percent_of_capital',
                        amount: 15
                    }
                }
            },
            {
                name: 'MACD Signal',
                description: 'Buy when MACD crosses above signal line',
                type: 'momentum',
                strategy: {
                    entry: {
                        indicator: 'MACD',
                        condition: 'crosses_above',
                        value: 0,
                        timeframe: '1d'
                    },
                    exit: {
                        indicator: 'MACD',
                        condition: 'crosses_below',
                        value: 0,
                        stopLoss: 4,
                        takeProfit: 12
                    },
                    sizing: {
                        type: 'percent_of_capital',
                        amount: 12
                    }
                }
            }
        ];

        res.json({
            success: true,
            templates
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch templates',
            error: error.message
        });
    }
};
