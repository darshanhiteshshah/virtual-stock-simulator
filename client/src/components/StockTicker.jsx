import React from 'react';
import useAuth from '../hooks/useAuth';
import { useStockPrices } from '../context/StockPriceContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Marquee from "react-fast-marquee";
import { Link } from 'react-router-dom';

const StockTicker = () => {
    const { user } = useAuth();
    const { stockPrices, isLoading } = useStockPrices();

    if (!user || isLoading || stockPrices.length === 0) {
        return null;
    }

    return (
        <div className="w-full bg-slate-900/80 backdrop-blur-sm border-b border-slate-800/50">
            <Marquee
                gradient={false}
                speed={50}
                pauseOnHover={true}
                className="py-2"
            >
                {stockPrices.map((stock) => {
                    const price = parseFloat(stock.price);
                    const prevClose = parseFloat(stock.previousClose);
                    const isUp = price >= prevClose;
                    const changePercent = prevClose !== 0
                        ? ((price - prevClose) / prevClose) * 100
                        : 0;

                    return (
                        <Link
                            key={stock.symbol}
                            to={`/stock/${stock.symbol}`}
                            className="flex items-center gap-3 px-6 hover:bg-slate-800/50 transition-colors rounded-lg py-1 mx-1"
                        >
                            {/* Symbol */}
                            <span className="text-blue-400 font-bold text-sm uppercase">
                                {stock.symbol}
                            </span>

                            {/* Price */}
                            <span className="text-white font-semibold text-sm">
                                {formatCurrency(price)}
                            </span>

                            {/* Change Badge */}
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                isUp 
                                    ? 'bg-emerald-500/10 text-emerald-400' 
                                    : 'bg-red-500/10 text-red-400'
                            }`}>
                                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {isUp ? '+' : ''}{changePercent.toFixed(2)}%
                            </div>

                            {/* Separator */}
                            <div className="w-px h-4 bg-slate-700/50 ml-2" />
                        </Link>
                    );
                })}
            </Marquee>
        </div>
    );
};

export default StockTicker;
