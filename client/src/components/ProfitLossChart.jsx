import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell
} from 'recharts';
import { formatCurrency } from '../utils/currencyFormatter';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isProfit = data.profitLoss >= 0;
        return (
            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <p className="text-gray-300 font-semibold">{label}</p>
                <p className={`font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfit ? 'Profit: ' : 'Loss: '}
                    {formatCurrency(Math.abs(data.profitLoss))}
                </p>
            </div>
        );
    }
    return null;
};

const ProfitLossChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
             <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800 h-full flex flex-col items-center justify-center">
                <TrendingUp className="text-gray-600 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-400">No Profit/Loss Data</h3>
                <p className="text-sm text-gray-500">Trade stocks to see your performance here.</p>
            </div>
        );
    }

    return (
        <motion.div 
            className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800 h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
        >
            <h2 className="text-2xl font-bold text-orange-400 mb-4 flex items-center gap-2">
                <TrendingUp size={24} /> Profit & Loss Breakdown
            </h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="symbol" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}/>
                        <Bar dataKey="profitLoss">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.profitLoss >= 0 ? '#22c55e' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default ProfitLossChart;
    