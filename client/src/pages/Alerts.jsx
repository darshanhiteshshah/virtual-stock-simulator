import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import { getAlerts, deleteAlert } from '../services/alertService';
import { Bell, Trash2 } from 'lucide-react';

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
        setAlerts(alerts.filter(a => a._id !== alertId)); // Optimistic delete
        try {
            await deleteAlert(alertId, user.token);
        } catch (error) {
            console.error("Failed to delete alert", error);
            fetchAlerts(); // Revert if delete fails
        }
    };

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-3xl font-bold text-orange-400 mb-6 flex items-center gap-3"><Bell /> Price Alerts</h1>
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800">
                {isLoading ? <p>Loading alerts...</p> : alerts.length > 0 ? (
                    <ul className="space-y-4">
                        {alerts.map(alert => (
                            <li key={alert._id} className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
                                <div>
                                    <p className="font-semibold text-white">{alert.symbol}</p>
                                    <p className="text-sm text-gray-400">
                                        Alert when price is {alert.condition} ₹{alert.targetPrice.toLocaleString()}
                                    </p>
                                </div>
                                <button onClick={() => handleDelete(alert._id)} className="text-red-500 hover:text-red-400">
                                    <Trash2 size={18} />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500">You have no active price alerts.</p>
                )}
            </div>
        </div>
    );
};

export default Alerts;
