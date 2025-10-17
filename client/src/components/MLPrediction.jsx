import { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown } from 'lucide-react';

const MLPrediction = ({ symbol, token }) => {
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            const data = await response.json();
            
            if (data.success) {
                setPrediction(data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to load');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded p-4">
                <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="text-sm text-slate-400">Loading AI...</span>
                </div>
            </div>
        );
    }

    if (error || !prediction) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded p-4">
                <div className="text-xs text-slate-500 text-center">{error || 'Unavailable'}</div>
            </div>
        );
    }

    const { summary, model_performance, technical_analysis } = prediction;
    const isPositive = summary.total_change >= 0;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-semibold">AI Forecast</h3>
                </div>
                <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded">ML</span>
            </div>

            <div className="bg-slate-800 rounded p-3 mb-3">
                <div className="text-xs text-slate-400 mb-1">7-Day Forecast</div>
                <div className="flex justify-between">
                    <div>
                        <div className="text-2xl font-bold">₹{summary.predicted_price}</div>
                        <div className={`text-sm flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {summary.total_change > 0 ? '+' : ''}{summary.total_change} ({summary.total_change_percent}%)
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-400">Confidence</div>
                        <div className="text-xl font-bold text-purple-400">{summary.confidence}%</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                <div className="bg-slate-800 rounded p-2 text-center">
                    <div className="text-slate-400">RSI</div>
                    <div className="font-semibold">{technical_analysis.current_rsi}</div>
                </div>
                <div className="bg-slate-800 rounded p-2 text-center">
                    <div className="text-slate-400">MACD</div>
                    <div className="font-semibold">{technical_analysis.current_macd.toFixed(2)}</div>
                </div>
                <div className="bg-slate-800 rounded p-2 text-center">
                    <div className="text-slate-400">Vol</div>
                    <div className="font-semibold">{technical_analysis.volatility.toFixed(1)}%</div>
                </div>
            </div>

            <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                    <span className="text-slate-400">Trend:</span>
                    <span className={summary.trend === 'UPWARD' ? 'text-emerald-400' : 'text-red-400'}>
                        {summary.trend}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Model:</span>
                    <span>{model_performance.method}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Accuracy:</span>
                    <span>{(model_performance.test_score * 100).toFixed(1)}%</span>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500">
                ⚠️ {prediction.disclaimer}
            </div>
        </div>
    );
};

export default MLPrediction;
