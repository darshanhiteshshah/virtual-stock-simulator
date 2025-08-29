import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { fetchStockProfile } from '../services/stockService';
import { Loader2, Newspaper } from 'lucide-react';
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
        return <div className="flex justify-center items-center h-screen"><Loader2 size={48} className="animate-spin text-orange-400" /></div>;
    }

    if (!stock) {
        return <div className="text-center text-red-400 p-8">Could not load data for this stock.</div>;
    }

    return (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Core Info & Charts */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                    <StockCard {...stock.profile} />
                     <div className="flex justify-end mt-4">
                        <div className="flex items-center bg-gray-800 rounded-lg p-1">
                            <button onClick={() => setChartType('line')} className={`px-3 py-1 text-sm rounded-md ${chartType === 'line' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}>Line</button>
                            <button onClick={() => setChartType('candlestick')} className={`px-3 py-1 text-sm rounded-md ${chartType === 'candlestick' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}>Candlestick</button>
                        </div>
                    </div>
                    {chartType === 'line' ? <StockChart data={stock.history} /> : <CandlestickChart data={stock.history} />}
                </div>
                <StockDetails stockData={stock.profile} />
            </div>

            {/* Right Column: News & Trading */}
            <div className="lg:col-span-1 space-y-6">
                 <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                     <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2"><Newspaper size={20}/> Related News</h2>
                     <div className="space-y-4 max-h-96 overflow-y-auto">
                        {stock.news.map((item, index) => (
                            <div key={index} className="border-b border-gray-800 pb-2">
                                <p className="text-gray-300 text-sm">{item.headline}</p>
                                <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                            </div>
                        ))}
                     </div>
                 </div>
                 {/* TODO: Add a reusable trading panel component here */}
            </div>
        </div>
    );
};

export default StockProfilePage;