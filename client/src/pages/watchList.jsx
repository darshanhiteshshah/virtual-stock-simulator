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
            setWatchlistSymbols(res.data || []);
        } catch (error) {
            console.error("Failed to fetch watchlist symbols", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWatchlistSymbols();
    }, [fetchWatchlistSymbols]);

    const watchlistData = stockPrices.filter(stock =>
        watchlistSymbols.includes(stock.symbol)
    );

    const handleRemove = async (symbol) => {
        if (!user?.token) return;

        // optimistic update
        setWatchlistSymbols(prev => prev.filter(s => s !== symbol));

        try {
            await removeFromWatchlist(symbol, user.token);
        } catch (error) {
            console.error("Failed to remove from watchlist", error);
            fetchWatchlistSymbols(); // rollback
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Watchlist</h1>
                    <p className="text-slate-400 text-sm">
                        Track your favorite stocks in one place
                    </p>
                </div>

                {/* Table */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <h2 className="text-lg font-semibold text-white">
                                {watchlistData.length > 0
                                    ? `${watchlistData.length} ${watchlistData.length === 1 ? 'Stock' : 'Stocks'}`
                                    : 'No Stocks'}
                            </h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">

                            {/* Header */}
                            <thead>
                                <tr className="border-b border-slate-800/50">
                                    <th className="px-6 py-3 text-left text-xs text-slate-400 uppercase">Symbol</th>
                                    <th className="px-6 py-3 text-left text-xs text-slate-400 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs text-slate-400 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs text-slate-400 uppercase">Change</th>
                                    <th className="px-6 py-3 text-left text-xs text-slate-400 uppercase">Volume</th>
                                    <th className="px-6 py-3 text-center text-xs text-slate-400 uppercase">Actions</th>
                                </tr>
                            </thead>

                            {/* Body */}
                            <tbody>

                                {(isLoading || pricesLoading) && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                                                <p className="text-slate-400 text-sm">Loading watchlist...</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!isLoading && !pricesLoading && watchlistData.length > 0 && (
                                    watchlistData.map(stock => {

                                        const changePercent = parseFloat(stock.changePercent || 0);
                                        const isPositive = changePercent >= 0;

                                        return (
                                            <tr 
                                                key={stock.symbol}
                                                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition"
                                            >
                                                <td className="px-6 py-4">
                                                    <Link
                                                        to={`/stock/${stock.symbol}`}
                                                        className="text-blue-400 font-semibold hover:text-blue-300 uppercase"
                                                    >
                                                        {stock.symbol}
                                                    </Link>
                                                </td>

                                                <td className="px-6 py-4 text-slate-300">
                                                    {stock.name}
                                                </td>

                                                <td className="px-6 py-4 font-semibold text-white">
                                                    {formatCurrency(parseFloat(stock.price))}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                                        isPositive
                                                            ? 'bg-emerald-500/10 text-emerald-400'
                                                            : 'bg-red-500/10 text-red-400'
                                                    }`}>
                                                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-slate-300">
                                                    {stock.volume
                                                        ? (stock.volume / 1000000).toFixed(2) + "M"
                                                        : "N/A"}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">

                                                        <Link
                                                            to={`/stock/${stock.symbol}`}
                                                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded"
                                                        >
                                                            <Eye size={16} />
                                                        </Link>

                                                        <button
                                                            onClick={() => handleRemove(stock.symbol)}
                                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>

                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}

                                {!isLoading && !pricesLoading && watchlistData.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12">
                                            <div className="flex flex-col items-center gap-3">
                                                <Star className="w-10 h-10 text-slate-600" />
                                                <p className="text-slate-400">Your watchlist is empty</p>
                                                <Link
                                                    to="/trade"
                                                    className="mt-3 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
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