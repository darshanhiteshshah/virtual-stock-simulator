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
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const StockChart = ({ data, symbol }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-80 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 text-lg font-medium mb-2">No chart data available</p>
                <p className="text-slate-500 text-sm">Historical data will appear here</p>
            </div>
        );
    }

    const startPrice = data[0].close;
    const endPrice = data[data.length - 1].close;
    const priceChange = endPrice - startPrice;
    const percentChange = ((priceChange / startPrice) * 100).toFixed(2);
    const isUp = priceChange >= 0;
    
    const strokeColor = isUp ? '#10b981' : '#ef4444';
    const gradientId = isUp ? 'priceGradientUp' : 'priceGradientDown';

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/95 backdrop-blur-xl p-4 rounded-lg border border-slate-800/50 shadow-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-300 text-xs font-medium">
                            {new Date(label).toLocaleDateString('en-IN', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                    <p className="text-white text-lg font-bold">
                        {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Chart Header with Stats */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-sm mb-1">Price Movement</p>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-white">
                            {formatCurrency(endPrice)}
                        </span>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold ${
                            isUp 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                            {isUp ? (
                                <TrendingUp size={14} />
                            ) : (
                                <TrendingDown size={14} />
                            )}
                            {isUp ? '+' : ''}{percentChange}%
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-slate-400 text-xs mb-1">Period Change</p>
                    <p className={`text-lg font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isUp ? '+' : ''}{formatCurrency(Math.abs(priceChange))}
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-80 w-full bg-slate-900/30 rounded-xl p-4 border border-slate-800/50">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fill: '#94a3b8', fontSize: 12 }} 
                            tickLine={{ stroke: '#475569' }}
                            axisLine={{ stroke: '#475569' }}
                            tickFormatter={(str) => new Date(str).toLocaleDateString('en-IN', { 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        />
                        <YAxis 
                            domain={['auto', 'auto']}
                            tick={{ fill: '#94a3b8', fontSize: 12 }} 
                            tickLine={{ stroke: '#475569' }}
                            axisLine={{ stroke: '#475569' }}
                            tickFormatter={(val) => `₹${val.toLocaleString()}`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1 }} />
                        <Area 
                            type="monotone" 
                            dataKey="close" 
                            stroke={strokeColor} 
                            strokeWidth={3} 
                            fill={`url(#${gradientId})`}
                            animationDuration={800}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Chart Footer Info */}
            <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Data points: {data.length}</span>
                <span>
                    {new Date(data[0].date).toLocaleDateString('en-IN')} - {new Date(data[data.length - 1].date).toLocaleDateString('en-IN')}
                </span>
            </div>
        </div>
    );
};

export default StockChart;
