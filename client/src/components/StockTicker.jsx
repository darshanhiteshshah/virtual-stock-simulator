import React from 'react';
import useAuth from '../hooks/useAuth';
import { useStockPrices } from '../context/StockPriceContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Marquee from "react-fast-marquee";
import { Link } from 'react-router-dom';

const StockTicker = () => {
    const { user } = useAuth();
    const { stockPrices, isLoading, lastUpdated } = useStockPrices();

    if (!user || isLoading || stockPrices.length === 0) {
        return null;
    }

    const tickerItems = stockPrices.slice(0, 18);

    return (
        <div className="w-full bg-slate-950/95 border-b border-slate-800/70 shadow-sm sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 py-2 text-[0.72rem] text-slate-300 backdrop-blur-sm">
                <div className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/30" />
                    <span className="font-semibold uppercase tracking-[0.18em] text-slate-200">Live market feed</span>
                    <span className="text-slate-500">{stockPrices.length} symbols</span>
                </div>

                {lastUpdated && (
                    <span className="text-slate-500 font-mono">
                        {lastUpdated.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Asia/Kolkata'
                        })} IST
                    </span>
                )}
            </div>

            <div className="h-11 overflow-hidden border-t border-slate-800/60">
                <Marquee
                    gradient={false}
                    speed={60}
                    pauseOnHover={true}
                    className="h-full flex items-center text-[0.75rem] text-slate-200"
                >
                    {tickerItems.map((stock, index) => {
                        const price = parseFloat(stock.price || 0);
                        const changePercent = parseFloat(stock.changePercent || 0);
                        const isUp = changePercent >= 0;

                        return (
                            <Link
                                key={`${stock.symbol}-${index}`}
                                to={`/stock/${stock.symbol}`}
                                className="inline-flex items-center gap-2 px-3 py-1 mx-2 rounded-full border border-slate-700/60 bg-slate-900/80 text-xs text-slate-100 hover:bg-slate-800/90 transition-all"
                            >
                                <span className="font-semibold uppercase tracking-[0.08em] text-slate-100">{stock.symbol}</span>
                                <span className="font-mono text-slate-300">{formatCurrency(price)}</span>
                                <span className={
                                    `font-semibold ${isUp ? 'text-emerald-300' : 'text-rose-300'}`
                                }>
                                    {isUp ? '+' : ''}{changePercent.toFixed(1)}%
                                </span>
                            </Link>
                        );
                    })}
                </Marquee>
            </div>
        </div>
    );
};

export default StockTicker;
