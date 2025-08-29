import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import { useStockPrices } from '../context/StockPriceContext';
import { getWatchlist, removeFromWatchlist } from '../services/watchlistService';
import { formatCurrency } from '../utils/currencyFormatter';
import { Star, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

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

    // Filter the global price list to get data for stocks in the watchlist
    const watchlistData = stockPrices.filter(stock => watchlistSymbols.includes(stock.symbol));

    const handleRemove = async (symbol) => {
        if (!user?.token) return;
        // Optimistically update the UI for a faster user experience
        setWatchlistSymbols(prev => prev.filter(s => s !== symbol));
        try {
            await removeFromWatchlist(symbol, user.token);
        } catch (error) {
            console.error("Failed to remove from watchlist", error);
            // If the API call fails, revert the change
            fetchWatchlistSymbols();
        }
    };

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-3xl font-bold text-orange-400 mb-6 flex items-center gap-3"><Star /> Your Watchlist</h1>
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800">
                <table className="min-w-full text-sm text-left text-gray-300">
                    <thead className="bg-gray-800 text-orange-300 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Symbol</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Current Price</th>
                            <th className="px-6 py-3">Day's Change</th>
                            <th className="px-6 py-3">Volume</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading || pricesLoading ? (
                            <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading watchlist...</td></tr>
                        ) : watchlistData.length > 0 ? (
                            watchlistData.map(stock => {
                                const dayChange = parseFloat(stock.price) - stock.previousClose;
                                const dayChangePercent = stock.previousClose ? (dayChange / stock.previousClose) * 100 : 0;
                                return (
                                    <motion.tr 
                                        key={stock.symbol} 
                                        className="border-b border-gray-800 hover:bg-gray-800/50"
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <td className="px-6 py-4 font-semibold text-blue-300">{stock.symbol}</td>
                                        <td className="px-6 py-4 text-gray-400">{stock.name}</td>
                                        <td className="px-6 py-4 font-medium text-yellow-300">{formatCurrency(parseFloat(stock.price))}</td>
                                        <td className={`px-6 py-4 font-medium flex items-center gap-1.5 ${dayChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {dayChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                            {dayChangePercent.toFixed(2)}%
                                        </td>
                                        <td className="px-6 py-4">{stock.volume.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleRemove(stock.symbol)} className="text-red-500 hover:text-red-400 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="6" className="text-center py-8 text-gray-500">Your watchlist is empty. Add stocks from the Trade page.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Watchlist;
