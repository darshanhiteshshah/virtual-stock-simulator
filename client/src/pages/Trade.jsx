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
import { Loader2, ArrowLeftRight, Star, Bell } from "lucide-react";
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
        return <div className="flex justify-center items-center h-full p-8"><Loader2 className="animate-spin text-orange-400" size={48} /></div>;
    }

    return (
        <div className="p-4 md:p-6 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-orange-400 flex items-center gap-2"><ArrowLeftRight /> Live Trading</h1>
            <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                <h2 className="text-sm font-semibold text-orange-300">WALLET BALANCE</h2>
                <p className="text-3xl font-bold text-green-400">{formatCurrency(walletBalance)}</p>
            </div>
            <div className="mb-6">
                <label htmlFor="stock-select" className="block mb-2 text-sm font-medium text-gray-400">Select a Stock</label>
                <select
                    id="stock-select"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="p-3 w-full rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={pricesLoading || stockPrices.length === 0}
                >
                    {pricesLoading && stockPrices.length === 0 ? <option>Loading stocks...</option> :
                        stockPrices.map(stock => (
                            <option key={stock.symbol} value={stock.symbol}>{stock.name} ({stock.symbol})</option>
                        ))
                    }
                </select>
            </div>
            
            {pricesLoading && !stockData && <div className="text-center p-4 text-blue-400">Loading market data...</div>}
            
            {stockData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-700">
                            <div className="flex justify-between items-start">
                                <div className="flex-grow"><StockCard {...stockData} /></div>
                                <button onClick={handleWatchlistToggle} className="p-2 ml-4 rounded-full hover:bg-gray-700">
                                    <Star size={24} className={isStockInWatchlist ? "text-yellow-400 fill-yellow-400" : "text-gray-500"} />
                                </button>
                            </div>
                            <div className="flex justify-end mt-4">
                                <div className="flex items-center bg-gray-800 rounded-lg p-1">
                                    <button onClick={() => setChartType('line')} className={`px-3 py-1 text-sm rounded-md ${chartType === 'line' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}>Line</button>
                                    <button onClick={() => setChartType('candlestick')} className={`px-3 py-1 text-sm rounded-md ${chartType === 'candlestick' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}>Candlestick</button>
                                </div>
                            </div>
                            {historyLoading ? 
                                <div className="h-64 w-full mt-4 bg-gray-800 rounded-lg animate-pulse"></div> :
                                (chartType === 'line' ? <StockChart data={historyData} /> : <CandlestickChart data={historyData} />)
                            }
                        </div>
                        <StockDetails stockData={stockData} />
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-800 p-5 rounded-lg">
                            <h3 className="text-lg font-semibold text-orange-300 mb-2">Your Holdings: {stockData.symbol}</h3>
                            <p className="text-2xl font-bold text-blue-300">{currentHolding ? currentHolding.quantity : 0} Shares</p>
                            {currentHolding && <p className="text-sm text-gray-400 mt-1">Avg. Buy Price: {formatCurrency(currentHolding.avgBuyPrice)}</p>}
                        </div>

                        <div className="bg-gray-800 p-5 rounded-lg">
                            <h3 className="text-lg font-semibold text-orange-300 mb-3">Place Order</h3>
                            <div className="flex gap-2 mb-4 bg-gray-900 p-1 rounded-lg">
                                <button onClick={() => setOrderType('MARKET')} className={`flex-1 py-1 rounded-md text-sm ${orderType === 'MARKET' ? 'bg-orange-500' : ''}`}>Market</button>
                                <button onClick={() => setOrderType('LIMIT')} className={`flex-1 py-1 rounded-md text-sm ${orderType === 'LIMIT' ? 'bg-orange-500' : ''}`}>Limit</button>
                                <button onClick={() => setOrderType('STOP_LOSS')} className={`flex-1 py-1 rounded-md text-sm ${orderType === 'STOP_LOSS' ? 'bg-orange-500' : ''}`}>Stop-Loss</button>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <label htmlFor="quantity" className="text-gray-300">Qty:</label>
                                <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" className="w-24 p-2 rounded-lg bg-gray-700 text-white"/>
                                {orderType !== 'MARKET' && (
                                    <>
                                        <label htmlFor="targetPrice" className="text-gray-300">Price:</label>
                                        <input type="number" id="targetPrice" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="Target" className="w-24 p-2 rounded-lg bg-gray-700 text-white"/>
                                    </>
                                )}
                            </div>
                            <div className="text-xs text-gray-400 space-y-1 mb-4 border-t border-b border-gray-700 py-2">
                                {stockData && orderType === 'MARKET' &&
                                    <div className="flex justify-between">
                                        <span>Est. Total (BUY):</span>
                                        <span>{formatCurrency(parseFloat(stockData.price) * quantity + 20)}</span>
                                    </div>
                                }
                                <div className="flex justify-between">
                                    <span>Brokerage Fee:</span>
                                    <span>{formatCurrency(20)}</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => handlePlaceOrder('BUY')} disabled={tradeLoading} className="flex-1 py-3 bg-green-600 rounded-lg hover:bg-green-700 font-semibold">{tradeLoading ? "..." : "Buy"}</button>
                                <button onClick={() => handlePlaceOrder('SELL')} disabled={tradeLoading || (orderType === 'MARKET' && (!currentHolding || currentHolding.quantity < quantity))} className="flex-1 py-3 bg-red-600 rounded-lg hover:bg-red-700 font-semibold disabled:bg-red-800 disabled:cursor-not-allowed">{tradeLoading ? "..." : "Sell"}</button>
                            </div>
                            {tradeMessage.text && <p className={`mt-4 text-center text-sm ${tradeMessage.type === 'error' ? 'text-red-400' : "text-green-400"}`}>{tradeMessage.text}</p>}
                        </div>

                        <div className="bg-gray-800 p-5 rounded-lg">
                            <h3 className="text-lg font-semibold text-orange-300 mb-2">Pending Orders</h3>
                            <PendingOrdersTable orders={pendingOrders} onCancel={handleCancelOrder} />
                        </div>

                        <div className="bg-gray-800 p-5 rounded-lg">
                            <h3 className="text-lg font-semibold text-orange-300 mb-3 flex items-center gap-2"><Bell size={18} /> Create Price Alert</h3>
                            <form onSubmit={handleCreateAlert} className="flex flex-wrap items-center gap-4">
                                <span className="text-gray-300">Alert me when</span>
                                <select value={alertCondition} onChange={(e) => setAlertCondition(e.target.value)} className="p-2 rounded-lg bg-gray-700 border border-gray-600">
                                    <option value="below">Below</option>
                                    <option value="above">Above</option>
                                </select>
                                <input type="number" placeholder="Target Price" value={alertPrice} onChange={(e) => setAlertPrice(e.target.value)} className="w-32 p-2 rounded-lg bg-gray-700 border border-gray-600" />
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold">Set Alert</button>
                            </form> 
                            {alertMessage.text && <p className={`mt-3 text-sm ${alertMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{alertMessage.text}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trade;