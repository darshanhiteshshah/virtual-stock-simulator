import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
    ReferenceLine
} from 'recharts';
import { formatCurrency } from '../utils/currencyFormatter';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isProfit = data.profitLoss >= 0;
        return (
            <div className="bg-slate-900/95 backdrop-blur-xl p-4 rounded-lg border border-slate-800/50 shadow-xl">
                <p className="text-white font-semibold mb-2">{label}</p>
                <div className="flex items-center gap-2">
                    {isProfit ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(Math.abs(data.profitLoss))}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

const ProfitLossChart = ({ data }) => {
    // Calculate summary metrics
    const summary = React.useMemo(() => {
        if (!data || data.length === 0) return null;
        
        const totalProfit = data
            .filter(item => item.profitLoss > 0)
            .reduce((sum, item) => sum + item.profitLoss, 0);
        
        const totalLoss = data
            .filter(item => item.profitLoss < 0)
            .reduce((sum, item) => sum + Math.abs(item.profitLoss), 0);
        
        const netPL = totalProfit - totalLoss;
        
        return {
            totalProfit,
            totalLoss,
            netPL,
            isNetPositive: netPL >= 0,
            winRate: data.length > 0 ? ((data.filter(item => item.profitLoss > 0).length / data.length) * 100).toFixed(0) : 0
        };
    }, [data]);

    if (!data || data.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-400 mb-2">No P/L Data</h3>
                <p className="text-sm text-slate-500 text-center max-w-xs">
                    Trade stocks to see your profit and loss breakdown
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-emerald-400/70 text-xs mb-1">Total Gains</p>
                    <p className="text-emerald-400 font-bold text-lg">
                        {formatCurrency(summary.totalProfit)}
                    </p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400/70 text-xs mb-1">Total Losses</p>
                    <p className="text-red-400 font-bold text-lg">
                        {formatCurrency(summary.totalLoss)}
                    </p>
                </div>
            </div>

            {/* Net P/L Badge */}
            <div className={`flex items-center justify-between px-4 py-3 rounded-lg mb-4 ${
                summary.isNetPositive 
                    ? 'bg-emerald-500/10 border border-emerald-500/20' 
                    : 'bg-red-500/10 border border-red-500/20'
            }`}>
                <span className="text-slate-300 text-sm font-medium">Net P/L</span>
                <div className="flex items-center gap-2">
                    {summary.isNetPositive ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`font-bold ${
                        summary.isNetPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                        {formatCurrency(Math.abs(summary.netPL))}
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        data={data} 
                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis 
                            dataKey="symbol" 
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickLine={{ stroke: '#475569' }}
                            axisLine={{ stroke: '#475569' }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis 
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickLine={{ stroke: '#475569' }}
                            axisLine={{ stroke: '#475569' }}
                            tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                        />
                        <ReferenceLine 
                            y={0} 
                            stroke="#475569" 
                            strokeWidth={2}
                            strokeDasharray="3 3"
                        />
                        <Bar dataKey="profitLoss" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.profitLoss >= 0 ? '#10b981' : '#ef4444'} 
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Win Rate Footer */}
            <div className="mt-4 text-center">
                <span className="text-slate-400 text-xs">
                    Win Rate: <span className="text-white font-semibold">{summary.winRate}%</span>
                </span>
            </div>
        </div>
    );
};

export default ProfitLossChart;
