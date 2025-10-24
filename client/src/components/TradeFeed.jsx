import { useState, useEffect, useCallback } from 'react';
import { fetchTradeFeed, fetchTradeFeedStats } from '../services/feedService';
import { TrendingUp, Activity, RefreshCw, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TradeFeed = () => {
    const [trades, setTrades] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFeed = useCallback(async () => {
        try {
            const [feedRes, statsRes] = await Promise.all([
                fetchTradeFeed(15),
                fetchTradeFeedStats()
            ]);
            
            setTrades(feedRes.data?.trades || []);
            setStats(statsRes.data?.stats || null);
            setError(null);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch trade feed:', err);
            setError('Failed to load trade feed');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeed();
        const interval = setInterval(fetchFeed, 5000);
        return () => clearInterval(interval);
    }, [fetchFeed]);

    if (loading) {
        return (
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-slate-800 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-slate-800 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50 p-6">
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 mb-4">{error}</p>
                    <button 
                        onClick={fetchFeed}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50 overflow-hidden">
            {/* Header */}
            <div className="bg-blue-500/10 border-b border-slate-800/50 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-bold text-white">Live Trade Feed</h2>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1 rounded-full">
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
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 text-center border border-slate-700/50">
                            <div className="text-2xl font-bold text-white">{stats.totalTrades || 0}</div>
                            <div className="text-xs text-slate-400">Total Trades</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 text-center border border-slate-700/50">
                            <div className="text-2xl font-bold text-white">{stats.buyCount || 0}</div>
                            <div className="text-xs text-slate-400">Buys</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 text-center border border-slate-700/50">
                            <div className="text-2xl font-bold text-white">{stats.sellCount || 0}</div>
                            <div className="text-xs text-slate-400">Sells</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Feed List - Hidden Scrollbar */}
            <div 
                className="divide-y divide-slate-800/50 max-h-[500px] overflow-y-auto"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                <style>{`
                    div.divide-y::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                {trades && trades.length > 0 ? (
                    trades.map((trade, index) => (
                        <div
                            key={`${trade.timestamp}-${index}`}
                            className="p-4 hover:bg-slate-800/30 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                    {/* User Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0 ring-2 ring-blue-500/30">
                                        {(trade.username || 'A').charAt(0).toUpperCase()}
                                    </div>

                                    {/* Trade Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="font-semibold text-white truncate">
                                                {trade.username || 'Anonymous'}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                                                trade.type === 'BUY' 
                                                    ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' 
                                                    : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                                            }`}>
                                                {trade.type}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-300 mb-1">
                                            <span className="font-medium">{trade.quantity}</span> shares of{' '}
                                            <span className="font-bold text-blue-400">{trade.symbol}</span>
                                            {' @ '}
                                            <span className="font-semibold text-white">₹{parseFloat(trade.price).toFixed(2)}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 flex items-center space-x-1">
                                            <Clock className="w-3 h-3" />
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
                                    <div className="text-lg font-bold text-white">
                                        ₹{parseFloat(trade.totalValue || 0).toFixed(2)}
                                    </div>
                                    <div className={`text-xs font-medium flex items-center justify-end space-x-1 ${
                                        trade.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                        {trade.type === 'BUY' ? (
                                            <ArrowUpRight className="w-3 h-3" />
                                        ) : (
                                            <ArrowDownRight className="w-3 h-3" />
                                        )}
                                        <span>{trade.type === 'BUY' ? 'Bought' : 'Sold'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-slate-400 font-medium mb-2">No recent trades yet</p>
                        <p className="text-slate-500 text-sm">Be the first to trade!</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            {trades && trades.length > 0 && (
                <div className="bg-slate-800/30 px-4 py-3 border-t border-slate-800/50">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Showing {trades.length} recent trades</span>
                        <span className="flex items-center space-x-1">
                            <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                            <span>Auto-refresh</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradeFeed;
