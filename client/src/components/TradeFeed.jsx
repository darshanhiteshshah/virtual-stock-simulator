import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { fetchTradeFeed } from '../services/feedService';
import { formatCurrency } from '../utils/currencyFormatter';
import { Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TradeFeed = () => {
    const { user } = useAuth();
    const [feed, setFeed] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user?.token) return;

        const getFeed = async () => {
            try {
                const res = await fetchTradeFeed(user.token);
                setFeed(res.data);
            } catch (error) {
                console.error("Failed to fetch trade feed", error);
            } finally {
                setIsLoading(false);
            }
        };

        getFeed();
        const intervalId = setInterval(getFeed, 5000); // Refresh feed every 5 seconds

        return () => clearInterval(intervalId);
    }, [user]);

    return (
        <motion.div 
            className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 shadow h-[400px] flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
        >
            <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap size={18} className="text-cyan-400" />
                Live Trade Feed
            </h2>
            <div className="overflow-y-auto flex-grow pr-2">
                <AnimatePresence>
                    {isLoading ? <p className="text-slate-500">Loading feed...</p> :
                        feed.map((trade, index) => (
                            <motion.div
                                key={trade.timestamp}
                                className={`flex justify-between items-center p-2 rounded-md ${index % 2 === 0 ? 'bg-slate-800/50' : ''}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div>
                                    <span className={`font-bold ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                        {trade.type}
                                    </span>
                                    <span className="ml-2 font-semibold text-white">{trade.symbol}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-300">{trade.quantity} Shares</p>
                                    <p className="text-xs text-slate-500">@{formatCurrency(trade.price)}</p>
                                </div>
                            </motion.div>
                        ))
                    }
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default TradeFeed;
