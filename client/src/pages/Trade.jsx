import React, { useEffect, useState, useMemo, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import { usePortfolio } from "../context/PortfolioContext";
import { useStockPrices } from "../context/StockPriceContext";
import { buyStock, sellStock, placeOrder, getPendingOrders, cancelOrder } from "../services/tradeService";
import { fetchStockHistory } from "../services/stockService";
import { addToWatchlist, getWatchlist } from "../services/watchlistService";
import { formatCurrency } from "../utils/currencyFormatter";
import StockCard from "../components/StockCard";
import StockChart from "../components/StockChart";
import CandlestickChart from "../components/CandlestickChart";
import StockDetails from "../components/StockDetails";
import { Star } from "lucide-react";

const Trade = () => {
    const { user, loading: authLoading } = useAuth();
    const { portfolio, walletBalance, refetchPortfolio } = usePortfolio();
    const { stockPrices, isLoading: pricesLoading } = useStockPrices();
    const token = user?.token;

    const [symbol, setSymbol] = useState(() => sessionStorage.getItem('selectedStockSymbol') || '');
    const [quantity, setQuantity] = useState(1);
    const [tradeLoading, setTradeLoading] = useState(false);
    const [tradeMessage, setTradeMessage] = useState({ type: '', text: '' });
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [chartType, setChartType] = useState('line');
    const [orderType, setOrderType] = useState('MARKET');
    const [targetPrice, setTargetPrice] = useState('');
    const [pendingOrders, setPendingOrders] = useState([]);
    const [watchlist, setWatchlist] = useState([]);

    const stockData = useMemo(() => stockPrices.find(s => s.symbol === symbol), [symbol, stockPrices]);
    const currentHolding = useMemo(() => portfolio.find(s => s.symbol.toLowerCase() === (symbol || "").toLowerCase()), [portfolio, symbol]);
    const isInWatchlist = useMemo(() => watchlist.includes(symbol), [watchlist, symbol]);

    const fetchPendingOrders = useCallback(async () => {
        if (token && !authLoading) {
            try {
                const data = await getPendingOrders(token);
                setPendingOrders(data.orders || data || []);
            } catch (error) {
                console.error("Failed to fetch pending orders", error);
            }
        }
    }, [token, authLoading]);

    const fetchWatchlist = useCallback(async () => {
        if (token && !authLoading) {
            try {
                const data = await getWatchlist(token);
                setWatchlist(data.watchlist || []);
            } catch (error) {
                console.error("Failed to fetch watchlist", error);
            }
        }
    }, [token, authLoading]);

    useEffect(() => {
        if (symbol) sessionStorage.setItem('selectedStockSymbol', symbol);
    }, [symbol]);

    useEffect(() => {
        fetchPendingOrders();
        fetchWatchlist();
        const interval = setInterval(fetchPendingOrders, 10000);
        return () => clearInterval(interval);
    }, [fetchPendingOrders, fetchWatchlist]);

    useEffect(() => {
        if (!symbol && stockPrices.length > 0) {
            setSymbol(stockPrices[0].symbol);
        }
    }, [stockPrices, symbol]);

    useEffect(() => {
        const fetchHistory = async (symbolToFetch) => {
            if (!symbolToFetch || !token || authLoading) return;
            setHistoryLoading(true);
            try {
                const historyRes = await fetchStockHistory(symbolToFetch, token);
                setHistoryData(historyRes);
            } catch (err) {
                console.error("Failed to fetch stock history:", err);
                setHistoryData([]);
            } finally {
                setHistoryLoading(false);
            }
        };
        fetchHistory(symbol);
    }, [symbol, token, authLoading]);

    const handleAddToWatchlist = async () => {
        if (!symbol || !token) return;

        try {
            await addToWatchlist(symbol, token);
            setTradeMessage({ type: 'success', text: `${symbol} added to watchlist!` });
            setTimeout(() => setTradeMessage({ type: '', text: '' }), 3000);
            fetchWatchlist();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add to watchlist';
            setTradeMessage({ type: 'error', text: message });
            setTimeout(() => setTradeMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleTrade = async (tradeType) => {
        if (!token || !stockData || !stockData.price || parseFloat(stockData.price) <= 0) {
            setTradeMessage({ type: 'error', text: "Cannot trade. Live price is not available." });
            return;
        }
        if (quantity <= 0) {
            setTradeMessage({ type: 'error', text: "Quantity must be greater than 0." });
            return;
        }
        if (tradeType === 'SELL' && (!currentHolding || currentHolding.quantity < quantity)) {
            setTradeMessage({ type: 'error', text: "You do not own enough shares to sell." });
            return;
        }

        setTradeLoading(true);
        setTradeMessage({ type: '', text: '' });
        try {
            const action = tradeType === 'BUY' ? buyStock : sellStock;
            const res = await action(stockData.symbol, quantity, token);
            setTradeMessage({ type: 'success', text: res.message });
            setTimeout(() => setTradeMessage({ type: '', text: '' }), 3000);
            await refetchPortfolio();
        } catch (err) {
            setTradeMessage({ type: 'error', text: err.response?.data?.message || `Failed to ${tradeType.toLowerCase()} stock.` });
        } finally {
            setTradeLoading(false);
        }
    };

    const handlePlaceOrder = async (tradeType) => {
        if (orderType === 'MARKET') {
            await handleTrade(tradeType);
            return;
        }

        if (!targetPrice || isNaN(targetPrice) || targetPrice <= 0) {
            setTradeMessage({ type: 'error', text: 'Please enter a valid target price.' });
            return;
        }
        if (quantity <= 0) {
            setTradeMessage({ type: 'error', text: "Quantity must be greater than 0." });
            return;
        }
        
        setTradeLoading(true);
        setTradeMessage({ type: '', text: '' });
        try {
            const orderData = {
                symbol: stockData.symbol,
                quantity: Number(quantity),
                targetPrice: parseFloat(targetPrice),
                orderType,
                tradeType,
            };
            const res = await placeOrder(orderData, token);
            setTradeMessage({ type: 'success', text: res.message || 'Order placed successfully' });
            setTimeout(() => setTradeMessage({ type: '', text: '' }), 3000);
            setTargetPrice('');
            fetchPendingOrders();
        } catch (err) {
            setTradeMessage({ type: 'error', text: err.response?.data?.message || `Failed to place order.` });
        } finally {
            setTradeLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            await cancelOrder(orderId, token);
            setTradeMessage({ type: 'success', text: 'Order cancelled' });
            setTimeout(() => setTradeMessage({ type: '', text: '' }), 2000);
            fetchPendingOrders();
        } catch (error) {
            setTradeMessage({ type: 'error', text: 'Failed to cancel order' });
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-3 sm:p-4 md:p-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
                {/* Header */}
                <div className="border-b border-slate-800 pb-3 sm:pb-4">
                    <h1 className="text-xl sm:text-2xl font-bold">Live Trading</h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">Real-time trading with Yahoo Finance BSE data</p>
                </div>

                {/* Wallet & Stock Selector Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded p-3 sm:p-4">
                        <div className="text-xs sm:text-sm text-slate-400 mb-1">Wallet Balance</div>
                        <div className="text-xl sm:text-2xl font-bold text-emerald-400">{formatCurrency(walletBalance)}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded p-3 sm:p-4">
                        <label className="text-xs sm:text-sm text-slate-400 block mb-2">Select Stock</label>
                        <div className="flex gap-2">
                            <select
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                                className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded px-2 sm:px-3 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500"
                                disabled={pricesLoading}
                            >
                                {pricesLoading ? (
                                    <option>Loading...</option>
                                ) : (
                                    stockPrices.map(stock => (
                                        <option key={stock.symbol} value={stock.symbol}>
                                            {stock.name} ({stock.symbol})
                                        </option>
                                    ))
                                )}
                            </select>
                            
                            {/* Add to Watchlist Button */}
                            <button
                                onClick={handleAddToWatchlist}
                                disabled={isInWatchlist}
                                className={`px-2 sm:px-3 py-2 rounded transition-colors flex items-center gap-1 sm:gap-2 flex-shrink-0 ${
                                    isInWatchlist
                                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                                }`}
                                title={isInWatchlist ? 'Already in watchlist' : 'Add to watchlist'}
                            >
                                <Star className={`w-4 h-4 ${isInWatchlist ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                <span className="hidden sm:inline text-sm">{isInWatchlist ? 'Added' : 'Watch'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {stockData && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                        {/* Left: Chart - Full width on mobile, 2/3 on desktop */}
                        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                            <div className="bg-slate-900 border border-slate-800 rounded p-3 sm:p-4">
                                <StockCard {...stockData} />
                                
                                <div className="flex gap-2 mt-3 sm:mt-4 mb-3 sm:mb-4">
                                    <button 
                                        onClick={() => setChartType('line')}
                                        className={`px-3 sm:px-4 py-2 rounded text-xs sm:text-sm ${chartType === 'line' ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
                                    >
                                        Line Chart
                                    </button>
                                    <button 
                                        onClick={() => setChartType('candlestick')}
                                        className={`px-3 sm:px-4 py-2 rounded text-xs sm:text-sm ${chartType === 'candlestick' ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
                                    >
                                        Candlestick
                                    </button>
                                </div>

                                {historyLoading ? (
                                    <div className="h-64 sm:h-80 bg-slate-800 rounded"></div>
                                ) : (
                                    <div className="w-full overflow-hidden">
                                        {chartType === 'line' ? 
                                            <StockChart data={historyData} symbol={symbol} /> :
                                            <CandlestickChart data={historyData} />
                                        }
                                    </div>
                                )}
                            </div>

                            <StockDetails stockData={stockData} />
                        </div>

                        {/* Right: Trading - Full width on mobile, 1/3 on desktop */}
                        <div className="space-y-3 sm:space-y-4">
                            {/* Holdings */}
                            <div className="bg-slate-900 border border-slate-800 rounded p-3 sm:p-4">
                                <div className="text-xs sm:text-sm text-slate-400 mb-2">Your Holdings</div>
                                <div className="text-xl sm:text-2xl font-bold text-blue-400">
                                    {currentHolding ? currentHolding.quantity : 0} Shares
                                </div>
                                {currentHolding && (
                                    <div className="text-xs sm:text-sm text-slate-500 mt-1">
                                        Avg: {formatCurrency(currentHolding.avgBuyPrice)}
                                    </div>
                                )}
                            </div>

                            {/* Order Type */}
                            <div className="bg-slate-900 border border-slate-800 rounded p-3 sm:p-4">
                                <div className="text-xs sm:text-sm text-slate-400 mb-3">Order Type</div>
                                <div className="grid grid-cols-3 gap-2">
                                    {['MARKET', 'LIMIT', 'STOP_LOSS'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setOrderType(type)}
                                            className={`py-2 rounded text-xs ${
                                                orderType === type
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                        >
                                            {type.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Trade Form */}
                            <div className="bg-slate-900 border border-slate-800 rounded p-3 sm:p-4">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs sm:text-sm text-slate-400 block mb-2">Quantity</label>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    {orderType !== 'MARKET' && (
                                        <div>
                                            <label className="text-xs sm:text-sm text-slate-400 block mb-2">Target Price</label>
                                            <input
                                                type="number"
                                                value={targetPrice}
                                                onChange={(e) => setTargetPrice(e.target.value)}
                                                placeholder="Enter price"
                                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    )}

                                    {stockData && orderType === 'MARKET' && (
                                        <div className="bg-slate-800 rounded p-3 text-xs sm:text-sm">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-slate-400">Subtotal:</span>
                                                <span className="break-all text-right">{formatCurrency(parseFloat(stockData.price) * quantity)}</span>
                                            </div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-slate-400">Brokerage:</span>
                                                <span>{formatCurrency(20)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold border-t border-slate-700 pt-2 mt-2">
                                                <span>Total:</span>
                                                <span className="break-all text-right">{formatCurrency(parseFloat(stockData.price) * quantity + 20)}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handlePlaceOrder('BUY')}
                                            disabled={tradeLoading}
                                            className="py-2 sm:py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:opacity-50 rounded font-semibold text-sm sm:text-base"
                                        >
                                            {tradeLoading ? 'Processing...' : 'Buy'}
                                        </button>
                                        <button
                                            onClick={() => handlePlaceOrder('SELL')}
                                            disabled={tradeLoading || (orderType === 'MARKET' && (!currentHolding || currentHolding.quantity < quantity))}
                                            className="py-2 sm:py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:opacity-50 rounded font-semibold text-sm sm:text-base"
                                        >
                                            {tradeLoading ? 'Processing...' : 'Sell'}
                                        </button>
                                    </div>

                                    {tradeMessage.text && (
                                        <div className={`text-center text-xs sm:text-sm py-2 rounded break-words ${
                                            tradeMessage.type === 'error'
                                                ? 'bg-red-900/30 text-red-400 border border-red-800'
                                                : 'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                                        }`}>
                                            {tradeMessage.text}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pending Orders */}
                            {pendingOrders.length > 0 && (
                                <div className="bg-slate-900 border border-slate-800 rounded p-3 sm:p-4">
                                    <div className="text-xs sm:text-sm text-slate-400 mb-3">
                                        Pending Orders ({pendingOrders.length})
                                    </div>
                                    <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                                        {pendingOrders.map(order => (
                                            <div key={order._id} className="bg-slate-800 rounded p-2 sm:p-3 text-xs sm:text-sm">
                                                <div className="flex justify-between items-start mb-2 gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <span className="font-bold truncate">{order.symbol}</span>
                                                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                                            order.tradeType === 'BUY' ? 'bg-blue-900 text-blue-300' : 'bg-emerald-900 text-emerald-300'
                                                        }`}>
                                                            {order.tradeType}
                                                        </span>
                                                        <span className="ml-1 text-slate-400 text-xs">{order.orderType}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCancelOrder(order._id)}
                                                        className="text-red-400 hover:text-red-300 text-xs flex-shrink-0"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                                <div className="text-slate-400 text-xs break-words">
                                                    Qty: {order.quantity} • Target: ₹{order.targetPrice || order.stopPrice}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Trade;
