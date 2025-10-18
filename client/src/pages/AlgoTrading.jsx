import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    Activity, 
    TrendingUp, 
    Zap,
    AlertCircle,
    Settings,
    Play,
    Pause,
    Trash2
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { 
    getAlgorithms, 
    deleteAlgorithm, 
    activateAlgorithm, 
    stopAlgorithm 
} from '../services/algoService';

const AlgoTrading = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [algorithms, setAlgorithms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (user?.token) {
            loadAlgorithms();
        }
    }, [user]);

    const loadAlgorithms = async () => {
        try {
            setLoading(true);
            const data = await getAlgorithms(user.token);
            setAlgorithms(data.algorithms || []);
        } catch (err) {
            console.error('Load algos error:', err);
            setError('Failed to load algorithms');
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (id) => {
        try {
            setActionLoading(id);
            await activateAlgorithm(id, user.token);
            await loadAlgorithms();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to activate');
        } finally {
            setActionLoading(null);
        }
    };

    const handleStop = async (id) => {
        try {
            setActionLoading(id);
            await stopAlgorithm(id, user.token);
            await loadAlgorithms();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to stop');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        
        try {
            setActionLoading(id);
            await deleteAlgorithm(id, user.token);
            await loadAlgorithms();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-900/30 text-emerald-400 border-emerald-800';
            case 'paused': return 'bg-orange-900/30 text-orange-400 border-orange-800';
            case 'backtesting': return 'bg-blue-900/30 text-blue-400 border-blue-800';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'momentum': return <Activity className="w-4 h-4" />;
            case 'technical': return <TrendingUp className="w-4 h-4" />;
            default: return <Zap className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-slate-400 mt-4">Loading algorithms...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Zap className="w-8 h-8 text-blue-500" />
                            Algorithmic Trading
                        </h1>
                        <p className="text-slate-400 mt-1">Create, backtest, and deploy trading algorithms</p>
                    </div>
                    <button
                        onClick={() => navigate('/algo/create')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create Algorithm
                    </button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                        <div className="text-slate-400 text-sm mb-1">Total Algorithms</div>
                        <div className="text-2xl font-bold">{algorithms.length}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                        <div className="text-slate-400 text-sm mb-1">Active</div>
                        <div className="text-2xl font-bold text-emerald-400">
                            {algorithms.filter(a => a.status === 'active').length}
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                        <div className="text-slate-400 text-sm mb-1">Backtested</div>
                        <div className="text-2xl font-bold text-blue-400">
                            {algorithms.filter(a => a.backtestResults?.totalTrades > 0).length}
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                        <div className="text-slate-400 text-sm mb-1">Avg Win Rate</div>
                        <div className="text-2xl font-bold text-purple-400">
                            {algorithms.length > 0 
                                ? (algorithms.reduce((sum, a) => sum + (a.backtestResults?.winRate || 0), 0) / algorithms.length).toFixed(1)
                                : '0'}%
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-300">{error}</span>
                    </div>
                )}

                {/* Algorithms Grid */}
                {algorithms.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
                        <Zap className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Algorithms Yet</h3>
                        <p className="text-slate-400 mb-6">Create your first trading algorithm to get started</p>
                        <button
                            onClick={() => navigate('/algo/create')}
                            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Algorithm
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {algorithms.map((algo) => (
                            <div
                                key={algo._id}
                                className="bg-slate-900 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-colors"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(algo.type)}
                                        <h3 className="font-bold text-lg">{algo.name}</h3>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(algo.status)}`}>
                                        {algo.status}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                                    {algo.description || 'No description'}
                                </p>

                                {/* Backtest Results */}
                                {algo.backtestResults?.totalTrades > 0 && (
                                    <div className="bg-slate-800/50 rounded p-3 mb-4">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <div className="text-slate-500">Total Trades</div>
                                                <div className="font-semibold">{algo.backtestResults.totalTrades}</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500">Win Rate</div>
                                                <div className="font-semibold text-emerald-400">
                                                    {algo.backtestResults.winRate}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500">Total Return</div>
                                                <div className={`font-semibold ${algo.backtestResults.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {algo.backtestResults.totalReturn}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500">Profit Factor</div>
                                                <div className="font-semibold">{algo.backtestResults.profitFactor}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Symbols */}
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {algo.symbols.slice(0, 3).map((symbol) => (
                                        <span key={symbol} className="text-xs bg-slate-800 px-2 py-1 rounded">
                                            {symbol}
                                        </span>
                                    ))}
                                    {algo.symbols.length > 3 && (
                                        <span className="text-xs text-slate-500">+{algo.symbols.length - 3} more</span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {algo.status === 'active' ? (
                                        <button
                                            onClick={() => handleStop(algo._id)}
                                            disabled={actionLoading === algo._id}
                                            className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 px-3 py-2 rounded text-sm font-semibold"
                                        >
                                            <Pause className="w-4 h-4" />
                                            Stop
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleActivate(algo._id)}
                                            disabled={actionLoading === algo._id || !algo.backtestResults}
                                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded text-sm font-semibold"
                                            title={!algo.backtestResults ? 'Run backtest first' : ''}
                                        >
                                            <Play className="w-4 h-4" />
                                            Activate
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate(`/algo/${algo._id}`)}
                                        className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(algo._id, algo.name)}
                                        disabled={algo.status === 'active' || actionLoading === algo._id}
                                        className="flex items-center justify-center bg-red-900/30 hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlgoTrading;
