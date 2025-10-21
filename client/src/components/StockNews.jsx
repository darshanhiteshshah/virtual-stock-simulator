import { useState, useEffect } from 'react';
import { fetchStockNews } from '../services/newsService';

const StockNews = ({ symbol }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (symbol) {
            fetchNews();
        }
    }, [symbol]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const response = await fetchStockNews(symbol, 5);
            setNews(response.data?.news || []);
            setError(null);
            setLoading(false);
        } catch (error) {
            console.error(`Failed to fetch news for ${symbol}:`, error);
            setError('No news available');
            setLoading(false);
        }
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const hours = Math.floor((now - date) / 3600000);
        
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error || !news.length) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No recent news for {symbol}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase">Recent News</h3>
            <div className="space-y-3">
                {news.map((article, index) => (
                    <a
                        key={index}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group"
                    >
                        <h4 className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-teal-400 transition-colors mb-1">
                            {article.headline}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{article.source}</span>
                            <span>{getTimeAgo(article.publishedAt)}</span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default StockNews;
