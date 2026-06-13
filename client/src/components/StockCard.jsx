import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { formatCurrency } from "../utils/currencyFormatter";
import { Link } from "react-router-dom";

const StockCard = ({
    symbol = "N/A",
    name = "Unknown Stock",
    price = "0",
    changePercent = 0,
    volume = 0,
    sector = "",
    exchange = ""
}) => {

    const parsedPrice = parseFloat(price) || 0;
    const parsedChange = parseFloat(changePercent || 0);

    const isPositiveChange = parsedChange >= 0;

    return (
        <Link 
            to={`/stock/${symbol}`}
            className="block bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-5 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/10"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                            {symbol}
                        </h3>

                        {/* Live badge */}
                        {exchange && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-400 font-medium">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                Live
                            </span>
                        )}
                    </div>

                    <p className="text-xs text-slate-500 truncate mb-1">{name}</p>

                    {/* Sector */}
                    {sector && (
                        <span className="inline-block px-2 py-0.5 text-[10px] bg-slate-800/50 text-slate-400 rounded">
                            {sector}
                        </span>
                    )}
                </div>

                {/* Icon */}
                <div className={`p-2 rounded-lg ${
                    isPositiveChange 
                        ? 'bg-emerald-500/10 border border-emerald-500/20' 
                        : 'bg-red-500/10 border border-red-500/20'
                }`}>
                    <TrendingUp 
                        size={18} 
                        className={isPositiveChange ? 'text-emerald-400' : 'text-red-400 rotate-180'}
                    />
                </div>
            </div>

            {/* Price */}
            <div className="mb-4">
                <div className="text-3xl font-bold text-white mb-1 tabular-nums">
                    {formatCurrency(parsedPrice)}
                </div>

                <div className={`flex items-center gap-1.5 text-sm font-semibold ${
                    isPositiveChange ? "text-emerald-400" : "text-red-400"
                }`}>
                    {isPositiveChange ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span className="tabular-nums">
                        {isPositiveChange ? '+' : ''}{parsedChange.toFixed(2)}%
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                
                {/* Volume */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Volume</span>
                    <span className="text-xs font-semibold text-slate-300 tabular-nums">
                        {volume ? (volume / 1000000).toFixed(2) + 'M' : "N/A"}
                    </span>
                </div>

                {/* Exchange */}
                {exchange && (
                    <div className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-500/30">
                        {exchange}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default StockCard;