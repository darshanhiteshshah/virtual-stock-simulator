import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ArrowLeft, 
    Save, 
    Play,
    Lightbulb,
    AlertCircle,
    TrendingUp,
    Activity,
    Target,
    BarChart3
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { 
    createAlgorithm, 
    updateAlgorithm, 
    getAlgorithm,
    backtestAlgorithm,
    getTemplates 
} from '../services/algoService';
import BacktestResults from '../components/BacktestResults';

const AlgoBuilder = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [backtesting, setBacktesting] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [backtestResults, setBacktestResults] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'technical',
        symbols: ['RELIANCE'],
        strategy: {
            entry: {
                indicator: 'RSI',
                condition: 'less_than',
                value: 30,
                timeframe: '1d'
            },
            exit: {
                indicator: 'RSI',
                condition: 'greater_than',
                value: 70,
                stopLoss: 5,
                takeProfit: 10
            },
            sizing: {
                type: 'percent_of_capital',
                amount: 10
            }
        }
    });

    useEffect(() => {
        if (id && user?.token) {
            loadAlgorithm();
        }
        loadTemplates();
    }, [id, user]);

    const loadAlgorithm = async () => {
        try {
            const data = await getAlgorithm(id, user.token);
            setFormData(data.algorithm);
            if (data.algorithm.backtestResults) {
                setBacktestResults(data.algorithm.backtestResults);
            }
        } catch (err) {
            alert('Failed to load algorithm');
            navigate('/algo');
        }
    };

    const loadTemplates = async () => {
        try {
            const data = await getTemplates(user.token);
            setTemplates(data.templates);
        } catch (err) {
            console.error('Load templates error:', err);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleStrategyChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            strategy: {
                ...prev.strategy,
                [section]: {
                    ...prev.strategy[section],
                    [field]: value
                }
            }
        }));
    };

    const handleSymbolChange = (value) => {
        const symbols = value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        setFormData(prev => ({ ...prev, symbols }));
    };

    const applyTemplate = (template) => {
        setFormData(prev => ({
            ...prev,
            name: template.name,
            description: template.description,
            type: template.type,
            strategy: template.strategy
        }));
        setShowTemplates(false);
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert('Please enter algorithm name');
            return;
        }

        try {
            setLoading(true);
            if (id) {
                await updateAlgorithm(id, formData, user.token);
            } else {
                await createAlgorithm(formData, user.token);
            }
            navigate('/algo');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save algorithm');
        } finally {
            setLoading(false);
        }
    };

    const handleBacktest = async () => {
        if (!id) {
            alert('Please save algorithm first');
            return;
        }

        try {
            setBacktesting(true);
            const data = await backtestAlgorithm(id, user.token);
            setBacktestResults(data.results);
            alert('Backtest completed successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Backtest failed');
        } finally {
            setBacktesting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/algo')}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {id ? 'Edit Algorithm' : 'Create Algorithm'}
                            </h1>
                            <p className="text-slate-400 text-sm">Define your trading strategy</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowTemplates(true)}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
                        >
                            <Lightbulb className="w-4 h-4" />
                            Templates
                        </button>
                        {id && (
                            <button
                                onClick={handleBacktest}
                                disabled={backtesting}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
                            >
                                <Play className="w-4 h-4" />
                                {backtesting ? 'Running...' : 'Backtest'}
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-400" />
                                Basic Information
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Algorithm Name*</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="e.g., RSI Oversold Strategy"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        placeholder="Describe your trading strategy..."
                                        rows={3}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Strategy Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => handleChange('type', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="technical">Technical Analysis</option>
                                        <option value="momentum">Momentum Trading</option>
                                        <option value="mean_reversion">Mean Reversion</option>
                                        <option value="custom">Custom Strategy</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Symbols (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={formData.symbols.join(', ')}
                                        onChange={(e) => handleSymbolChange(e.target.value)}
                                        placeholder="RELIANCE, TCS, INFY"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Enter stock symbols separated by commas</p>
                                </div>
                            </div>
                        </div>

                        {/* Entry Conditions */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                Entry Conditions
                            </h2>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Indicator</label>
                                    <select
                                        value={formData.strategy.entry.indicator}
                                        onChange={(e) => handleStrategyChange('entry', 'indicator', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="RSI">RSI (Relative Strength Index)</option>
                                        <option value="MACD">MACD</option>
                                        <option value="SMA_CROSS">SMA Crossover</option>
                                        <option value="BOLLINGER">Bollinger Bands</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Condition</label>
                                    <select
                                        value={formData.strategy.entry.condition}
                                        onChange={(e) => handleStrategyChange('entry', 'condition', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="less_than">Less Than</option>
                                        <option value="greater_than">Greater Than</option>
                                        <option value="crosses_above">Crosses Above</option>
                                        <option value="crosses_below">Crosses Below</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Value</label>
                                    <input
                                        type="number"
                                        value={formData.strategy.entry.value}
                                        onChange={(e) => handleStrategyChange('entry', 'value', parseFloat(e.target.value))}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Timeframe</label>
                                    <select
                                        value={formData.strategy.entry.timeframe}
                                        onChange={(e) => handleStrategyChange('entry', 'timeframe', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="1m">1 Minute</option>
                                        <option value="5m">5 Minutes</option>
                                        <option value="15m">15 Minutes</option>
                                        <option value="1h">1 Hour</option>
                                        <option value="1d">1 Day</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Exit Conditions */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-red-400" />
                                Exit Conditions
                            </h2>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Indicator</label>
                                    <select
                                        value={formData.strategy.exit.indicator}
                                        onChange={(e) => handleStrategyChange('exit', 'indicator', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="RSI">RSI</option>
                                        <option value="MACD">MACD</option>
                                        <option value="SMA_CROSS">SMA Crossover</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Condition</label>
                                    <select
                                        value={formData.strategy.exit.condition}
                                        onChange={(e) => handleStrategyChange('exit', 'condition', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="less_than">Less Than</option>
                                        <option value="greater_than">Greater Than</option>
                                        <option value="crosses_above">Crosses Above</option>
                                        <option value="crosses_below">Crosses Below</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Value</label>
                                    <input
                                        type="number"
                                        value={formData.strategy.exit.value}
                                        onChange={(e) => handleStrategyChange('exit', 'value', parseFloat(e.target.value))}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Stop Loss (%)</label>
                                    <input
                                        type="number"
                                        value={formData.strategy.exit.stopLoss}
                                        onChange={(e) => handleStrategyChange('exit', 'stopLoss', parseFloat(e.target.value))}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-2">Take Profit (%)</label>
                                    <input
                                        type="number"
                                        value={formData.strategy.exit.takeProfit}
                                        onChange={(e) => handleStrategyChange('exit', 'takeProfit', parseFloat(e.target.value))}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Position Sizing */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-purple-400" />
                                Position Sizing
                            </h2>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Sizing Method</label>
                                    <select
                                        value={formData.strategy.sizing.type}
                                        onChange={(e) => handleStrategyChange('sizing', 'type', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="fixed">Fixed Amount</option>
                                        <option value="percent_of_capital">Percent of Capital</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        {formData.strategy.sizing.type === 'fixed' ? 'Amount (₹)' : 'Percentage (%)'}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.strategy.sizing.amount}
                                        onChange={(e) => handleStrategyChange('sizing', 'amount', parseFloat(e.target.value))}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview & Info */}
                    <div className="space-y-6">
                        {/* Strategy Summary */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                            <h3 className="font-semibold mb-4">Strategy Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="bg-slate-800 p-3 rounded">
                                    <div className="text-slate-400 text-xs mb-1">Entry Signal</div>
                                    <div className="font-medium">
                                        {formData.strategy.entry.indicator} {formData.strategy.entry.condition.replace('_', ' ')} {formData.strategy.entry.value}
                                    </div>
                                </div>
                                <div className="bg-slate-800 p-3 rounded">
                                    <div className="text-slate-400 text-xs mb-1">Exit Signal</div>
                                    <div className="font-medium">
                                        {formData.strategy.exit.indicator} {formData.strategy.exit.condition.replace('_', ' ')} {formData.strategy.exit.value}
                                    </div>
                                </div>
                                <div className="bg-slate-800 p-3 rounded">
                                    <div className="text-slate-400 text-xs mb-1">Risk Management</div>
                                    <div className="font-medium">
                                        SL: {formData.strategy.exit.stopLoss}% | TP: {formData.strategy.exit.takeProfit}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm space-y-2">
                                    <p className="font-semibold text-blue-300">Tips for Success</p>
                                    <ul className="text-slate-300 space-y-1 list-disc list-inside">
                                        <li>Always backtest before going live</li>
                                        <li>Use stop-loss to limit risk</li>
                                        <li>Start with small position sizes</li>
                                        <li>Monitor performance regularly</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Backtest Results */}
                {backtestResults && (
                    <div className="mt-6">
                        <BacktestResults results={backtestResults} />
                    </div>
                )}

                {/* Templates Modal */}
                {showTemplates && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                                <h2 className="text-xl font-bold">Strategy Templates</h2>
                                <button
                                    onClick={() => setShowTemplates(false)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                {templates.map((template, i) => (
                                    <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
                                        onClick={() => applyTemplate(template)}
                                    >
                                        <h3 className="font-semibold mb-2">{template.name}</h3>
                                        <p className="text-sm text-slate-400 mb-3">{template.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs bg-slate-700 px-2 py-1 rounded">{template.type}</span>
                                            <button className="text-sm text-blue-400 hover:text-blue-300">
                                                Use Template →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlgoBuilder;
