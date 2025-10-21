import { useState, useEffect } from 'react';
import { fetchMarketNews } from '../services/newsService';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [limit, setLimit] = useState(20);

    useEffect(() => {
        fetchNews();
    }, [limit]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const data = await fetchMarketNews(limit);
            setNews(data.news || []);
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
        <div className="min-h-screen bg-gray-950">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 border-b border-gray-800">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <div>
                            <h1 className="text-4xl font-bold text-white">Market News</h1>
                            <p className="text-teal-100 text-sm">Stay updated with the latest market trends and analysis</p>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2 text-white bg-white/10 px-3 py-1 rounded-lg">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                            </span>
                            <span>Live Updates</span>
                        </div>
                        <span className="text-teal-100">
                            {news.length} articles loaded
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Filter Tabs */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === 'all' 
                                    ? 'bg-teal-600 text-white' 
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            All News
                        </button>
                        <button 
                            onClick={() => setFilter('stocks')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === 'stocks' 
                                    ? 'bg-teal-600 text-white' 
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            📈 Stocks
                        </button>
                        <button 
                            onClick={() => setFilter('market')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === 'market' 
                                    ? 'bg-teal-600 text-white' 
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            💹 Market
                        </button>
                    </div>

                    {/* Refresh Button */}
                    <button 
                        onClick={fetchNews}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="text-sm">Refresh</span>
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="space-y-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-gray-900 rounded-xl p-6 border border-gray-800 animate-pulse">
                                <div className="flex space-x-4">
                                    <div className="w-48 h-32 bg-gray-800 rounded-lg flex-shrink-0"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-6 bg-gray-800 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-800 rounded w-full"></div>
                                        <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                                        <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
                        <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-300 mb-2">Unable to Load News</h3>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <button 
                            onClick={fetchNews}
                            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
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
                                key={index}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-gray-900 rounded-xl border border-gray-800 hover:border-teal-600/50 transition-all overflow-hidden group"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Article Image */}
                                    {article.imageUrl && (
                                        <div className="md:w-64 h-48 md:h-auto flex-shrink-0 bg-gray-800 overflow-hidden">
                                            <img 
                                                src={article.imageUrl} 
                                                alt={article.headline}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Article Content */}
                                    <div className="flex-1 p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <span className="inline-block px-3 py-1 bg-teal-600/10 text-teal-400 text-xs font-semibold rounded-full mb-2">
                                                    {article.source}
                                                </span>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-600 group-hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>

                                        <h2 className="text-xl font-bold text-gray-100 group-hover:text-teal-400 transition-colors mb-3 line-clamp-2">
                                            {article.headline}
                                        </h2>

                                        {article.description && (
                                            <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                                                {article.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center space-x-4">
                                                {article.author && (
                                                    <span className="flex items-center space-x-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <span>{article.author}</span>
                                                    </span>
                                                )}
                                                <span className="flex items-center space-x-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{getTimeAgo(article.publishedAt)}</span>
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-600">
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
                            className="px-8 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                        >
                            Load More Articles
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && news.length === 0 && (
                    <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
                        <svg className="w-20 h-20 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-400 mb-2">No News Available</h3>
                        <p className="text-gray-500">Check back later for updates</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;
