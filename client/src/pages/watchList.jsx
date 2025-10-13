import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useStockPrices } from '../context/StockPriceContext';
import { getWatchlist, removeFromWatchlist } from '../services/watchlistService';
import { formatCurrency } from '../utils/currencyFormatter';
import { Star, Trash2, TrendingUp, TrendingDown, Eye } from 'lucide-react';

const Watchlist = () => {
    const { user } = useAuth();
    const { stockPrices, isLoading: pricesLoading } = useStockPrices();
    const [watchlistSymbols, setWatchlistSymbols] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWatchlistSymbols = useCallback(async () => {
        if (!user?.token) return;
        try {
            const res = await getWatchlist(user.token);
            setWatchlistSymbols(res.data);
        } catch (error) {
            console.error("Failed to fetch watchlist symbols", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWatchlistSymbols();
    }, [fetchWatchlistSymbols]);

    const watchlistData = stockPrices.filter(stock => watchlistSymbols.includes(stock.symbol));

    const handleRemove = async (symbol) => {
        if (!user?.token) return;
        setWatchlistSymbols(prev => prev.filter(s => s !== symbol));
        try {
            await removeFromWatchlist(symbol, user.token);
        } catch (error) {
            console.error("Failed to remove from watchlist", error);
            fetchWatchlistSymbols();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Watchlist</h1>
                    <p className="text-slate-400 text-sm">Track your favorite stocks in one place</p>
                </div>

                {/* Watchlist Table */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <h2 className="text-lg font-semibold text-white">
                                {watchlistData.length > 0 ? `${watchlistData.length} ${watchlistData.length === 1 ? 'Stock' : 'Stocks'}` : 'No Stocks'}
                            </h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800/50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Symbol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Day Change</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Volume</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading || pricesLoading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                                                <p className="text-slate-400 text-sm">Loading watchlist...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : watchlistData.length > 0 ? (
                                    watchlistData.map(stock => {
                                        const dayChange = parseFloat(stock.price) - stock.previousClose;
                                        const dayChangePercent = stock.previousClose ? (dayChange / stock.previousClose) * 100 : 0;
                                        const isPositive = dayChange >= 0;

                                        return (
                                            <tr 
                                                key={stock.symbol} 
                                                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <Link
                                                        to={`/stock/${stock.symbol}`}
                                                        className="font-semibold text-blue-400 hover:text-blue-300 uppercase transition-colors"
                                                    >
                                                        {stock.symbol}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-slate-300 text-sm">{stock.name}</span>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-white">
                                                    {formatCurrency(parseFloat(stock.price))}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                                                        isPositive 
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                        {isPositive ? '+' : ''}{dayChangePercent.toFixed(2)}%
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">
                                                    {(stock.volume / 1000000).toFixed(2)}M
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            to={`/stock/${stock.symbol}`}
                                                            className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/30 transition-all duration-200"
                                                            title="View details"
                                                        >
                                                            <Eye size={16} />
                                                        </Link>
                                                        <button 
                                                            onClick={() => handleRemove(stock.symbol)} 
                                                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 transition-all duration-200"
                                                            title="Remove from watchlist"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
                                                    <Star className="w-8 h-8 text-slate-600" />
                                                </div>
                                                <p className="text-slate-400 text-lg font-medium mb-2">Your watchlist is empty</p>
                                                <p className="text-slate-500 text-sm mb-4">Add stocks to track from the trading page</p>
                                                <Link
                                                    to="/trade"
                                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all duration-200"
                                                >
                                                    Start Trading
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Watchlist;
