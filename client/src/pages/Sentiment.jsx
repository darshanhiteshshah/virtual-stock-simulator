import { useState, useEffect, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { fetchSentimentData } from '../services/sentimentService';
import { 
    Gauge, TrendingUp, TrendingDown, MessageSquare, 
    Activity, RefreshCw, BarChart3, PieChart, Filter 
} from 'lucide-react';

// Helper function to get sentiment details
const getSentimentDetails = (score) => {
    if (score > 0.6) return { 
        label: 'Very Bullish', 
        color: 'emerald', 
        bgClass: 'bg-emerald-500/20', 
        textClass: 'text-emerald-400', 
        borderClass: 'border-emerald-500/30',
        emoji: '🚀'
    };
    if (score > 0.2) return { 
        label: 'Bullish', 
        color: 'emerald', 
        bgClass: 'bg-emerald-500/10', 
        textClass: 'text-emerald-400', 
        borderClass: 'border-emerald-500/20',
        emoji: '📈'
    };
    if (score < -0.6) return { 
        label: 'Very Bearish', 
        color: 'red', 
        bgClass: 'bg-red-500/20', 
        textClass: 'text-red-400', 
        borderClass: 'border-red-500/30',
        emoji: '📉'
    };
    if (score < -0.2) return { 
        label: 'Bearish', 
        color: 'red', 
        bgClass: 'bg-red-500/10', 
        textClass: 'text-red-400', 
        borderClass: 'border-red-500/20',
        emoji: '👎'
    };
    return { 
        label: 'Neutral', 
        color: 'slate', 
        bgClass: 'bg-slate-500/10', 
        textClass: 'text-slate-400', 
        borderClass: 'border-slate-500/20',
        emoji: '➡️'
    };
};

// Circular gauge component
const CircularGauge = ({ score, size = 120 }) => {
    const details = getSentimentDetails(score);
    const normalizedScore = ((score + 1) / 2) * 100; // Convert -1 to 1 range to 0 to 100
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-800"
                />
                {/* Progress circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={details.textClass}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl">{details.emoji}</span>
                <span className={`text-xs font-bold mt-1 ${details.textClass}`}>
                    {score.toFixed(2)}
                </span>
            </div>
        </div>
    );
};

const Sentiment = () => {
    const { user } = useAuth();
    const [sentimentData, setSentimentData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterSector, setFilterSector] = useState('all');
    const [viewMode, setViewMode] = useState('heatmap'); // 'heatmap' or 'chart'

    const loadSentiment = async () => {
        if (user?.token) {
            setIsLoading(true);
            try {
                const res = await fetchSentimentData(user.token);
                setSentimentData(res.data);
            } catch (error) {
                console.error("Failed to fetch sentiment data", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        loadSentiment();
        // Auto-refresh every 5 minutes
        const interval = setInterval(loadSentiment, 300000);
        return () => clearInterval(interval);
    }, [user]);

    // Calculate statistics
    const stats = useMemo(() => {
        if (sentimentData.length === 0) return { overall: 0, bullish: 0, bearish: 0, neutral: 0 };

        const overall = sentimentData.reduce((sum, d) => 
            sum + (d.retailSentiment + d.fiiSentiment + d.diiSentiment) / 3, 0
        ) / sentimentData.length;

        const bullish = sentimentData.filter(d => 
            (d.retailSentiment + d.fiiSentiment + d.diiSentiment) / 3 > 0.2
        ).length;

        const bearish = sentimentData.filter(d => 
            (d.retailSentiment + d.fiiSentiment + d.diiSentiment) / 3 < -0.2
        ).length;

        const neutral = sentimentData.length - bullish - bearish;

        return { overall, bullish, bearish, neutral };
    }, [sentimentData]);

    const overallDetails = getSentimentDetails(stats.overall);

    // Filter data by sector
    const filteredData = filterSector === 'all' 
        ? sentimentData 
        : sentimentData.filter(d => d.sector === filterSector);

    const sectors = useMemo(() => 
        ['all', ...new Set(sentimentData.map(d => d.sector))],
        [sentimentData]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Market Sentiment</h1>
                        <p className="text-slate-400 text-sm">Real-time sentiment analysis across sectors</p>
                    </div>
                    <button
                        onClick={loadSentiment}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Overall Sentiment */}
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-400">Overall Market</h3>
                            <Activity size={18} className="text-blue-400" />
                        </div>
                        {isLoading ? (
                            <div className="animate-pulse">
                                <div className="h-8 bg-slate-800 rounded w-2/3 mb-2"></div>
                                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{overallDetails.emoji}</span>
                                    <p className={`text-2xl font-bold ${overallDetails.textClass}`}>
                                        {overallDetails.label}
                                    </p>
                                </div>
                                <p className="text-xs text-slate-500">Score: {stats.overall.toFixed(2)}</p>
                            </>
                        )}
                    </div>

                    {/* Bullish Sectors */}
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-400">Bullish Sectors</h3>
                            <TrendingUp size={18} className="text-emerald-400" />
                        </div>
                        {isLoading ? (
                            <div className="animate-pulse">
                                <div className="h-8 bg-slate-800 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                            </div>
                        ) : (
                            <>
                                <p className="text-3xl font-bold text-emerald-400">{stats.bullish}</p>
                                <p className="text-xs text-slate-500">
                                    {sentimentData.length > 0 ? ((stats.bullish / sentimentData.length) * 100).toFixed(0) : 0}% of total
                                </p>
                            </>
                        )}
                    </div>

                    {/* Bearish Sectors */}
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-400">Bearish Sectors</h3>
                            <TrendingDown size={18} className="text-red-400" />
                        </div>
                        {isLoading ? (
                            <div className="animate-pulse">
                                <div className="h-8 bg-slate-800 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                            </div>
                        ) : (
                            <>
                                <p className="text-3xl font-bold text-red-400">{stats.bearish}</p>
                                <p className="text-xs text-slate-500">
                                    {sentimentData.length > 0 ? ((stats.bearish / sentimentData.length) * 100).toFixed(0) : 0}% of total
                                </p>
                            </>
                        )}
                    </div>

                    {/* Neutral Sectors */}
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-400">Neutral Sectors</h3>
                            <Gauge size={18} className="text-slate-400" />
                        </div>
                        {isLoading ? (
                            <div className="animate-pulse">
                                <div className="h-8 bg-slate-800 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                            </div>
                        ) : (
                            <>
                                <p className="text-3xl font-bold text-slate-400">{stats.neutral}</p>
                                <p className="text-xs text-slate-500">
                                    {sentimentData.length > 0 ? ((stats.neutral / sentimentData.length) * 100).toFixed(0) : 0}% of total
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Filters and View Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        <select
                            value={filterSector}
                            onChange={(e) => setFilterSector(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        >
                            {sectors.map(s => (
                                <option key={s} value={s}>
                                    {s === 'all' ? 'All Sectors' : s}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('heatmap')}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                viewMode === 'heatmap' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            <BarChart3 size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('chart')}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                viewMode === 'chart' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            <PieChart size={18} />
                        </button>
                    </div>
                </div>

                {/* Heatmap View */}
                {viewMode === 'heatmap' && (
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Gauge size={20} className="text-blue-400" />
                            <h2 className="text-lg font-semibold text-white">Sentiment Heatmap</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-slate-800/50">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Sector</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Retail</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">FII</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">DII</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Average</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan="5" className="px-4 py-3">
                                                    <div className="h-12 bg-slate-800/50 rounded-lg animate-pulse"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredData.length > 0 ? (
                                        filteredData.map((data) => {
                                            const retailDetails = getSentimentDetails(data.retailSentiment);
                                            const fiiDetails = getSentimentDetails(data.fiiSentiment);
                                            const diiDetails = getSentimentDetails(data.diiSentiment);
                                            const avgSentiment = (data.retailSentiment + data.fiiSentiment + data.diiSentiment) / 3;
                                            const avgDetails = getSentimentDetails(avgSentiment);

                                            return (
                                                <tr 
                                                    key={data.sector}
                                                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                                                >
                                                    <td className="px-4 py-4">
                                                        <span className="font-semibold text-blue-400">{data.sector}</span>
                                                    </td>
                                                    
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col items-center">
                                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${retailDetails.bgClass} ${retailDetails.textClass} ${retailDetails.borderClass}`}>
                                                                {retailDetails.label}
                                                            </span>
                                                            <span className="text-xs text-slate-500 mt-1">
                                                                {data.retailSentiment.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col items-center">
                                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${fiiDetails.bgClass} ${fiiDetails.textClass} ${fiiDetails.borderClass}`}>
                                                                {fiiDetails.label}
                                                            </span>
                                                            <span className="text-xs text-slate-500 mt-1">
                                                                {data.fiiSentiment.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col items-center">
                                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${diiDetails.bgClass} ${diiDetails.textClass} ${diiDetails.borderClass}`}>
                                                                {diiDetails.label}
                                                            </span>
                                                            <span className="text-xs text-slate-500 mt-1">
                                                                {data.diiSentiment.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col items-center">
                                                            <span className={`px-4 py-2 rounded-lg text-sm font-bold border ${avgDetails.bgClass} ${avgDetails.textClass} ${avgDetails.borderClass}`}>
                                                                {avgDetails.emoji} {avgDetails.label}
                                                            </span>
                                                            <span className="text-xs text-slate-500 mt-1">
                                                                {avgSentiment.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Gauge className="w-12 h-12 text-slate-600" />
                                                    <p className="text-slate-400">No data available</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Legend */}
                        {!isLoading && filteredData.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-slate-800/50">
                                <p className="text-xs text-slate-500 mb-3">Legend:</p>
                                <div className="flex flex-wrap gap-4 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/30 rounded"></div>
                                        <span className="text-slate-400">Bullish (Score &gt; 0.2)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-slate-500/10 border border-slate-500/20 rounded"></div>
                                        <span className="text-slate-400">Neutral (-0.2 to 0.2)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500/20 border border-red-500/30 rounded"></div>
                                        <span className="text-slate-400">Bearish (Score &lt; -0.2)</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Chart View */}
                {viewMode === 'chart' && !isLoading && (
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChart size={20} className="text-blue-400" />
                            <h2 className="text-lg font-semibold text-white">Sentiment Gauges</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredData.map((data) => {
                                const avgSentiment = (data.retailSentiment + data.fiiSentiment + data.diiSentiment) / 3;
                                const details = getSentimentDetails(avgSentiment);

                                return (
                                    <div 
                                        key={data.sector}
                                        className={`p-6 rounded-xl border ${details.borderClass} ${details.bgClass}`}
                                    >
                                        <h3 className="text-sm font-semibold text-white mb-4">{data.sector}</h3>
                                        <div className="flex flex-col items-center">
                                            <CircularGauge score={avgSentiment} />
                                            <p className={`mt-4 text-lg font-bold ${details.textClass}`}>
                                                {details.label}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Market Insights */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <MessageSquare size={20} className="text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">Market Insights</h2>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="h-20 bg-slate-800/50 rounded-lg animate-pulse"></div>
                            ))
                        ) : filteredData.length > 0 ? (
                            filteredData.map((data) => {
                                const avgSentiment = (data.retailSentiment + data.fiiSentiment + data.diiSentiment) / 3;
                                const details = getSentimentDetails(avgSentiment);

                                return (
                                    <div 
                                        key={data.sector} 
                                        className={`p-4 rounded-lg border transition-all hover:shadow-lg ${details.bgClass} ${details.borderClass}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg border ${details.borderClass}`}>
                                                <span className="text-xl">{details.emoji}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-semibold text-blue-400">{data.sector}</h3>
                                                    <span className={`text-xs font-bold ${details.textClass}`}>
                                                        {details.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-300 leading-relaxed">{data.buzz}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                No insights available at the moment
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sentiment;
