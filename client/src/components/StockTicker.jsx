import React from 'react';
import useAuth from '../hooks/useAuth';
import { useStockPrices } from '../context/StockPriceContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Marquee from "react-fast-marquee";

const StockTicker = () => {
    const { user } = useAuth();
    const { stockPrices, isLoading } = useStockPrices();

    if (!user || isLoading || stockPrices.length === 0) {
        return null; // Optional: show a shimmer loader here
    }

    return (
        <div className="w-full h-12 bg-slate-800 border-b border-slate-700 shadow-sm flex items-center">
            <Marquee
                gradient={false}
                speed={70}
                pauseOnHover={true}
                className="w-full"
            >
                {stockPrices.map((stock) => {
                    const price = parseFloat(stock.price);
                    const prevClose = parseFloat(stock.previousClose);
                    const isUp = price >= prevClose;
                    const changePercent = prevClose !== 0
                        ? ((price - prevClose) / prevClose) * 100
                        : 0;

                    return (
                        <div
                            key={stock.symbol}
                            className="flex items-center gap-2 px-5 text-sm font-medium text-white flex-shrink-0"
                        >
                            <span className="text-slate-400">{stock.symbol}</span>
                            <span className="text-white font-semibold">{formatCurrency(price)}</span>
                            <span className={`flex items-center ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {changePercent.toFixed(2)}%
                            </span>
                        </div>
                    );
                })}
            </Marquee>
        </div>
    );
};

export default StockTicker;
