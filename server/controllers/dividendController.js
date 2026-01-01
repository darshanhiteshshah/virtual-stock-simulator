const Dividend = require('../models/Dividend');
const User = require('../models/User');

// Get user's dividend income
exports.getUserDividends = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get all dividends for user's holdings
        const symbols = user.portfolio.map(p => p.symbol);
        
        const dividends = await Dividend.find({
            symbol: { $in: symbols },
            exDate: { $lte: new Date() }
        }).sort({ exDate: -1 });

        // Calculate total dividend income
        let totalIncome = 0;
        const dividendDetails = [];

        for (const dividend of dividends) {
            const holding = user.portfolio.find(p => p.symbol === dividend.symbol);
            if (holding) {
                const income = dividend.amount * holding.quantity;
                totalIncome += income;
                
                dividendDetails.push({
                    symbol: dividend.symbol,
                    amount: dividend.amount,
                    quantity: holding.quantity,
                    totalIncome: income,
                    exDate: dividend.exDate,
                    paymentDate: dividend.paymentDate
                });
            }
        }

        res.json({
            totalIncome,
            count: dividendDetails.length,
            dividends: dividendDetails
        });

    } catch (error) {
        console.error('Error fetching dividends:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
};

// Get upcoming dividends
exports.getUpcomingDividends = async (req, res) => {
    try {
        const dividends = await Dividend.find({
            exDate: { $gte: new Date() }
        })
        .sort({ exDate: 1 })
        .limit(50);

        res.json({
            count: dividends.length,
            dividends
        });

    } catch (error) {
        console.error('Error fetching upcoming dividends:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
};
