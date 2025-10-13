import React, { useEffect, useState, useMemo, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import { usePortfolio } from "../context/PortfolioContext";
import { useStockPrices } from "../context/StockPriceContext";
import { buyStock, sellStock, placeOrder, getPendingOrders, cancelOrder } from "../services/tradeService";
import { fetchStockHistory } from "../services/stockService";
import { formatCurrency } from "../utils/currencyFormatter";
import StockCard from "../components/StockCard";
import StockChart from "../components/StockChart";
import CandlestickChart from "../components/CandlestickChart";
import StockDetails from "../components/StockDetails";
import { Wallet, Briefcase, Bell, Star, BarChart3, CandlestickChart as CandleIcon, ShoppingCart, Banknote } from "lucide-react";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../services/watchlistService";
import { createAlert } from "../services/alertService";
import PendingOrdersTable from "../components/PendingOrdersTable";

const Trade = () => {
    const { user, loading: authLoading } = useAuth();
    const { portfolio, walletBalance, refetchPortfolio } = usePortfolio();
    const { stockPrices, isLoading: pricesLoading } = useStockPrices();
    const token = user?.token;

    const [symbol, setSymbol] = useState(() => sessionStorage.getItem('selectedStockSymbol') || '');
    const [quantity, setQuantity] = useState(1);
    const [tradeLoading, setTradeLoading] = useState(false);
    const [tradeMessage, setTradeMessage] = useState({ type: '', text: '' });
    const [watchlist, setWatchlist] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [alertPrice, setAlertPrice] = useState('');
    const [alertCondition, setAlertCondition] = useState('below');
    const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });
    const [chartType, setChartType] = useState('line');
    const [orderType, setOrderType] = useState('MARKET');
    const [targetPrice, setTargetPrice] = useState('');
    const [pendingOrders, setPendingOrders] = useState([]);

    const stockData = useMemo(() => stockPrices.find(s => s.symbol === symbol), [symbol, stockPrices]);
    const currentHolding = useMemo(() => portfolio.find(s => s.symbol.toLowerCase() === (symbol || "").toLowerCase()), [portfolio, symbol]);
    const isStockInWatchlist = useMemo(() => watchlist.includes(symbol), [watchlist, symbol]);

    const fetchPendingOrders = useCallback(async () => {
        if (token && !authLoading) {
            try {
                const orders = await getPendingOrders(token);
                setPendingOrders(orders);
            } catch (error) {
                console.error("Failed to fetch pending orders", error);
            }
        }
    }, [token, authLoading]);

    useEffect(() => {
        if (symbol) sessionStorage.setItem('selectedStockSymbol', symbol);
    }, [symbol]);

    useEffect(() => {
        const loadData = async () => {
            if (token && !authLoading) {
                try {
                    const res = await getWatchlist(token);
                    setWatchlist(res.data);
                } catch (error) {
                    console.error("Failed to load watchlist", error);
                }
                fetchPendingOrders();
            }
        };
        loadData();
    }, [token, authLoading, fetchPendingOrders]);

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
            setTradeMessage({ type: 'success', text: res.message });
            setTargetPrice('');
            fetchPendingOrders();
        } catch (err) {
            setTradeMessage({ type: 'error', text: err.response?.data?.message || `Failed to place order.` });
        } finally {
            setTradeLoading(false);
        }
    };

    const handleWatchlistToggle = async () => {
        if (!symbol || !token) return;
        try {
            const action = isStockInWatchlist ? removeFromWatchlist : addToWatchlist;
            const res = await action(symbol, token);
            setWatchlist(res.data);
        } catch (error) {
            console.error("Failed to update watchlist", error);
        }
    };
    
    const handleCancelOrder = async (orderId) => {
        try {
            await cancelOrder(orderId, token);
            fetchPendingOrders();
        } catch (error) {
            console.error("Failed to cancel order", error);
        }
    };

    const handleCreateAlert = async (e) => {
        e.preventDefault();
        setAlertMessage({ type: '', text: '' });
        if (!symbol || !alertPrice || isNaN(alertPrice) || alertPrice <= 0) {
            setAlertMessage({ type: 'error', text: 'Please enter a valid target price.' });
            return;
        }
        try {
            await createAlert({ symbol, targetPrice: parseFloat(alertPrice), condition: alertCondition }, token);
            setAlertMessage({ type: 'success', text: `Alert set for ${symbol}!` });
            setAlertPrice('');
        } catch (error) {
            setAlertMessage({ type: 'error', text: 'Failed to set alert.' });
            console.error("Failed to create alert", error);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Live Trading</h1>
                    <p className="text-slate-400 text-sm">Trade stocks in real-time with live market data</p>
                </div>

                {/* Wallet Balance */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                <Wallet className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Wallet Balance</p>
                                <p className="text-3xl font-bold text-white">{formatCurrency(walletBalance)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stock Selector */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                    <label htmlFor="stock-select" className="block mb-3 text-sm font-medium text-slate-300">
                        Select Stock
                    </label>
                    <select
                        id="stock-select"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                        disabled={pricesLoading || stockPrices.length === 0}
                    >
                        {pricesLoading && stockPrices.length === 0 ? (
                            <option>Loading stocks...</option>
                        ) : (
                            stockPrices.map(stock => (
                                <option key={stock.symbol} value={stock.symbol}>
                                    {stock.name} ({stock.symbol})
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {pricesLoading && !stockData && (
                    <div className="text-center p-8">
                        <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-400 text-sm">Loading market data...</p>
                    </div>
                )}

                {stockData && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Chart & Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Stock Card with Chart */}
                            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <StockCard {...stockData} />
                                    </div>
                                    <button 
                                        onClick={handleWatchlistToggle} 
                                        className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                                        title={isStockInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                                    >
                                        <Star 
                                            size={24} 
                                            className={isStockInWatchlist ? "text-yellow-400 fill-yellow-400" : "text-slate-500"} 
                                        />
                                    </button>
                                </div>

                                {/* Chart Toggle */}
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-white">Price Chart</h3>
                                    <div className="inline-flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                                        <button 
                                            onClick={() => setChartType('line')} 
                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                                                chartType === 'line' 
                                                    ? 'bg-blue-600 text-white shadow-lg' 
                                                    : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            <BarChart3 size={16} />
                                            Line
                                        </button>
                                        <button 
                                            onClick={() => setChartType('candlestick')} 
                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                                                chartType === 'candlestick' 
                                                    ? 'bg-blue-600 text-white shadow-lg' 
                                                    : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            <CandleIcon size={16} />
                                            Candlestick
                                        </button>
                                    </div>
                                </div>

                                {/* Chart */}
                                {historyLoading ? (
                                    <div className="h-80 w-full bg-slate-800/30 rounded-lg animate-pulse"></div>
                                ) : (
                                    chartType === 'line' ? (
                                        <StockChart data={historyData} symbol={symbol} />
                                    ) : (
                                        <CandlestickChart data={historyData} />
                                    )
                                )}
                            </div>

                            {/* Stock Details */}
                            <StockDetails stockData={stockData} />
                        </div>

                        {/* Right Column: Trading Panel */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Holdings Card */}
                            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                        <Briefcase className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Your Holdings</h3>
                                </div>
                                <p className="text-3xl font-bold text-blue-400 mb-2">
                                    {currentHolding ? currentHolding.quantity : 0} Shares
                                </p>
                                {currentHolding && (
                                    <p className="text-sm text-slate-400">
                                        Avg. Buy: {formatCurrency(currentHolding.avgBuyPrice)}
                                    </p>
                                )}
                            </div>

                            {/* Order Panel */}
                            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Place Order</h3>

                                {/* Order Type Tabs */}
                                <div className="grid grid-cols-3 gap-2 mb-6 bg-slate-800/30 p-1 rounded-lg">
                                    {['MARKET', 'LIMIT', 'STOP_LOSS'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setOrderType(type)}
                                            className={`py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                                                orderType === type
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            {type.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>

                                {/* Input Fields */}
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-slate-300">Quantity</label>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            min="1"
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                                        />
                                    </div>

                                    {orderType !== 'MARKET' && (
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-slate-300">Target Price</label>
                                            <input
                                                type="number"
                                                value={targetPrice}
                                                onChange={(e) => setTargetPrice(e.target.value)}
                                                placeholder="Enter target price"
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder-slate-500"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Order Summary */}
                                {stockData && orderType === 'MARKET' && (
                                    <div className="bg-slate-800/30 rounded-lg p-4 mb-6 space-y-2 text-sm">
                                        <div className="flex justify-between text-slate-400">
                                            <span>Subtotal:</span>
                                            <span>{formatCurrency(parseFloat(stockData.price) * quantity)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>Brokerage:</span>
                                            <span>{formatCurrency(20)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-white pt-2 border-t border-slate-700">
                                            <span>Total:</span>
                                            <span>{formatCurrency(parseFloat(stockData.price) * quantity + 20)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Trade Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handlePlaceOrder('BUY')}
                                        disabled={tradeLoading}
                                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {tradeLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <ShoppingCart size={18} />
                                                Buy
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handlePlaceOrder('SELL')}
                                        disabled={tradeLoading || (orderType === 'MARKET' && (!currentHolding || currentHolding.quantity < quantity))}
                                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {tradeLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Banknote size={18} />
                                                Sell
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Trade Message */}
                                {tradeMessage.text && (
                                    <div className={`mt-4 p-3 rounded-lg text-sm text-center ${
                                        tradeMessage.type === 'error'
                                            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                    }`}>
                                        {tradeMessage.text}
                                    </div>
                                )}
                            </div>

                            {/* Pending Orders */}
                            {pendingOrders.length > 0 && (
                                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Pending Orders</h3>
                                    <PendingOrdersTable orders={pendingOrders} onCancel={handleCancelOrder} />
                                </div>
                            )}

                            {/* Price Alert */}
                            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Bell className="w-5 h-5 text-blue-400" />
                                    <h3 className="text-lg font-semibold text-white">Price Alert</h3>
                                </div>
                                <form onSubmit={handleCreateAlert} className="space-y-4">
                                    <div className="flex gap-2">
                                        <select
                                            value={alertCondition}
                                            onChange={(e) => setAlertCondition(e.target.value)}
                                            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
                                        >
                                            <option value="below">Below</option>
                                            <option value="above">Above</option>
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Target Price"
                                            value={alertPrice}
                                            onChange={(e) => setAlertPrice(e.target.value)}
                                            className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder-slate-500"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-all duration-200"
                                    >
                                        Set Alert
                                    </button>
                                </form>
                                {alertMessage.text && (
                                    <p className={`mt-3 text-sm text-center ${
                                        alertMessage.type === 'error' ? 'text-red-400' : 'text-emerald-400'
                                    }`}>
                                        {alertMessage.text}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Trade;
