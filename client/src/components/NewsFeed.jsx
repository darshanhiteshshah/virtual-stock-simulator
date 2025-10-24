import { useState, useEffect, useCallback } from 'react';
import { fetchMarketNews } from '../services/news';
import { Newspaper, ExternalLink, Clock, RefreshCw } from 'lucide-react';

const NewsFeed = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadNews = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchMarketNews(5); // Get only 5 articles for widget
            setNews(data.news || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch news:', err);
            setError('Unable to load news');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNews();
        // Auto-refresh every 30 minutes
        const interval = setInterval(loadNews, 1800000);
        return () => clearInterval(interval);
    }, [loadNews]);

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    if (loading) {
        return (
            <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        <Newspaper className="w-4 h-4" />
                        Market News
                    </h3>
                </div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        <Newspaper className="w-4 h-4" />
                        Market News
                    </h3>
                </div>
                <div className="text-center py-6">
                    <Newspaper className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">{error}</p>
                    <button 
                        onClick={loadNews}
                        className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!news || news.length === 0) {
        return (
            <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        <Newspaper className="w-4 h-4" />
                        Market News
                    </h3>
                </div>
                <div className="text-center py-6">
                    <Newspaper className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No news available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 overflow-hidden backdrop-blur-xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-800/50">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        <Newspaper className="w-4 h-4" />
                        Market News
                    </h3>
                    <button
                        onClick={loadNews}
                        className="p-1 hover:bg-slate-800/50 rounded transition-colors"
                        title="Refresh news"
                        aria-label="Refresh news"
                    >
                        <RefreshCw className="w-4 h-4 text-slate-400 hover:text-white" />
                    </button>
                </div>
            </div>

            {/* News List */}
            <div className="divide-y divide-slate-800/50 max-h-96 overflow-y-auto scrollbar-hide">
                {news.map((article, index) => (
                    <a
                        key={`${article.url}-${index}`}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 hover:bg-slate-800/30 transition-colors group"
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

            {/* Footer - View All Link */}
            <div className="p-3 border-t border-slate-800/50 bg-slate-800/30">
                <a 
                    href="/news"
                    className="block text-center text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                    View All News →
                </a>
            </div>
        </div>
    );
};

export default NewsFeed;
