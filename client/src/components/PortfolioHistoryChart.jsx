import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { getPortfolioHistory } from '../services/userService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateFormatter';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 backdrop-blur-xl p-4 rounded-lg border border-slate-800/50 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-300 text-xs font-medium">{formatDate(label)}</p>
                </div>
                <p className="text-white text-lg font-bold">{formatCurrency(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

const PortfolioHistoryChart = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('all'); // 'week', 'month', 'all'

    useEffect(() => {
        const fetchHistory = async () => {
            if (user?.token) {
                try {
                    const res = await getPortfolioHistory(user.token);
                    setData(res.data);
                } catch (error) {
                    console.error("Failed to fetch portfolio history", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchHistory();
    }, [user]);

    // Filter data based on time range
    const filteredData = React.useMemo(() => {
        if (timeRange === 'all') return data;
        
        const now = new Date();
        const cutoffDays = timeRange === 'week' ? 7 : 30;
        const cutoffDate = new Date(now.setDate(now.getDate() - cutoffDays));
        
        return data.filter(item => new Date(item.date) >= cutoffDate);
    }, [data, timeRange]);

    // Calculate performance metrics
    const performanceMetrics = React.useMemo(() => {
        if (filteredData.length < 2) return null;
        
        const firstValue = filteredData[0].netWorth;
        const lastValue = filteredData[filteredData.length - 1].netWorth;
        const change = lastValue - firstValue;
        const changePercent = ((change / firstValue) * 100).toFixed(2);
        
        return {
            change,
            changePercent,
            isPositive: change >= 0
        };
    }, [filteredData]);

    if (isLoading) {
        return (
            <div className="h-80 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Loading chart data...</p>
                </div>
            </div>
        );
    }
    
    if (data.length < 2) {
        return (
            <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 text-lg font-medium mb-2">No performance data yet</p>
                    <p className="text-slate-500 text-sm">Check back tomorrow to see your portfolio growth</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Time Range Selector & Performance Metrics */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setTimeRange('week')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            timeRange === 'week'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                        }`}
                    >
                        1W
                    </button>
                    <button
                        onClick={() => setTimeRange('month')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            timeRange === 'month'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                        }`}
                    >
                        1M
                    </button>
                    <button
                        onClick={() => setTimeRange('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            timeRange === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                        }`}
                    >
                        All
                    </button>
                </div>

                {performanceMetrics && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        performanceMetrics.isPositive 
                            ? 'bg-emerald-500/10 border border-emerald-500/20' 
                            : 'bg-red-500/10 border border-red-500/20'
                    }`}>
                        {performanceMetrics.isPositive ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm font-semibold ${
                            performanceMetrics.isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                            {performanceMetrics.isPositive ? '+' : ''}{performanceMetrics.changePercent}%
                        </span>
                        <span className={`text-xs ${
                            performanceMetrics.isPositive ? 'text-emerald-400/70' : 'text-red-400/70'
                        }`}>
                            ({performanceMetrics.isPositive ? '+' : ''}{formatCurrency(performanceMetrics.change)})
                        </span>
                    </div>
                )}
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                        tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1 }} />
                    <Area 
                        type="monotone" 
                        dataKey="netWorth" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        fill="url(#colorNetWorth)"
                        animationDuration={800}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PortfolioHistoryChart;
