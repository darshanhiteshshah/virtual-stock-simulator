import { ArrowUpRight, ArrowDownRight, Activity, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "../utils/currencyFormatter"; // Assuming you have this utility

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
    // Ensure price is a valid number, defaulting to 0 if not.
    const parsedPrice = parseFloat(price) || 0;
    const priceChange = parsedPrice - previousClose;

    // Calculate the percentage change for the day, handling division by zero.
    const percentageChange = previousClose !== 0
        ? ((priceChange / previousClose) * 100)
        : 0;

    const isPositiveChange = priceChange >= 0;

    return (
        <motion.div
            className="rounded-2xl shadow-lg p-6 bg-gray-900 border border-gray-700 hover:border-orange-400/50 transition-all duration-300"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header with Stock Name and Symbol */}
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-500/10 p-2 rounded-lg">
                    <Activity className="text-orange-400" size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-100">{name}</h3>
                    <p className="text-sm font-mono text-blue-400">{symbol}</p>
                </div>
            </div>

            {/* Price and Daily Change */}
            <div className="flex justify-between items-baseline mb-5">
                <div className="text-4xl font-extrabold text-white">
                    {formatCurrency(parsedPrice)}
                </div>
                <div
                    className={`flex items-center gap-1 text-lg font-semibold ${
                        isPositiveChange ? "text-green-400" : "text-red-400"
                    }`}
                >
                    {isPositiveChange ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    {percentageChange.toFixed(2)}%
                </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 text-sm text-gray-400 border-t border-gray-700 pt-4">
                <BarChart2 size={16} />
                <span>Volume:</span>
                <span className="font-medium text-gray-300">
                    {volume ? volume.toLocaleString() : "N/A"}
                </span>
            </div>
        </motion.div>
    );
};

export default StockCard;
