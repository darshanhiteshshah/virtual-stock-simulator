import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../utils/currencyFormatter';
import { PieChart as PieIcon } from 'lucide-react';

// Professional color palette for sectors
const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900/95 backdrop-blur-xl p-4 rounded-lg border border-slate-800/50 shadow-xl">
                <p className="text-white font-semibold mb-2">{data.name}</p>
                <p className="text-slate-300 text-sm mb-1">{formatCurrency(data.value)}</p>
                <div className="flex items-center gap-2">
                    <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: data.fill }}
                    />
                    <span className="text-blue-400 font-semibold">
                        {data.percent.toFixed(1)}%
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

const SectorDonutChart = ({ data }) => {
    // Calculate percentages and prepare data
    const chartData = React.useMemo(() => {
        if (!data || data.length === 0) return [];
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        return data
            .map(item => ({
                ...item,
                percent: (item.value / total) * 100
            }))
            .sort((a, b) => b.value - a.value);
    }, [data]);

    // Find top sector
    const topSector = chartData.length > 0 ? chartData[0] : null;

    if (!data || data.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                    <PieIcon className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-400 mb-2">No Sector Data</h3>
                <p className="text-sm text-slate-500 text-center max-w-xs">
                    Buy stocks to see your portfolio allocation
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Top Sector Highlight */}
            {topSector && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                    <p className="text-slate-400 text-xs mb-1">Largest Allocation</p>
                    <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">{topSector.name}</span>
                        <span className="text-blue-400 font-bold">
                            {topSector.percent.toFixed(1)}%
                        </span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1">
                        {formatCurrency(topSector.value)}
                    </p>
                </div>
            )}

            {/* Chart */}
            <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="#0f172a"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Manual Legend List */}
            <div className="grid grid-cols-2 gap-2 mt-4">
                {chartData.slice(0, 6).map((entry, index) => (
                    <div 
                        key={`legend-${index}`} 
                        className="flex items-center gap-2 text-xs"
                    >
                        <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-slate-300 truncate">{entry.name}</span>
                        <span className="text-slate-400 ml-auto">{entry.percent.toFixed(0)}%</span>
                    </div>
                ))}
            </div>

            {/* Diversification Score */}
            <div className="mt-4 text-center pt-3 border-t border-slate-800/50">
                <span className="text-slate-400 text-xs">
                    Diversification: <span className="text-white font-semibold">
                        {chartData.length} {chartData.length === 1 ? 'Sector' : 'Sectors'}
                    </span>
                </span>
            </div>
        </div>
    );
};

export default SectorDonutChart;
