import React from 'react';
import useAuth from '../hooks/useAuth';
import { useEffect } from 'react';
import { useStockPrices } from '../context/StockPriceContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { TrendingUp, TrendingDown, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import Marquee from "react-fast-marquee";
import { Link } from 'react-router-dom';

const StockTicker = () => {
    const { user } = useAuth();
    const { stockPrices, isLoading, lastUpdated } = useStockPrices();

    if (!user || isLoading || stockPrices.length === 0) {
        return null;
    }

    // Calculate gainers/losers for badges
    const topGainers = stockPrices
        .filter(stock => stock.changePercent !== undefined)
.sort((a, b) => b.changePercent - a.changePercent)
.slice(0, 5);

    const topLosers = stockPrices
        .filter(stock => stock.changePercent !== undefined)
.sort((a, b) => a.changePercent - b.changePercent)
.slice(0, 3);

    return (
        <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-y border-slate-700/50 shadow-2xl">
            {/* Header with LIVE badges */}
            {lastUpdated && (
                <div className="flex items-center justify-between px-6 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-sm font-bold rounded-full">
                            🟢 LIVE BSE MARKET DATA
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/50 px-3 py-1 rounded-lg">
                            <Activity size={12} className="animate-spin" />
                            {stockPrices.length} Stocks
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1 bg-slate-800/50 px-3 py-1 rounded-lg">
                            <span>Updated:</span>
                            <span className="font-mono">
                                {lastUpdated.toLocaleTimeString('en-IN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    timeZone: 'Asia/Kolkata' 
                                })} IST
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Gainers/Losers Badges */}
            <div className="flex px-6 py-2 bg-slate-900/50 border-b border-slate-700/30">
                <div className="flex-1">
                    <span className="text-emerald-400 text-xs font-bold mr-4">📈 TOP GAINERS</span>
                    <Marquee speed={80} className="inline max-w-md">
                        {topGainers.map((stock, idx) => (
                            <Link
                                key={idx}
                                to={`/stock/${stock.symbol}`}
                                className="inline-flex items-center gap-2 px-3 py-1 mx-2 bg-emerald-500/20 text-emerald-300 hover:text-white hover:bg-emerald-500/40 rounded-full text-xs font-bold border border-emerald-500/30 transition-all"
                            >
                                <TrendingUp size={14} />
                                <span>{stock.symbol}</span>
                                <span className="font-mono">+{stock.changePercent.toFixed(1)}%</span>
                            </Link>
                        ))}
                    </Marquee>
                </div>
                
                <div className="flex-1">
                    <span className="text-red-400 text-xs font-bold mr-4">📉 TOP LOSERS</span>
                    <Marquee direction="right" speed={80} className="inline max-w-md">
                        {topLosers.map((stock, idx) => (
                            <Link
                                key={idx}
                                to={`/stock/${stock.symbol}`}
                                className="inline-flex items-center gap-2 px-3 py-1 mx-2 bg-red-500/20 text-red-300 hover:text-white hover:bg-red-500/40 rounded-full text-xs font-bold border border-red-500/30 transition-all"
                            >
                                <TrendingDown size={14} />
                                <span>{stock.symbol}</span>
                                <span className="font-mono">{stock.changePercent.toFixed(1)}%</span>
                            </Link>
                        ))}
                    </Marquee>
                </div>
            </div>

            {/* Main Scrolling Ticker */}
            <Marquee
                gradient={false}
                speed={55}
                pauseOnHover={true}
                className="py-4"
            >
                {stockPrices.map((stock, index) => {
                    const price = parseFloat(stock.price || 0);
                    const changePercent = parseFloat(stock.changePercent || 0);
const isUp = changePercent >= 0;

                    return (
                        <Link
                            key={`${stock.symbol}-${index}`}
                            to={`/stock/${stock.symbol}`}
                            className="inline-flex items-center gap-3 px-6 py-3 mx-3 bg-slate-900/80 hover:bg-slate-800/90 backdrop-blur-sm transition-all duration-200 rounded-xl border-2 border-slate-700/50 hover:border-slate-500/80 hover:shadow-lg hover:scale-[1.02] group"
                        >
                            {/* Symbol */}
                            <span className="text-blue-400 font-bold text-lg uppercase tracking-wider group-hover:text-blue-300 transition-colors">
                                {stock.symbol}
                            </span>

                            {/* Price */}
                            <span className="text-white font-black text-lg tabular-nums min-w-[90px] text-right">
                                {formatCurrency(price)}
                            </span>

                            {/* Change Badge */}
                            <div className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold shadow-lg transform group-hover:scale-105 transition-all ${
                                isUp 
                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25' 
                                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25'
                            }`}>
                                {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                <span className="tabular-nums font-black">
                                    {isUp ? '+' : ''}{changePercent.toFixed(1)}%
                                </span>
                            </div>

                            {/* Exchange Badge */}
                            {stock.exchange && (
    <div className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-500/30 ml-2">
        {stock.exchange}
    </div>
)}

                            {/* Separator */}
                            <div className="w-px h-6 bg-gradient-to-b from-slate-600 to-transparent ml-3" />
                        </Link>
                    );
                })}
            </Marquee>
        </div>
    );
};

export default StockTicker;
