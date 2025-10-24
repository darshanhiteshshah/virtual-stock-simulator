import { useState, useEffect, useCallback } from 'react';
import { fetchMarketNews } from '../services/newsService';
import { Newspaper, RefreshCw, User, Clock, ExternalLink } from 'lucide-react';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [limit, setLimit] = useState(20);

    const fetchNews = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchMarketNews(limit);
            setNews(data.news || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch news:', err);
            setError(err.response?.data?.message || 'Failed to load news');
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="w-full overflow-x-hidden min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
            <div className="w-full max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <Newspaper className="w-8 h-8 text-slate-400 flex-shrink-0" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Market News</h1>
                            <p className="text-slate-400 text-xs md:text-sm">Stay updated with the latest market trends</p>
                        </div>
                    </div>

                    {/* Refresh Button */}
                    <button 
                        onClick={fetchNews}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors border border-slate-700/50 disabled:opacity-50 flex-shrink-0"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-medium">Refresh</span>
                    </button>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                        </span>
                        <span className="text-slate-300">Live Updates</span>
                    </div>
                    <span className="text-slate-400">
                        {news.length} articles loaded
                    </span>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="space-y-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-slate-900/50 rounded-xl p-6 border border-slate-800/50 animate-pulse backdrop-blur-xl">
                                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                                    <div className="w-full md:w-48 h-32 bg-slate-800 rounded-lg flex-shrink-0"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-6 bg-slate-800 rounded w-3/4"></div>
                                        <div className="h-4 bg-slate-800 rounded w-full"></div>
                                        <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                                        <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-slate-900/50 rounded-xl p-12 border border-slate-800/50 text-center backdrop-blur-xl">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <Newspaper className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-300 mb-2">Unable to Load News</h3>
                        <p className="text-slate-500 mb-6">{error}</p>
                        <button 
                            onClick={fetchNews}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* News Grid */}
                {!loading && !error && news.length > 0 && (
                    <div className="space-y-6">
                        {news.map((article, index) => (
                            <a
                                key={`${article.url}-${index}`}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-slate-900/50 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-all overflow-hidden group backdrop-blur-xl"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Article Image */}
                                    {article.imageUrl && (
                                        <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0 bg-slate-800 overflow-hidden">
                                            <img 
                                                src={article.imageUrl} 
                                                alt={article.headline}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    if (e.target.parentElement) {
                                                        e.target.parentElement.style.display = 'none';
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Article Content */}
                                    <div className="flex-1 p-4 md:p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="inline-block px-3 py-1 bg-slate-800/50 text-slate-400 text-xs font-semibold rounded-full border border-slate-700/50">
                                                {article.source}
                                            </span>
                                            <ExternalLink className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                                        </div>

                                        <h2 className="text-lg md:text-xl font-bold text-slate-100 group-hover:text-white transition-colors mb-3 line-clamp-2">
                                            {article.headline}
                                        </h2>

                                        {article.description && (
                                            <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
                                                {article.description}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                                            {article.author && (
                                                <span className="flex items-center space-x-1">
                                                    <User className="w-3 h-3" />
                                                    <span className="truncate max-w-[150px]">{article.author}</span>
                                                </span>
                                            )}
                                            <span className="flex items-center space-x-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{getTimeAgo(article.publishedAt)}</span>
                                            </span>
                                            <span className="text-xs text-slate-600 hidden md:inline">
                                                {formatDate(article.publishedAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                {/* Load More Button */}
                {!loading && !error && news.length > 0 && (
                    <div className="mt-8 text-center">
                        <button 
                            onClick={() => setLimit(limit + 10)}
                            className="w-full md:w-auto px-8 py-3 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors font-medium border border-slate-700/50"
                        >
                            Load More Articles
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && news.length === 0 && (
                    <div className="bg-slate-900/50 rounded-xl p-12 border border-slate-800/50 text-center backdrop-blur-xl">
                        <Newspaper className="w-20 h-20 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-400 mb-2">No News Available</h3>
                        <p className="text-slate-500">Check back later for updates</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;
