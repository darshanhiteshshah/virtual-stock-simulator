import { useEffect, useState } from "react";
import { getPendingOrders, cancelOrder } from "../services/tradeService";
import useAuth from "../hooks/useAuth";
import { Clock, X, TrendingUp, TrendingDown } from "lucide-react";

const PendingOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
        // Refresh every 10 seconds
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        if (!user?.token) return;
        
        try {
            const data = await getPendingOrders(user.token);
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleCancel = async (orderId) => {
        if (!confirm('Cancel this order?')) return;
        
        try {
            setLoading(true);
            await cancelOrder(orderId, user.token);
            fetchOrders(); // Refresh list
        } catch (error) {
            alert('Failed to cancel order');
        } finally {
            setLoading(false);
        }
    };

    if (orders.length === 0) {
        return (
            <div className="text-center p-8 text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pending orders</p>
                <p className="text-sm mt-2">Limit orders will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Pending Orders ({orders.length})
            </h3>
            
            {orders.map(order => (
                <div 
                    key={order._id}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-400 text-lg">
                                {order.symbol}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                order.tradeType === 'BUY' 
                                    ? 'bg-emerald-500/20 text-emerald-400' 
                                    : 'bg-red-500/20 text-red-400'
                            }`}>
                                {order.tradeType}
                            </span>
                        </div>
                        <button
                            onClick={() => handleCancel(order._id)}
                            disabled={loading}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-red-400" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-slate-400">Type:</span>
                            <span className="ml-2 text-white font-medium">{order.orderType}</span>
                        </div>
                        <div>
                            <span className="text-slate-400">Quantity:</span>
                            <span className="ml-2 text-white font-medium">{order.quantity}</span>
                        </div>
                        <div>
                            <span className="text-slate-400">Target:</span>
                            <span className="ml-2 text-white font-medium">
                                ₹{order.targetPrice || order.stopPrice}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400">Created:</span>
                            <span className="ml-2 text-white font-medium">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PendingOrders;
