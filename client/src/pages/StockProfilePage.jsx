import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { fetchStockProfile } from '../services/stockService';
import { ArrowLeft, Newspaper, BarChart3, CandlestickChart as CandleIcon, TrendingUp } from 'lucide-react';
import StockCard from '../components/StockCard';
import StockChart from '../components/StockChart';
import CandlestickChart from '../components/CandlestickChart';
import StockDetails from '../components/StockDetails';
import { formatDate } from '../utils/dateFormatter';

const StockProfilePage = () => {
    const { symbol } = useParams();
    const { user } = useAuth();
    const [stock, setStock] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [chartType, setChartType] = useState('line');

    useEffect(() => {
        const loadProfile = async () => {
            if (user?.token && symbol) {
                setIsLoading(true);
                try {
                    const data = await fetchStockProfile(symbol, user.token);
                    setStock(data);
                } catch (error) {
                    console.error("Failed to load stock profile", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadProfile();
    }, [symbol, user]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Loading stock data...</p>
                </div>
            </div>
        );
    }

    if (!stock) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center">
                    <p className="text-red-400 text-lg mb-4">Could not load data for this stock</p>
                    <Link 
                        to="/trade" 
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all"
                    >
                        <ArrowLeft size={20} />
                        Back to Trading
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <Link 
                        to="/trade" 
                        className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                        title="Back to trading"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{symbol}</h1>
                        <p className="text-slate-400 text-sm">{stock.profile.name}</p>
                    </div>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Core Info & Charts */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stock Card */}
                        <StockCard {...stock.profile} />

                        {/* Chart Section */}
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                            {/* Chart Type Toggle */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">Price Chart</h2>
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

                            {/* Chart Display */}
                            {chartType === 'line' ? (
                                <StockChart data={stock.history} symbol={symbol} />
                            ) : (
                                <CandlestickChart data={stock.history} />
                            )}
                        </div>

                        {/* Stock Details */}
                        <StockDetails stockData={stock.profile} />
                    </div>

                    {/* Right Column: News & Trading */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Related News */}
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Newspaper size={20} className="text-blue-400" />
                                <h2 className="text-lg font-semibold text-white">Related News</h2>
                            </div>

                            {stock.news && stock.news.length > 0 ? (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {stock.news.map((item, index) => (
                                        <div 
                                            key={index} 
                                            className="bg-slate-800/30 p-4 rounded-lg border border-slate-800/50 hover:border-slate-700/50 transition-colors"
                                        >
                                            <p className="text-sm text-white font-medium mb-2 leading-relaxed">
                                                {item.headline}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span>{formatDate(item.date)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                        <Newspaper className="w-8 h-8 text-slate-600" />
                                    </div>
                                    <p className="text-slate-400 text-sm">No news available</p>
                                </div>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={20} className="text-blue-400" />
                                <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                    <span className="text-sm text-slate-400">Current Price</span>
                                    <span className="text-sm font-semibold text-white">
                                        ₹{parseFloat(stock.profile.price).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                    <span className="text-sm text-slate-400">Sector</span>
                                    <span className="text-sm font-medium text-blue-400">{stock.profile.sector}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-slate-400">Volume</span>
                                    <span className="text-sm font-medium text-slate-300">
                                        {stock.profile.volume ? (stock.profile.volume / 1000000).toFixed(2) + 'M' : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockProfilePage;
