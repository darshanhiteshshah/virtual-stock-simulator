import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getAlerts, deleteAlert } from '../services/alertService';
import { formatCurrency } from '../utils/currencyFormatter';
import { Bell, Trash2, TrendingUp, TrendingDown, Plus } from 'lucide-react';

const Alerts = () => {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAlerts = useCallback(async () => {
        if (!user?.token) return;
        try {
            const res = await getAlerts(user.token);
            setAlerts(res.data);
        } catch (error) {
            console.error("Failed to fetch alerts", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    const handleDelete = async (alertId) => {
        if (!user?.token) return;
        setAlerts(alerts.filter(a => a._id !== alertId));
        try {
            await deleteAlert(alertId, user.token);
        } catch (error) {
            console.error("Failed to delete alert", error);
            fetchAlerts();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Price Alerts</h1>
                        <p className="text-slate-400 text-sm">Get notified when stocks reach your target price</p>
                    </div>
                    <Link
                        to="/trade"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Create Alert
                    </Link>
                </div>

                {/* Alerts List */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Bell className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">
                            {alerts.length > 0 ? `${alerts.length} Active ${alerts.length === 1 ? 'Alert' : 'Alerts'}` : 'No Active Alerts'}
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                            <p className="text-slate-400 text-sm">Loading alerts...</p>
                        </div>
                    ) : alerts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {alerts.map(alert => {
                                const isAbove = alert.condition === 'above';
                                
                                return (
                                    <div 
                                        key={alert._id} 
                                        className="bg-slate-800/30 border border-slate-800/50 rounded-lg p-5 hover:border-slate-700/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg border ${
                                                    isAbove 
                                                        ? 'bg-emerald-500/10 border-emerald-500/20' 
                                                        : 'bg-red-500/10 border-red-500/20'
                                                }`}>
                                                    {isAbove ? (
                                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                                    ) : (
                                                        <TrendingDown className="w-5 h-5 text-red-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white text-lg">{alert.symbol}</h3>
                                                    <p className="text-xs text-slate-500 uppercase">{alert.condition}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDelete(alert._id)} 
                                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 transition-all duration-200"
                                                title="Delete alert"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-sm text-slate-400">Target Price</span>
                                                <span className="text-2xl font-bold text-white">
                                                    {formatCurrency(alert.targetPrice)}
                                                </span>
                                            </div>
                                            <div className={`text-xs px-3 py-2 rounded-md border ${
                                                isAbove 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                                Alert when price goes {isAbove ? 'above' : 'below'} target
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                <Bell className="w-8 h-8 text-slate-600" />
                            </div>
                            <p className="text-slate-400 text-lg font-medium mb-2">No active alerts</p>
                            <p className="text-slate-500 text-sm mb-6 text-center max-w-md">
                                Create price alerts to get notified when stocks reach your target price
                            </p>
                            <Link
                                to="/trade"
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Create Your First Alert
                            </Link>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                {alerts.length > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                        <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div>
                                <h3 className="text-white font-semibold mb-2">How Price Alerts Work</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    You'll receive a notification when a stock reaches your target price. Alerts are checked every few minutes during market hours. Create more alerts from the trading page.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alerts;
