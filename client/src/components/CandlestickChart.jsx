import { useState, useMemo } from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Bar,
    Line,
    ReferenceLine,
} from 'recharts';
import { formatCurrency } from '../utils/currencyFormatter';
import { 
    TrendingUp, TrendingDown, Activity, BarChart3, 
    Maximize2, Download, Settings 
} from 'lucide-react';

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
                strokeWidth={1.5}
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

const CandlestickChart = ({ data, symbol = 'STOCK' }) => {
    const [showMA, setShowMA] = useState(true);
    const [showVolume, setShowVolume] = useState(false);
    const [chartHeight, setChartHeight] = useState(400);

    // Calculate statistics
    const stats = useMemo(() => {
        if (!data || data.length === 0) return null;

        const prices = data.map(d => d.close);
        const firstClose = data[0].close;
        const lastClose = data[data.length - 1].close;
        const overallChange = lastClose - firstClose;
        const overallPercent = ((overallChange / firstClose) * 100).toFixed(2);
        
        const highest = Math.max(...data.map(d => d.high));
        const lowest = Math.min(...data.map(d => d.low));
        const avgVolume = data.reduce((sum, d) => sum + (d.volume || 0), 0) / data.length;
        
        const bullishDays = data.filter(d => d.close >= d.open).length;
        const bearishDays = data.length - bullishDays;

        // Calculate 20-day moving average
        const ma20 = data.map((d, i) => {
            if (i < 19) return { ...d, ma: null };
            const sum = data.slice(i - 19, i + 1).reduce((acc, cur) => acc + cur.close, 0);
            return { ...d, ma: sum / 20 };
        });

        return {
            firstClose,
            lastClose,
            overallChange,
            overallPercent,
            isOverallUp: overallChange >= 0,
            highest,
            lowest,
            avgVolume,
            bullishDays,
            bearishDays,
            dataWithMA: ma20
        };
    }, [data]);

    if (!data || data.length === 0 || !stats) {
        return (
            <div className="h-96 flex flex-col items-center justify-center bg-slate-900/30 rounded-xl border border-slate-800/50">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 text-lg font-medium mb-2">No chart data available</p>
                <p className="text-slate-500 text-sm">Historical price data will appear here</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            const dayChange = d.close - d.open;
            const dayPercent = ((dayChange / d.open) * 100).toFixed(2);
            const isDayUp = dayChange >= 0;

            return (
                <div className="bg-slate-900/98 backdrop-blur-xl p-4 rounded-lg border border-slate-700/50 shadow-2xl">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-white font-bold">{d.date}</p>
                        <div className={`flex items-center gap-1 text-sm font-semibold ${
                            isDayUp ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                            {isDayUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {isDayUp ? '+' : ''}{dayPercent}%
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-8">
                            <span className="text-slate-400">Open</span>
                            <span className="text-white font-medium">{formatCurrency(d.open)}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                            <span className="text-slate-400">High</span>
                            <span className="text-emerald-400 font-medium">{formatCurrency(d.high)}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                            <span className="text-slate-400">Low</span>
                            <span className="text-red-400 font-medium">{formatCurrency(d.low)}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                            <span className="text-slate-400">Close</span>
                            <span className="text-white font-bold">{formatCurrency(d.close)}</span>
                        </div>
                        {d.volume && (
                            <div className="flex justify-between gap-8 pt-2 border-t border-slate-700">
                                <span className="text-slate-400">Volume</span>
                                <span className="text-blue-400 font-medium">{d.volume.toLocaleString()}</span>
                            </div>
                        )}
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

    const downloadChart = () => {
        // Convert chart data to CSV
        const headers = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'];
        const csvContent = [
            headers.join(','),
            ...data.map(d => [d.date, d.open, d.high, d.low, d.close, d.volume || 0].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${symbol}-chart-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-4">
            {/* Chart Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Overall Performance */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                        stats.isOverallUp 
                            ? 'bg-emerald-500/10 border-emerald-500/30' 
                            : 'bg-red-500/10 border-red-500/30'
                    }`}>
                        {stats.isOverallUp ? (
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        ) : (
                            <TrendingDown className="w-5 h-5 text-red-400" />
                        )}
                        <div>
                            <div className={`text-lg font-bold ${
                                stats.isOverallUp ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                                {stats.isOverallUp ? '+' : ''}{stats.overallPercent}%
                            </div>
                            <div className="text-xs text-slate-500">Period Return</div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="flex gap-4 text-sm">
                        <div className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <div className="text-slate-400 text-xs mb-1">High</div>
                            <div className="text-emerald-400 font-bold">{formatCurrency(stats.highest)}</div>
                        </div>
                        <div className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <div className="text-slate-400 text-xs mb-1">Low</div>
                            <div className="text-red-400 font-bold">{formatCurrency(stats.lowest)}</div>
                        </div>
                        <div className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <div className="text-slate-400 text-xs mb-1">Days</div>
                            <div className="text-white font-bold">
                                <span className="text-emerald-400">{stats.bullishDays}</span>
                                <span className="text-slate-600 mx-1">/</span>
                                <span className="text-red-400">{stats.bearishDays}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowMA(!showMA)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            showMA 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'
                        }`}
                    >
                        MA(20)
                    </button>
                    <button
                        onClick={downloadChart}
                        className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors"
                        title="Download CSV"
                    >
                        <Download size={18} className="text-slate-400" />
                    </button>
                    <button
                        onClick={() => setChartHeight(chartHeight === 400 ? 600 : 400)}
                        className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors"
                        title="Toggle size"
                    >
                        <Maximize2 size={18} className="text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Chart Container */}
            <div 
                className="w-full bg-slate-900/50 rounded-xl p-6 border border-slate-800/50 backdrop-blur-sm"
                style={{ height: chartHeight }}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={showMA ? stats.dataWithMA : data}
                        margin={{ top: 10, right: 40, left: 0, bottom: 20 }}
                    >
                        <defs>
                            <linearGradient id="maGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="#334155" 
                            opacity={0.2}
                            vertical={false}
                        />
                        
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickLine={{ stroke: '#475569' }}
                            axisLine={{ stroke: '#475569' }}
                            height={60}
                            angle={-45}
                            textAnchor="end"
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
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickLine={{ stroke: '#475569' }}
                            axisLine={{ stroke: '#475569' }}
                            tickFormatter={(val) => `₹${val.toLocaleString()}`}
                            width={80}
                        />
                        
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(148, 163, 184, 0.03)' }}
                        />

                        {/* Moving Average Line */}
                        {showMA && (
                            <Line
                                type="monotone"
                                dataKey="ma"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: '#3b82f6' }}
                                connectNulls
                            />
                        )}

                        {/* Reference line at average price */}
                        <ReferenceLine
                            y={(stats.highest + stats.lowest) / 2}
                            stroke="#6366f1"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                            opacity={0.3}
                        />
                        
                        <Bar
                            dataKey="close"
                            barSize={Math.max(6, Math.min(20, 400 / data.length))}
                            shape={<Candlestick />}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs bg-slate-900/30 rounded-lg p-3 border border-slate-800/50">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                    <span className="text-slate-400">Bullish (Close ≥ Open)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-slate-400">Bearish (Close &lt; Open)</span>
                </div>
                {showMA && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-blue-500"></div>
                        <span className="text-slate-400">20-Day Moving Average</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-indigo-500 border-dashed border-t"></div>
                    <span className="text-slate-400">Mid Price Reference</span>
                </div>
            </div>
        </div>
    );
};

export default CandlestickChart;
