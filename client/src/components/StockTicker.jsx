import React from 'react';
import useAuth from '../hooks/useAuth';
import { useEffect } from 'react';
import { useStockPrices } from '../context/StockPriceContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import Marquee from "react-fast-marquee";
import { Link } from 'react-router-dom';

const StockTicker = () => {
    const { user } = useAuth();
    const { stockPrices, isLoading, lastUpdated } = useStockPrices();

    if (!user || isLoading || stockPrices.length === 0) {
        return null;
    }

    return (
        <div className="w-full bg-slate-800 border-y border-slate-700">
            {/* Header with last update time */}
            {lastUpdated && (
                <div className="flex items-center justify-between px-6 py-2 bg-slate-900/50 border-b border-slate-700">
                    <span className="text-emerald-400 text-xs font-semibold">
                        🟢 LIVE BSE MARKET DATA
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Activity size={12} />
                        <span>
                            Updated: {lastUpdated.toLocaleTimeString('en-IN', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                timeZone: 'Asia/Kolkata' 
                            })} IST
                        </span>
                    </div>
                </div>
            )}

            <Marquee
                gradient={false}
                speed={50}
                pauseOnHover={true}
                className="py-3"
            >
                {stockPrices.map((stock, index) => {
                    const price = parseFloat(stock.price);
                    const prevClose = parseFloat(stock.previousClose);
                    const change = price - prevClose;
                    const changePercent = prevClose !== 0
                        ? ((change / prevClose) * 100)
                        : 0;
                    const isUp = change >= 0;

                    return (
                        <Link
                            key={`${stock.symbol}-${index}`}
                            to={`/stock/${stock.symbol}`}
                            className="inline-flex items-center gap-3 px-6 py-2 mx-2 bg-slate-900 hover:bg-slate-800 transition-colors rounded-lg border border-slate-700 hover:border-slate-600"
                        >
                            {/* Symbol */}
                            <span className="text-blue-400 font-bold text-base uppercase tracking-wide">
                                {stock.symbol}
                            </span>

                            {/* Price */}
                            <span className="text-white font-semibold text-base tabular-nums">
                                {formatCurrency(price)}
                            </span>

                            {/* Change Badge */}
                            <div className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium ${
                                isUp 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-red-500 text-white'
                            }`}>
                                {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                <span className="tabular-nums font-bold">
                                    {isUp ? '+' : ''}{changePercent.toFixed(2)}%
                                </span>
                            </div>

                            {/* Absolute Change */}
                            <span className={`text-sm font-medium tabular-nums ${
                                isUp ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                                {isUp ? '+' : ''}{change.toFixed(2)}
                            </span>

                            {/* Separator */}
                            <div className="w-px h-5 bg-slate-600 ml-2" />
                        </Link>
                    );
                })}
            </Marquee>
        </div>
    );
};

export default StockTicker;
