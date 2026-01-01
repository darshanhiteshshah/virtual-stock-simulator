const mongoose = require('mongoose');

const dividendSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        uppercase: true
    },
    amount: {
        type: Number,
        required: true
    },
    exDate: {
        type: Date,
        required: true
    },
    recordDate: {
        type: Date
    },
    paymentDate: {
        type: Date
    },
    frequency: {
        type: String,
        enum: ['QUARTERLY', 'ANNUAL', 'SEMI_ANNUAL'],
        default: 'QUARTERLY'
    },
    yield: {
        type: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Dividend', dividendSchema);
