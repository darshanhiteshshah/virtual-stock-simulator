import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
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
 */
const StockCard = ({
    symbol = "N/A",
    name = "Unknown Stock",
    price = "0",
    previousClose = 0,
    volume = 0
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
            className="block bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-5 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-300 group"
        >
            {/* Header with Stock Symbol and Name */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-blue-400 transition-colors">
                        {symbol}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{name}</p>
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
                <div className="text-3xl font-bold text-white mb-1">
                    {formatCurrency(parsedPrice)}
                </div>
                <div className={`flex items-center gap-1.5 text-sm font-semibold ${
                    isPositiveChange ? "text-emerald-400" : "text-red-400"
                }`}>
                    {isPositiveChange ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span>
                        {isPositiveChange ? '+' : ''}{formatCurrency(Math.abs(priceChange))}
                    </span>
                    <span className="text-xs">
                        ({isPositiveChange ? '+' : ''}{percentageChange.toFixed(2)}%)
                    </span>
                </div>
            </div>

            {/* Volume */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                <span className="text-xs text-slate-500">Volume</span>
                <span className="text-xs font-semibold text-slate-300">
                    {volume ? (volume / 1000000).toFixed(2) + 'M' : "N/A"}
                </span>
            </div>
        </Link>
    );
};

export default StockCard;
