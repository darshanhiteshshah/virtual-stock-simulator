import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const TradeFeed = () => {
    const [trades, setTrades] = useState([]); // Initialize as empty array
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Add error state

    useEffect(() => {
        fetchFeed();
        const interval = setInterval(fetchFeed, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchFeed = async () => {
        try {
            const [feedRes, statsRes] = await Promise.all([
                axios.get('/api/feed?limit=15'),
                axios.get('/api/feed/stats')
            ]);
            
            // Safely access data with fallback
            setTrades(feedRes.data?.trades || []);
            setStats(statsRes.data?.stats || null);
            setError(null);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch trade feed:', error);
            setError('Failed to load trade feed');
            setLoading(false);
            // Don't reset trades, keep showing old data
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                    <div className="text-red-500 mb-2">⚠️</div>
                    <p className="text-gray-600">{error}</p>
                    <button 
                        onClick={fetchFeed}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Live Trade Feed</h2>
                    <div className="flex items-center space-x-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm text-gray-500">Live</span>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{stats.totalTrades || 0}</div>
                            <div className="text-xs text-gray-500">Total Trades</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.buyCount || 0}</div>
                            <div className="text-xs text-gray-500">Buys</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.sellCount || 0}</div>
                            <div className="text-xs text-gray-500">Sells</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Feed List */}
            <div className="divide-y max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                    {trades && trades.length > 0 ? (
                        trades.map((trade, index) => (
                            <motion.div
                                key={`${trade.timestamp}-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {/* User Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                            {(trade.username || 'A').charAt(0).toUpperCase()}
                                        </div>

                                        {/* Trade Info */}
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-900">{trade.username || 'Anonymous'}</span>
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                                    trade.type === 'BUY' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {trade.type}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {trade.quantity} shares of <span className="font-semibold">{trade.symbol}</span> @ ₹{parseFloat(trade.price).toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(trade.timestamp).toLocaleTimeString('en-IN', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trade Value */}
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900">
                                            ₹{parseFloat(trade.totalValue).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <div className="text-4xl mb-2">📊</div>
                            <p>No recent trades yet. Be the first to trade!</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TradeFeed;
