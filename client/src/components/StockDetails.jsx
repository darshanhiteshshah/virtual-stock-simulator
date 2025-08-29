import React from 'react';
import { formatCurrency } from '../utils/currencyFormatter';
import { TrendingUp, TrendingDown, Briefcase, Percent } from 'lucide-react';

const DetailRow = ({ label, value, icon }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-700">
        <div className="flex items-center gap-2 text-gray-400">
            {icon}
            <span>{label}</span>
        </div>
        <span className="font-semibold text-white">{value}</span>
    </div>
);

const StockDetails = ({ stockData }) => {
    if (!stockData) return null;

    const { week52High, week52Low, marketCap, peRatio } = stockData;

    return (
        <div className="bg-gray-800 p-5 rounded-lg mt-6">
            <h3 className="text-lg font-semibold text-orange-300 mb-3">Market Data</h3>
            <div className="space-y-2">
                <DetailRow 
                    label="52-Week High" 
                    value={formatCurrency(week52High)}
                    icon={<TrendingUp size={16} className="text-green-500" />}
                />
                <DetailRow 
                    label="52-Week Low" 
                    value={formatCurrency(week52Low)}
                    icon={<TrendingDown size={16} className="text-red-500" />}
                />
                <DetailRow 
                    label="Market Cap (Cr.)" 
                    value={`₹${marketCap.toLocaleString('en-IN')}`}
                    icon={<Briefcase size={16} className="text-blue-400" />}
                />
                <DetailRow 
                    label="P/E Ratio" 
                    value={peRatio}
                    icon={<Percent size={16} className="text-purple-400" />}
                />
            </div>
        </div>
    );
};

export default StockDetails;
