import { ArrowUpRight, ArrowDownRight, TrendingUp, Activity } from "lucide-react";
import { formatCurrency } from "../utils/currencyFormatter";
import { Link } from "react-router-dom";

/**
 * A reusable card component to display live information about a single stock.
 * @param {object} props - The component props.
 * @param {string} props.symbol - The stock ticker symbol.
 * @param {string} props.name - The full name of the company.
 * @param {string|number} props.price - The current market price of the stock.
 * @param {number} props.previousClose - The closing price from the previous day.
 * @param {number} props.volume - The trading volume for the day.
 * @param {string} props.sector - Stock sector (optional).
 * @param {string} props.exchange - Exchange name (optional).
 */
const StockCard = ({
    symbol = "N/A",
    name = "Unknown Stock",
    price = "0",
    previousClose = 0,
    volume = 0,
    sector = "",
    exchange = "BSE"
}) => {
    const parsedPrice = parseFloat(price) || 0;
    const priceChange = parsedPrice - previousClose;

    const percentageChange = previousClose !== 0
        ? ((priceChange / previousClose) * 100)
        : 0;

    const isPositiveChange = priceChange >= 0;

    return (
        <Link 
            to={`/stock/${symbol}`}
            className="block bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-5 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/10"
        >
            {/* Header with Stock Symbol and Name */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                            {symbol}
                        </h3>
                        {/* Live indicator */}
                        {exchange === 'BSE' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-400 font-medium">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                Live
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mb-1">{name}</p>
                    {/* Sector badge */}
                    {sector && (
                        <span className="inline-block px-2 py-0.5 text-[10px] bg-slate-800/50 text-slate-400 rounded">
                            {sector}
                        </span>
                    )}
                </div>
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
                        {isPositiveChange ? '+' : ''}{formatCurrency(Math.abs(priceChange))}
                    </span>
                    <span className="text-xs tabular-nums">
                        ({isPositiveChange ? '+' : ''}{percentageChange.toFixed(2)}%)
                    </span>
                </div>
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Volume</span>
                    <span className="text-xs font-semibold text-slate-300 tabular-nums">
                        {volume ? (volume / 1000000).toFixed(2) + 'M' : "N/A"}
                    </span>
                </div>
                <div className="text-xs text-slate-500">
                    Prev: <span className="text-slate-400 tabular-nums">{formatCurrency(previousClose)}</span>
                </div>
            </div>
        </Link>
    );
};

export default StockCard;
