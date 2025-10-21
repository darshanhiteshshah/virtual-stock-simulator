import { useState, useEffect } from 'react';
import { fetchMarketNews } from '../services/newsService';

const NewsFeed = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNews();
        // Refresh every 30 minutes (news doesn't change as frequently)
        const interval = setInterval(fetchNews, 1800000);
        return () => clearInterval(interval);
    }, []);

    const fetchNews = async () => {
        try {
            const response = await fetchMarketNews(8);
            setNews(response.data?.news || []);
            setError(null);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch news:', error);
            setError(error.response?.data?.message || 'Failed to load news');
            setLoading(false);
        }
    };

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
            <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-800">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-800 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-800">
                <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <p className="text-gray-400 mb-2 text-sm">{error}</p>
                    <button 
                        onClick={fetchNews}
                        className="mt-3 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <h2 className="text-lg font-bold text-white">Market News</h2>
                    </div>
                    <span className="text-xs text-teal-100 bg-white/20 px-2 py-1 rounded">
                        {news.length} articles
                    </span>
                </div>
            </div>

            {/* News List */}
            <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto">
                {news && news.length > 0 ? (
                    news.map((article, index) => (
                        <a
                            key={index}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 hover:bg-gray-800/50 transition-colors group"
                        >
                            <div className="flex space-x-3">
                                {/* Article Image */}
                                {article.imageUrl && (
                                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-800">
                                        <img 
                                            src={article.imageUrl} 
                                            alt={article.headline}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    </div>
                                )}

                                {/* Article Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-100 line-clamp-2 group-hover:text-teal-400 transition-colors mb-1">
                                        {article.headline}
                                    </h3>
                                    {article.description && (
                                        <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                                            {article.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span className="font-medium">{article.source}</span>
                                        <span>{getTimeAgo(article.publishedAt)}</span>
                                    </div>
                                </div>

                                {/* External Link Icon */}
                                <svg className="w-4 h-4 text-gray-600 group-hover:text-teal-500 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="p-8 text-center">
                        <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <p className="text-gray-400 font-medium">No news available</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            {news && news.length > 0 && (
                <div className="bg-gray-800/50 px-4 py-2 border-t border-gray-800">
                    <div className="text-xs text-gray-500 text-center">
                        Updated {getTimeAgo(news[0]?.publishedAt)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsFeed;
