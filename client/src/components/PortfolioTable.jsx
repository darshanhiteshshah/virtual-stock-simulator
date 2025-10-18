import React from 'react';
import { formatCurrency } from '../utils/currencyFormatter';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from 'react-router-dom';

const PortfolioTable = ({ stocks, isLoading }) => {
    const renderLoadingSkeleton = () => (
        [...Array(3)].map((_, index) => (
            <tr key={index} className="border-b border-slate-800/50 animate-pulse">
                <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-28"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-12"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-28"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
            </tr>
        ))
    );

    const calculatePLPercentage = (profitLoss, totalValue) => {
        if (!totalValue || totalValue === 0) return 0;
        return ((profitLoss / (totalValue - profitLoss)) * 100).toFixed(2);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-800/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Avg. Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Current Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Day's Change</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Total Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">P/L</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading && stocks.length === 0 ? (
                        renderLoadingSkeleton()
                    ) : (
                        stocks.length > 0 ? (
                            stocks.map((stock) => {
                                const plPercentage = calculatePLPercentage(stock.profitLoss, stock.totalValue);
                                const isProfit = stock.profitLoss >= 0;
                                
                                return (
                                    <tr
                                        key={stock.symbol}
                                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors duration-200"
                                    >
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/stock/${stock.symbol}`}
                                                className="font-semibold text-blue-400 hover:text-blue-300 uppercase transition-colors"
                                            >
                                                {stock.symbol}
                                            </Link>
                                            <div className="text-xs text-slate-500 mt-0.5 max-w-[150px] truncate">
                                                {stock.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">{stock.quantity}</td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {formatCurrency(stock.avgBuyPrice)}
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">
                                            {formatCurrency(parseFloat(stock.currentPrice))}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium text-xs ${
                                                stock.dayChangePercent >= 0 
                                                    ? "bg-emerald-500/10 text-emerald-400" 
                                                    : "bg-red-500/10 text-red-400"
                                            }`}>
                                                {stock.dayChangePercent >= 0 ? (
                                                    <TrendingUp size={14} />
                                                ) : (
                                                    <TrendingDown size={14} />
                                                )}
                                                {stock.dayChangePercent.toFixed(2)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-white">
                                            {formatCurrency(stock.totalValue)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <div className={`flex items-center gap-1.5 font-semibold ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                                                    {isProfit ? (
                                                        <ArrowUpRight size={16} />
                                                    ) : (
                                                        <ArrowDownRight size={16} />
                                                    )}
                                                    {formatCurrency(Math.abs(stock.profitLoss))}
                                                </div>
                                                <span className={`text-xs ${isProfit ? "text-emerald-400/70" : "text-red-400/70"}`}>
                                                    {isProfit ? '+' : ''}{plPercentage}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/stock/${stock.symbol}`}
                                                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium rounded-md border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200"
                                                >
                                                    Trade
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-12">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
                                            <TrendingUp className="w-8 h-8 text-slate-600" />
                                        </div>
                                        <div className="text-slate-400">
                                            <p className="text-lg font-medium mb-1">No stocks in portfolio</p>
                                            <p className="text-sm">Start trading to build your portfolio</p>
                                        </div>
                                        <Link
                                            to="/trade"
                                            className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all duration-200"
                                        >
                                            Explore Market
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PortfolioTable;
