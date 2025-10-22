import { useState, useEffect } from 'react';
import { fetchStockNews } from '../services/newsService';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';

const StockNews = ({ symbol }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (symbol) {
            loadNews();
        }
    }, [symbol]);

    const loadNews = async () => {
        try {
            setLoading(true);
            const data = await fetchStockNews(symbol, 5);
            setNews(data.news || []);
            setError(null);
        } catch (error) {
            console.error(`Failed to fetch news for ${symbol}:`, error);
            setError('No news available');
        } finally {
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
                <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                    <Newspaper className="w-4 h-4" />
                    Recent News
                </h3>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse p-3 bg-slate-800/30 rounded-lg">
                        <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error || !news.length) {
        return (
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2 mb-4">
                    <Newspaper className="w-4 h-4" />
                    Recent News
                </h3>
                <div className="text-center py-6 bg-slate-800/30 rounded-lg">
                    <Newspaper className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No recent news for {symbol}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                Recent News
            </h3>
            <div className="space-y-3">
                {news.map((article, index) => (
                    <a
                        key={index}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group border border-slate-700/50"
                    >
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-sm font-medium text-slate-200 line-clamp-2 group-hover:text-blue-400 transition-colors flex-1">
                                {article.headline}
                            </h4>
                            <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-0.5" />
                        </div>
                        
                        {article.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                                {article.description}
                            </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-medium">{article.source}</span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {getTimeAgo(article.publishedAt)}
                            </span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default StockNews;
