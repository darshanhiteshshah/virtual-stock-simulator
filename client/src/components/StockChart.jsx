import React from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../utils/currencyFormatter';

const StockChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-500">No chart data available.</div>;
    }

    // --- FIX: Use the 'close' price from the data ---
    const startPrice = data[0].close;
    const endPrice = data[data.length - 1].close;
    const isUp = endPrice >= startPrice;
    const strokeColor = isUp ? '#22c55e' : '#ef4444';
    const gradientColor = isUp ? 'url(#priceGradientUp)' : 'url(#priceGradientDown)';

    // Custom Tooltip for a better look
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <p className="text-gray-400 text-sm">{label}</p>
                    <p className="text-white font-bold">{formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-64 w-full mt-4">
            <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <defs>
                        <linearGradient id="priceGradientUp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
                        </linearGradient>
                         <linearGradient id="priceGradientDown" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#9ca3af', fontSize: 12 }} 
                        tickFormatter={(str) => new Date(str).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        axisLine={{ stroke: '#4b5563' }}
                        tickLine={{ stroke: '#4b5563' }}
                    />
                    <YAxis 
                        domain={['dataMin - 20', 'dataMax + 20']}
                        tick={{ fill: '#9ca3af', fontSize: 12 }} 
                        tickFormatter={(val) => `₹${val.toLocaleString()}`}
                        axisLine={{ stroke: '#4b5563' }}
                        tickLine={{ stroke: '#4b5563' }}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <Tooltip content={<CustomTooltip />} />
                    {/* --- FIX: Use dataKey="close" instead of "price" --- */}
                    <Area type="monotone" dataKey="close" stroke={strokeColor} strokeWidth={2} fill={gradientColor} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StockChart;