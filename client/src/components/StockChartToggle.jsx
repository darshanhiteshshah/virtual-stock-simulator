import { useState } from 'react';
import StockChart from './StockChart';
import AdvancedStockChart from './AdvancedStockChart';
import { BarChart3, TrendingUp } from 'lucide-react';

const StockChartToggle = ({ data, symbol }) => {
    const [chartType, setChartType] = useState(
        localStorage.getItem('preferredChart') || 'simple'
    );

    const handleChartChange = (type) => {
        setChartType(type);
        localStorage.setItem('preferredChart', type);
    };

    if (!data || data.length === 0) {
        return (
            <div className="h-96 flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800/50">
                <p className="text-slate-400">No chart data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toggle Buttons */}
            <div className="flex items-center justify-between bg-slate-900/30 rounded-lg p-2">
                <div className="text-sm text-slate-400 px-2">
                    Chart Style
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleChartChange('simple')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            chartType === 'simple'
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        <span>Simple</span>
                    </button>
                    <button
                        onClick={() => handleChartChange('advanced')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            chartType === 'advanced'
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        <span>Advanced</span>
                    </button>
                </div>
            </div>

            {/* Render Selected Chart */}
            {chartType === 'simple' ? (
                <StockChart data={data} symbol={symbol} />
            ) : (
                <AdvancedStockChart data={data} symbol={symbol} />
            )}
        </div>
    );
};

export default StockChartToggle;
