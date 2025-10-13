import React, { useState } from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Bar,
} from 'recharts';
import { formatCurrency } from '../utils/currencyFormatter';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

// Candlestick Shape Component
const Candlestick = (props) => {
    const { x, y, width, height, payload } = props;
    const { open, close, high, low } = payload;

    const isBullish = close >= open;
    const fill = isBullish ? '#10b981' : '#ef4444';
    const stroke = isBullish ? '#059669' : '#dc2626';

    const chartHeight = height || 1;
    const minY = Math.min(open, close, high, low);
    const maxY = Math.max(open, close, high, low);
    const priceRange = maxY - minY;

    if (priceRange <= 0) {
        return (
            <line
                x1={x}
                y1={y}
                x2={x + width}
                y2={y}
                stroke={stroke}
                strokeWidth={2}
            />
        );
    }

    const scaleY = (val) => {
        return chartHeight * ((maxY - val) / priceRange);
    };

    const bodyY = y + scaleY(Math.max(open, close));
    const bodyHeight = Math.max(2, Math.abs(scaleY(open) - scaleY(close)));
    const wickTop = y + scaleY(high);
    const wickBottom = y + scaleY(low);

    return (
        <g>
            {/* Wick */}
            <line
                x1={x + width / 2}
                y1={wickTop}
                x2={x + width / 2}
                y2={wickBottom}
                stroke={stroke}
                strokeWidth={2}
            />
            {/* Body */}
            <rect
                x={x}
                y={bodyY}
                width={width}
                height={bodyHeight}
                fill={fill}
                stroke={stroke}
                strokeWidth={1}
                rx={1}
            />
        </g>
    );
};

const CandlestickChart = ({ data }) => {
    const [showVolume, setShowVolume] = useState(false);

    if (!data || data.length === 0) {
        return (
            <div className="h-96 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 text-lg font-medium mb-2">No candlestick data available</p>
                <p className="text-slate-500 text-sm">Chart data will appear here</p>
            </div>
        );
    }

    // Calculate overall trend
    const firstClose = data[0].close;
    const lastClose = data[data.length - 1].close;
    const overallChange = lastClose - firstClose;
    const overallPercent = ((overallChange / firstClose) * 100).toFixed(2);
    const isOverallUp = overallChange >= 0;

    // Calculate bullish/bearish days
    const bullishDays = data.filter(d => d.close >= d.open).length;
    const bearishDays = data.length - bullishDays;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            const dayChange = d.close - d.open;
            const dayPercent = ((dayChange / d.open) * 100).toFixed(2);
            const isDayUp = dayChange >= 0;

            return (
                <div className="bg-slate-900/95 backdrop-blur-xl p-4 rounded-lg border border-slate-800/50 shadow-xl">
                    <p className="text-white font-semibold mb-3">{label}</p>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-6">
                            <span className="text-slate-400">Open:</span>
                            <span className="text-white font-medium">{formatCurrency(d.open)}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                            <span className="text-slate-400">High:</span>
                            <span className="text-emerald-400 font-medium">{formatCurrency(d.high)}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                            <span className="text-slate-400">Low:</span>
                            <span className="text-red-400 font-medium">{formatCurrency(d.low)}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                            <span className="text-slate-400">Close:</span>
                            <span className="text-white font-medium">{formatCurrency(d.close)}</span>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 mt-3 pt-3 border-t border-slate-700 text-sm font-semibold ${
                        isDayUp ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                        {isDayUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {isDayUp ? '+' : ''}{dayPercent}%
                    </div>
                </div>
            );
        }
        return null;
    };

    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const domainPadding = (maxPrice - minPrice) * 0.1;

    return (
        <div className="space-y-4">
            {/* Chart Header with Stats */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        isOverallUp 
                            ? 'bg-emerald-500/10 border border-emerald-500/20' 
                            : 'bg-red-500/10 border border-red-500/20'
                    }`}>
                        {isOverallUp ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm font-semibold ${
                            isOverallUp ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                            {isOverallUp ? '+' : ''}{overallPercent}%
                        </span>
                    </div>
                    <div className="text-xs text-slate-400">
                        <span className="text-emerald-400 font-medium">{bullishDays}</span> bullish / 
                        <span className="text-red-400 font-medium ml-1">{bearishDays}</span> bearish days
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-96 w-full bg-slate-900/30 rounded-xl p-4 border border-slate-800/50">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickLine={{ stroke: '#475569' }}
                            axisLine={{ stroke: '#475569' }}
                            tickFormatter={(str) =>
                                new Date(str).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                })
                            }
                        />
                        <YAxis
                            domain={[minPrice - domainPadding, maxPrice + domainPadding]}
                            orientation="right"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickLine={{ stroke: '#475569' }}
                            axisLine={{ stroke: '#475569' }}
                            tickFormatter={(val) => `₹${val.toLocaleString()}`}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                        />
                        <Bar
                            dataKey="close"
                            barSize={8}
                            shape={<Candlestick />}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                    <span className="text-slate-400">Bullish (Close grater than Open)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-slate-400">Bearish (Close less than Open)</span>
                </div>
            </div>
        </div>
    );
};

export default CandlestickChart;
