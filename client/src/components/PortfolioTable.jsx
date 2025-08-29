import React from 'react';
import { formatCurrency } from '../utils/currencyFormatter';
import { ArrowUpRight, ArrowDownRight, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import {Link} from 'react-router-dom';

const PortfolioTable = ({ stocks, isLoading }) => {
    const renderLoadingSkeleton = () => (
        [...Array(3)].map((_, index) => (
            <tr key={index} className="border-b border-gray-700 animate-pulse">
                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-28"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-12"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-28"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-28"></div></td>
            </tr>
        ))
    );

    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1, // Stagger each row by 0.1s
                duration: 0.4,
            },
        }),
    };

    return (
        <motion.div 
            className="overflow-x-auto bg-gray-900 rounded-2xl shadow-xl p-6 mt-6 border border-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
        >
            <h2 className="text-2xl font-bold text-orange-400 mb-6 text-center flex items-center justify-center gap-2">
                <Briefcase size={28} /> Portfolio Overview
            </h2>
            <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="bg-gray-800 text-orange-300 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-3">Stock</th>
                        <th className="px-6 py-3">Quantity</th>
                        <th className="px-6 py-3">Avg. Buy Price</th>
                        <th className="px-6 py-3">Current Price</th>
                        <th className="px-6 py-3">Day's Change</th>
                        <th className="px-6 py-3">Total Value</th>
                        <th className="px-6 py-3">Total P/L</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading && stocks.length === 0 ? renderLoadingSkeleton() : (
                        stocks.length > 0 ? (
                            stocks.map((stock, index) => (
                                <motion.tr 
                                    key={stock.symbol} 
                                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200"
                                    custom={index}
                                    variants={rowVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-blue-300 uppercase">{stock.symbol}</div>
                                        <div className="text-xs text-gray-500 whitespace-nowrap">{stock.name}</div>
                                    </td>
                                    <td className="px-6 py-4">{stock.quantity}</td>
                                    <td className="px-6 py-4 text-gray-400">{formatCurrency(stock.avgBuyPrice)}</td>
                                    <td className="px-6 py-4 text-yellow-300 font-medium">{formatCurrency(parseFloat(stock.currentPrice))}</td>
                                    <td className={`px-6 py-4 font-medium flex items-center gap-1.5 ${stock.dayChangePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                                        {stock.dayChangePercent >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                        {stock.dayChangePercent.toFixed(2)}%
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white">{formatCurrency(stock.totalValue)}</td>
                                    <td className={`px-6 py-4 font-semibold flex items-center gap-1.5 ${stock.profitLoss >= 0 ? "text-green-400" : "text-red-400"}`}>
                                        {stock.profitLoss >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                        {formatCurrency(stock.profitLoss).replace('₹', '')}
                                    </td>
                                    {/* --- MODIFIED: Wrap symbol in a Link --- */}
    <Link to={`/stock/${stock.symbol}`} className="font-semibold text-blue-300 uppercase hover:underline">
        {stock.symbol}
    </Link>
    <div className="text-xs text-gray-500 whitespace-nowrap">{stock.name}</div>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-8 text-gray-500">
                                    You have no stocks in your portfolio.
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>
        </motion.div>
    );
};

export default PortfolioTable;
