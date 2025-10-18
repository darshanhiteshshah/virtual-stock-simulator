import { useState, useEffect } from 'react';
import { 
    Brain, 
    TrendingUp, 
    TrendingDown, 
    Activity,
    BarChart3,
    AlertCircle,
    RefreshCw,
    Sparkles,
    Target
} from 'lucide-react';

const MLPrediction = ({ symbol, token, currentPrice }) => {
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        if (symbol && token) {
            fetchPrediction();
        }
    }, [symbol]);

    const fetchPrediction = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/stocks/${symbol}/prediction?days=7`,
                { 
                    headers: { 'Authorization': `Bearer ${token}` },
                    timeout: 30000 
                }
            );
            
            const data = await response.json();
            
            if (data.success) {
                setPrediction(data);
                setError(null);
            } else {
                setError(data.message || 'Prediction failed');
            }
        } catch (err) {
            console.error('ML Prediction error:', err);
            setError('Service temporarily unavailable');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchPrediction();
    };

    // Loading State
    if (loading) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                        <span className="text-sm font-semibold text-slate-300">AI Forecast</span>
                    </div>
                    <div className="animate-spin">
                        <RefreshCw className="w-4 h-4 text-purple-400" />
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-20 bg-slate-800 rounded animate-pulse"></div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="h-12 bg-slate-800 rounded animate-pulse"></div>
                        <div className="h-12 bg-slate-800 rounded animate-pulse"></div>
                        <div className="h-12 bg-slate-800 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-semibold text-slate-300">AI Forecast</span>
                    </div>
                    <button 
                        onClick={handleRefresh}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-center py-8">
                    <div className="text-4xl mb-2">🤖</div>
                    <div className="text-sm text-slate-400 mb-1">{error}</div>
                    <button 
                        onClick={handleRefresh}
                        className="text-xs text-purple-400 hover:text-purple-300 mt-2"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // No Prediction
    if (!prediction) {
        return null;
    }

    const { summary, model_performance, technical_analysis, predictions } = prediction;
    const isPositive = summary.total_change >= 0;
    
    // Check price difference
    const mlPrice = prediction.current_price;
    const priceDiff = currentPrice ? Math.abs(currentPrice - mlPrice) : 0;
    const showPriceWarning = priceDiff > 1;

    // Confidence color coding
    const getConfidenceColor = (conf) => {
        if (conf >= 80) return 'text-emerald-400';
        if (conf >= 60) return 'text-blue-400';
        if (conf >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    const getConfidenceBg = (conf) => {
        if (conf >= 80) return 'bg-emerald-900/30';
        if (conf >= 60) return 'bg-blue-900/30';
        if (conf >= 40) return 'bg-orange-900/30';
        return 'bg-red-900/30';
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <Sparkles className="w-2 h-2 text-purple-300 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200">AI Forecast</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full">
                        ML
                    </span>
                    <button 
                        onClick={handleRefresh}
                        className="text-slate-400 hover:text-purple-400 transition-colors"
                        title="Refresh prediction"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Price Warning */}
            {showPriceWarning && (
                <div className="mb-3 p-2 bg-orange-900/20 border border-orange-800/30 rounded text-xs text-orange-300 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    <span>Using ₹{mlPrice} (Live: ₹{currentPrice})</span>
                </div>
            )}

            {/* Main Prediction */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-lg p-4 mb-3 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        7-Day Target
                    </div>
                    <div className={`text-xs font-medium px-2 py-0.5 rounded ${getConfidenceBg(summary.confidence)} ${getConfidenceColor(summary.confidence)}`}>
                        {summary.confidence}% confidence
                    </div>
                </div>
                
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-3xl font-bold text-white mb-1">
                            ₹{summary.predicted_price.toLocaleString()}
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span>
                                {summary.total_change > 0 ? '+' : ''}
                                ₹{Math.abs(summary.total_change).toFixed(2)} 
                                ({summary.total_change_percent}%)
                            </span>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className="text-xs text-slate-400 mb-1">Trend</div>
                        <div className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {summary.trend}
                        </div>
                    </div>
                </div>
            </div>

            {/* Technical Indicators */}
            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-slate-800/50 rounded-lg p-2.5 text-center border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                    <div className="text-xs text-slate-400 mb-1">RSI</div>
                    <div className="text-sm font-bold text-white">{technical_analysis.current_rsi}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                        {technical_analysis.current_rsi > 70 ? 'Overbought' : 
                         technical_analysis.current_rsi < 30 ? 'Oversold' : 'Neutral'}
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2.5 text-center border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                    <div className="text-xs text-slate-400 mb-1">MACD</div>
                    <div className="text-sm font-bold text-white">{technical_analysis.current_macd.toFixed(2)}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                        {technical_analysis.current_macd > 0 ? 'Bullish' : 'Bearish'}
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2.5 text-center border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                    <div className="text-xs text-slate-400 mb-1">Volatility</div>
                    <div className="text-sm font-bold text-white">{technical_analysis.volatility.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                        {technical_analysis.volatility > 2 ? 'High' : 
                         technical_analysis.volatility > 1 ? 'Medium' : 'Low'}
                    </div>
                </div>
            </div>

            {/* Model Performance */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-xs text-slate-400 hover:text-purple-400 transition-colors flex items-center justify-between py-2 border-t border-slate-800"
            >
                <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    Model Details
                </span>
                <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showDetails && (
                <div className="mt-2 space-y-2 text-xs animate-in slide-in-from-top">
                    <div className="bg-slate-800/30 rounded p-2 space-y-1">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Model:</span>
                            <span className="text-slate-200 font-medium">{model_performance.method}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Accuracy:</span>
                            <span className="text-slate-200">{(model_performance.test_score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Features:</span>
                            <span className="text-slate-200">{model_performance.features_used}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Error Rate:</span>
                            <span className="text-slate-200">{model_performance.mape}% MAPE</span>
                        </div>
                    </div>

                    {/* Daily Predictions */}
                    <div className="bg-slate-800/30 rounded p-2">
                        <div className="text-slate-400 mb-2 font-medium">Daily Forecast</div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {predictions.slice(0, 7).map((pred, i) => (
                                <div key={i} className="flex justify-between items-center text-xs py-1">
                                    <span className="text-slate-400">Day {pred.day}</span>
                                    <span className="text-slate-300">₹{pred.predicted_price}</span>
                                    <span className={pred.change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                        {pred.change >= 0 ? '+' : ''}{pred.change_percent}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Disclaimer */}
            <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500 flex items-start gap-2">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{prediction.disclaimer}</span>
            </div>
        </div>
    );
};

export default MLPrediction;
