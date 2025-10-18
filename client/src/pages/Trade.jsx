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
import MLPrediction from '../components/MLPrediction';

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

    const stockData = useMemo(() => stockPrices.find(s => s.symbol === symbol), [symbol, stockPrices]);
    const currentHolding = useMemo(() => portfolio.find(s => s.symbol.toLowerCase() === (symbol || "").toLowerCase()), [portfolio, symbol]);

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

    useEffect(() => {
        if (symbol) sessionStorage.setItem('selectedStockSymbol', symbol);
    }, [symbol]);

    useEffect(() => {
        fetchPendingOrders();
        const interval = setInterval(fetchPendingOrders, 10000);
        return () => clearInterval(interval);
    }, [fetchPendingOrders]);

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
        <div className="min-h-screen bg-slate-950 text-white p-6">
            <div className="max-w-7xl mx-auto space-y-4">
                {/* Header */}
                <div className="border-b border-slate-800 pb-4">
                    <h1 className="text-2xl font-bold">Live Trading</h1>
                    <p className="text-sm text-slate-400 mt-1">Real-time trading with Yahoo Finance BSE data & AI predictions</p>
                </div>

                {/* Wallet & Stock Selector Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded p-4">
                        <div className="text-sm text-slate-400 mb-1">Wallet Balance</div>
                        <div className="text-2xl font-bold text-emerald-400">{formatCurrency(walletBalance)}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded p-4">
                        <label className="text-sm text-slate-400 block mb-2">Select Stock</label>
                        <select
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
                    </div>
                </div>

                {stockData && (
                    <div className="grid grid-cols-3 gap-4">
                        {/* Left: Chart */}
                        <div className="col-span-2 space-y-4">
                            <div className="bg-slate-900 border border-slate-800 rounded p-4">
                                <StockCard {...stockData} />
                                
                                <div className="flex gap-2 mt-4 mb-4">
                                    <button 
                                        onClick={() => setChartType('line')}
                                        className={`px-4 py-2 rounded text-sm ${chartType === 'line' ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
                                    >
                                        Line Chart
                                    </button>
                                    <button 
                                        onClick={() => setChartType('candlestick')}
                                        className={`px-4 py-2 rounded text-sm ${chartType === 'candlestick' ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
                                    >
                                        Candlestick
                                    </button>
                                </div>

                                {historyLoading ? (
                                    <div className="h-80 bg-slate-800 rounded"></div>
                                ) : (
                                    chartType === 'line' ? 
                                        <StockChart data={historyData} symbol={symbol} /> :
                                        <CandlestickChart data={historyData} />
                                )}
                            </div>

                            <StockDetails stockData={stockData} />
                        </div>

                        {/* Right: Trading & AI */}
                        <div className="space-y-4">
                            {/* Holdings */}
                            <div className="bg-slate-900 border border-slate-800 rounded p-4">
                                <div className="text-sm text-slate-400 mb-2">Your Holdings</div>
                                <div className="text-2xl font-bold text-blue-400">
                                    {currentHolding ? currentHolding.quantity : 0} Shares
                                </div>
                                {currentHolding && (
                                    <div className="text-sm text-slate-500 mt-1">
                                        Avg: {formatCurrency(currentHolding.avgBuyPrice)}
                                    </div>
                                )}
                            </div>

                            

                            {/* Order Type */}
                            <div className="bg-slate-900 border border-slate-800 rounded p-4">
                                <div className="text-sm text-slate-400 mb-3">Order Type</div>
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
                            <div className="bg-slate-900 border border-slate-800 rounded p-4">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm text-slate-400 block mb-2">Quantity</label>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    {orderType !== 'MARKET' && (
                                        <div>
                                            <label className="text-sm text-slate-400 block mb-2">Target Price</label>
                                            <input
                                                type="number"
                                                value={targetPrice}
                                                onChange={(e) => setTargetPrice(e.target.value)}
                                                placeholder="Enter price"
                                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    )}

                                    {stockData && orderType === 'MARKET' && (
                                        <div className="bg-slate-800 rounded p-3 text-sm">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-slate-400">Subtotal:</span>
                                                <span>{formatCurrency(parseFloat(stockData.price) * quantity)}</span>
                                            </div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-slate-400">Brokerage:</span>
                                                <span>{formatCurrency(20)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold border-t border-slate-700 pt-2 mt-2">
                                                <span>Total:</span>
                                                <span>{formatCurrency(parseFloat(stockData.price) * quantity + 20)}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handlePlaceOrder('BUY')}
                                            disabled={tradeLoading}
                                            className="py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:opacity-50 rounded font-semibold"
                                        >
                                            {tradeLoading ? 'Processing...' : 'Buy'}
                                        </button>
                                        <button
                                            onClick={() => handlePlaceOrder('SELL')}
                                            disabled={tradeLoading || (orderType === 'MARKET' && (!currentHolding || currentHolding.quantity < quantity))}
                                            className="py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:opacity-50 rounded font-semibold"
                                        >
                                            {tradeLoading ? 'Processing...' : 'Sell'}
                                        </button>
                                    </div>

                                    {tradeMessage.text && (
                                        <div className={`text-center text-sm py-2 rounded ${
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
                                <div className="bg-slate-900 border border-slate-800 rounded p-4">
                                    <div className="text-sm text-slate-400 mb-3">
                                        Pending Orders ({pendingOrders.length})
                                    </div>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {pendingOrders.map(order => (
                                            <div key={order._id} className="bg-slate-800 rounded p-3 text-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="font-bold">{order.symbol}</span>
                                                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                                            order.tradeType === 'BUY' ? 'bg-blue-900 text-blue-300' : 'bg-emerald-900 text-emerald-300'
                                                        }`}>
                                                            {order.tradeType}
                                                        </span>
                                                        <span className="ml-1 text-slate-400 text-xs">{order.orderType}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCancelOrder(order._id)}
                                                        className="text-red-400 hover:text-red-300 text-xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                                <div className="text-slate-400">
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
