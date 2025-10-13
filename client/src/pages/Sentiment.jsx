import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { fetchSentimentData } from '../services/sentimentService';
import { Gauge, TrendingUp, TrendingDown, MessageSquare, Activity } from 'lucide-react';

// Helper function to get sentiment details
const getSentimentDetails = (score) => {
    if (score > 0.6) return { label: 'Very Bullish', color: 'emerald', bgClass: 'bg-emerald-500/20', textClass: 'text-emerald-400', borderClass: 'border-emerald-500/30' };
    if (score > 0.2) return { label: 'Bullish', color: 'emerald', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400', borderClass: 'border-emerald-500/20' };
    if (score < -0.6) return { label: 'Very Bearish', color: 'red', bgClass: 'bg-red-500/20', textClass: 'text-red-400', borderClass: 'border-red-500/30' };
    if (score < -0.2) return { label: 'Bearish', color: 'red', bgClass: 'bg-red-500/10', textClass: 'text-red-400', borderClass: 'border-red-500/20' };
    return { label: 'Neutral', color: 'slate', bgClass: 'bg-slate-500/10', textClass: 'text-slate-400', borderClass: 'border-slate-500/20' };
};

const Sentiment = () => {
    const { user } = useAuth();
    const [sentimentData, setSentimentData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSentiment = async () => {
            if (user?.token) {
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
        loadSentiment();
    }, [user]);

    // Calculate overall market sentiment
    const overallSentiment = sentimentData.length > 0 
        ? sentimentData.reduce((sum, d) => sum + (d.retailSentiment + d.fiiSentiment + d.diiSentiment) / 3, 0) / sentimentData.length
        : 0;
    const overallDetails = getSentimentDetails(overallSentiment);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Market Sentiment</h1>
                    <p className="text-slate-400 text-sm">Real-time sentiment analysis across sectors</p>
                </div>

                {/* Overall Market Sentiment */}
                {!isLoading && sentimentData.length > 0 && (
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">Overall Market Sentiment</h2>
                                <p className="text-sm text-slate-400">Aggregate across all sectors</p>
                            </div>
                            <div className={`flex items-center gap-3 px-6 py-3 rounded-lg border ${overallDetails.bgClass} ${overallDetails.borderClass}`}>
                                {overallSentiment > 0.2 ? (
                                    <TrendingUp className={`w-6 h-6 ${overallDetails.textClass}`} />
                                ) : overallSentiment < -0.2 ? (
                                    <TrendingDown className={`w-6 h-6 ${overallDetails.textClass}`} />
                                ) : (
                                    <Activity className={`w-6 h-6 ${overallDetails.textClass}`} />
                                )}
                                <div>
                                    <p className={`text-xl font-bold ${overallDetails.textClass}`}>
                                        {overallDetails.label}
                                    </p>
                                    <p className="text-xs text-slate-500">Score: {overallSentiment.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sentiment Heatmap */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Gauge size={20} className="text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">Sentiment Heatmap</h2>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sector</div>
                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider text-center">Retail</div>
                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider text-center">FII</div>
                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider text-center">DII</div>
                    </div>

                    {/* Table Body */}
                    <div className="space-y-3">
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="h-14 bg-slate-800/50 rounded-lg animate-pulse"></div>
                            ))
                        ) : sentimentData.length > 0 ? (
                            sentimentData.map((data) => {
                                const retailDetails = getSentimentDetails(data.retailSentiment);
                                const fiiDetails = getSentimentDetails(data.fiiSentiment);
                                const diiDetails = getSentimentDetails(data.diiSentiment);

                                return (
                                    <div 
                                        key={data.sector}
                                        className="grid grid-cols-4 gap-3 items-center bg-slate-800/30 p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="font-semibold text-blue-400">{data.sector}</div>
                                        
                                        <div className={`px-3 py-2 rounded-lg text-center text-sm font-medium border ${retailDetails.bgClass} ${retailDetails.textClass} ${retailDetails.borderClass}`}>
                                            {retailDetails.label}
                                        </div>
                                        
                                        <div className={`px-3 py-2 rounded-lg text-center text-sm font-medium border ${fiiDetails.bgClass} ${fiiDetails.textClass} ${fiiDetails.borderClass}`}>
                                            {fiiDetails.label}
                                        </div>
                                        
                                        <div className={`px-3 py-2 rounded-lg text-center text-sm font-medium border ${diiDetails.bgClass} ${diiDetails.textClass} ${diiDetails.borderClass}`}>
                                            {diiDetails.label}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                    <Gauge className="w-8 h-8 text-slate-600" />
                                </div>
                                <p className="text-slate-400 text-lg font-medium">No sentiment data available</p>
                                <p className="text-slate-500 text-sm">Check back later for updates</p>
                            </div>
                        )}
                    </div>

                    {/* Legend */}
                    {!isLoading && sentimentData.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-800/50">
                            <p className="text-xs text-slate-500 mb-3">Legend:</p>
                            <div className="flex flex-wrap gap-4 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/30 rounded"></div>
                                    <span className="text-slate-400">Bullish</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-slate-500/10 border border-slate-500/20 rounded"></div>
                                    <span className="text-slate-400">Neutral</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500/20 border border-red-500/30 rounded"></div>
                                    <span className="text-slate-400">Bearish</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Buzz Section */}
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
                        ) : sentimentData.length > 0 ? (
                            sentimentData.map((data) => (
                                <div 
                                    key={data.sector} 
                                    className="bg-slate-800/30 p-4 rounded-lg border border-slate-800/50 hover:border-slate-700/50 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                            <MessageSquare className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-blue-400 mb-2">{data.sector}</h3>
                                            <p className="text-sm text-slate-300 leading-relaxed">{data.buzz}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
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
