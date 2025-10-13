import React from 'react';
import { formatCurrency } from '../utils/currencyFormatter';
import { TrendingUp, TrendingDown, Building2, Calculator } from 'lucide-react';

const DetailRow = ({ label, value, icon, valueColor = "text-white" }) => (
    <div className="flex justify-between items-center py-3 border-b border-slate-800/50 last:border-0">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
            {icon}
            <span>{label}</span>
        </div>
        <span className={`font-semibold ${valueColor}`}>{value}</span>
    </div>
);

const StockDetails = ({ stockData }) => {
    if (!stockData) return null;

    const { week52High, week52Low, marketCap, peRatio, currentPrice } = stockData;

    // Calculate position in 52-week range
    const rangePosition = week52High && week52Low 
        ? ((currentPrice - week52Low) / (week52High - week52Low)) * 100 
        : 0;

    // Determine P/E ratio health
    const getPERatioStatus = (pe) => {
        if (!pe || pe === 'N/A') return { text: 'N/A', color: 'text-slate-400' };
        const peValue = parseFloat(pe);
        if (peValue < 15) return { text: `${pe} (Undervalued)`, color: 'text-emerald-400' };
        if (peValue > 30) return { text: `${pe} (Overvalued)`, color: 'text-red-400' };
        return { text: `${pe} (Fair)`, color: 'text-blue-400' };
    };

    const peStatus = getPERatioStatus(peRatio);

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 size={20} className="text-blue-400" />
                Market Data
            </h3>

            <div className="space-y-1">
                <DetailRow 
                    label="52-Week High" 
                    value={formatCurrency(week52High)}
                    icon={<TrendingUp size={16} className="text-emerald-400" />}
                    valueColor="text-slate-300"
                />
                <DetailRow 
                    label="52-Week Low" 
                    value={formatCurrency(week52Low)}
                    icon={<TrendingDown size={16} className="text-red-400" />}
                    valueColor="text-slate-300"
                />
                <DetailRow 
                    label="Market Cap" 
                    value={`₹${(marketCap / 10000000).toFixed(2)} Cr`}
                    icon={<Building2 size={16} className="text-blue-400" />}
                />
                <DetailRow 
                    label="P/E Ratio" 
                    value={peStatus.text}
                    icon={<Calculator size={16} className="text-violet-400" />}
                    valueColor={peStatus.color}
                />
            </div>

            {/* 52-Week Range Indicator */}
            <div className="mt-6 pt-4 border-t border-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">52-Week Range Position</span>
                    <span className="text-xs font-semibold text-white">{rangePosition.toFixed(1)}%</span>
                </div>
                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-full"
                        style={{ width: `${rangePosition}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2">
                    <span className="text-xs text-slate-500">Low</span>
                    <span className="text-xs text-slate-500">High</span>
                </div>
            </div>
        </div>
    );
};

export default StockDetails;
