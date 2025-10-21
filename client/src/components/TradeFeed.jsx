import { useState, useEffect } from 'react';
import { fetchTradeFeed, fetchTradeFeedStats } from '../services/feedService';

const TradeFeed = () => {
    const [trades, setTrades] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFeed();
        const interval = setInterval(fetchFeed, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchFeed = async () => {
        try {
            const [feedRes, statsRes] = await Promise.all([
                fetchTradeFeed(15),
                fetchTradeFeedStats()
            ]);
            
            setTrades(feedRes.data?.trades || []);
            setStats(statsRes.data?.stats || null);
            setError(null);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch trade feed:', error);
            setError('Failed to load trade feed');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={fetchFeed}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <h2 className="text-xl font-bold text-white">Live Trade Feed</h2>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                        </span>
                        <span className="text-xs text-white font-medium">LIVE</span>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-white">{stats.totalTrades || 0}</div>
                            <div className="text-xs text-teal-100">Total Trades</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-white">{stats.buyCount || 0}</div>
                            <div className="text-xs text-teal-100">Buys</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-white">{stats.sellCount || 0}</div>
                            <div className="text-xs text-teal-100">Sells</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Feed List */}
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {trades && trades.length > 0 ? (
                    trades.map((trade, index) => (
                        <div
                            key={`${trade.timestamp}-${index}`}
                            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                    {/* User Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                                        {(trade.username || 'A').charAt(0).toUpperCase()}
                                    </div>

                                    {/* Trade Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="font-semibold text-gray-900 truncate">
                                                {trade.username || 'Anonymous'}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                                                trade.type === 'BUY' 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'bg-green-100 text-green-700'
                                            }`}>
                                                {trade.type}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-700 mb-1">
                                            <span className="font-medium">{trade.quantity}</span> shares of{' '}
                                            <span className="font-bold text-teal-600">{trade.symbol}</span>
                                            {' @ '}
                                            <span className="font-semibold">₹{parseFloat(trade.price).toFixed(2)}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center space-x-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>
                                                {new Date(trade.timestamp).toLocaleTimeString('en-IN', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Trade Value */}
                                <div className="text-right ml-4 flex-shrink-0">
                                    <div className="text-lg font-bold text-gray-900">
                                        ₹{parseFloat(trade.totalValue || 0).toFixed(2)}
                                    </div>
                                    <div className={`text-xs font-medium ${
                                        trade.type === 'BUY' ? 'text-blue-600' : 'text-green-600'
                                    }`}>
                                        {trade.type === 'BUY' ? '↗ Bought' : '↙ Sold'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <p className="text-gray-500 font-medium mb-2">No recent trades yet</p>
                        <p className="text-gray-400 text-sm">Be the first to trade!</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            {trades && trades.length > 0 && (
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Showing {trades.length} recent trades</span>
                        <span className="flex items-center space-x-1">
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Auto-refresh</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradeFeed;
