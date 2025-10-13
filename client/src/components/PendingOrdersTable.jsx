import React from 'react';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateFormatter';
import { Trash2, Clock, TrendingUp } from 'lucide-react';

const PendingOrdersTable = ({ orders, onCancel }) => {
    if (!orders || orders.length === 0) {
        return (
            <div className="mt-6 flex flex-col items-center justify-center py-12 bg-slate-900/30 rounded-xl border border-slate-800/50">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 text-lg font-medium mb-2">No pending orders</p>
                <p className="text-slate-500 text-sm">Your limit orders will appear here</p>
            </div>
        );
    }

    return (
        <div className="mt-6 bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Clock size={20} className="text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Pending Orders</h3>
                <span className="ml-auto text-sm text-slate-400">
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-800/50">
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Symbol</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Target Price</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => {
                            const isBuy = order.tradeType === 'BUY';
                            const orderTypeFormatted = order.orderType.replace('_', ' ');

                            return (
                                <tr 
                                    key={order._id} 
                                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                                >
                                    <td className="px-4 py-4 text-slate-300">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="font-semibold text-blue-400 uppercase">
                                            {order.symbol}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-400 uppercase">
                                                {orderTypeFormatted}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                                                isBuy ? 'text-blue-400' : 'text-emerald-400'
                                            }`}>
                                                {order.tradeType}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-white font-medium">
                                        {order.quantity}
                                    </td>
                                    <td className="px-4 py-4 text-white font-semibold">
                                        {formatCurrency(order.targetPrice)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <button 
                                            onClick={() => onCancel(order._id)} 
                                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 transition-all duration-200"
                                            title="Cancel order"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PendingOrdersTable;
