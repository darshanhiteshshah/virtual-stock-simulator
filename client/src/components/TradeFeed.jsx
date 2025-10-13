import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { fetchTradeFeed } from '../services/feedService';
import { formatCurrency } from '../utils/currencyFormatter';
import { Activity, ShoppingCart, Banknote, Clock } from 'lucide-react';

const TradeFeed = () => {
    const { user } = useAuth();
    const [feed, setFeed] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    useEffect(() => {
        if (!user?.token) return;

        const getFeed = async () => {
            try {
                const res = await fetchTradeFeed(user.token);
                setFeed(res.data);
                setLastUpdate(new Date());
            } catch (error) {
                console.error("Failed to fetch trade feed", error);
            } finally {
                setIsLoading(false);
            }
        };

        getFeed();
        const intervalId = setInterval(getFeed, 5000);

        return () => clearInterval(intervalId);
    }, [user]);

    // Format time elapsed
    const getTimeElapsed = () => {
        const seconds = Math.floor((new Date() - lastUpdate) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        return `${Math.floor(seconds / 60)}m ago`;
    };

    const [timeElapsed, setTimeElapsed] = useState('Just now');

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeElapsed(getTimeElapsed());
        }, 1000);

        return () => clearInterval(timer);
    }, [lastUpdate]);

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                    <Activity size={20} className="text-blue-400" />
                    Live Trade Feed
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock size={12} />
                    <span>{timeElapsed}</span>
                </div>
            </div>

            {/* Feed Content */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                        <p className="text-slate-400 text-sm">Loading feed...</p>
                    </div>
                ) : feed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                            <Activity className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-slate-400 text-sm text-center">No recent trades</p>
                        <p className="text-slate-500 text-xs text-center mt-1">Trade feed will appear here</p>
                    </div>
                ) : (
                    feed.map((trade, index) => {
                        const isBuy = trade.type === 'BUY';
                        const totalValue = trade.quantity * trade.price;

                        return (
                            <div
                                key={`${trade.timestamp}-${index}`}
                                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-slate-800/50"
                            >
                                {/* Left: Type & Symbol */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`p-2 rounded-lg ${
                                        isBuy 
                                            ? 'bg-blue-500/10 border border-blue-500/20' 
                                            : 'bg-emerald-500/10 border border-emerald-500/20'
                                    }`}>
                                        {isBuy ? (
                                            <ShoppingCart className="w-4 h-4 text-blue-400" />
                                        ) : (
                                            <Banknote className="w-4 h-4 text-emerald-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${
                                                isBuy ? 'text-blue-400' : 'text-emerald-400'
                                            }`}>
                                                {trade.type}
                                            </span>
                                            <span className="text-sm font-semibold text-white truncate">
                                                {trade.symbol}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            {trade.quantity} × {formatCurrency(trade.price)}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Total Value */}
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-white">
                                        {formatCurrency(totalValue)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            {!isLoading && feed.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/50 text-center">
                    <p className="text-xs text-slate-500">
                        Showing last {feed.length} trades
                    </p>
                </div>
            )}
        </div>
    );
};

export default TradeFeed;
