import React from 'react';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateFormatter';
import { Trash2 } from 'lucide-react';

const PendingOrdersTable = ({ orders, onCancel }) => {
    if (!orders || orders.length === 0) {
        return <p className="text-center text-gray-500 mt-4">No pending orders.</p>;
    }

    return (
        <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-700 text-xs uppercase">
                    <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Symbol</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Qty</th>
                        <th className="p-3">Target Price</th>
                        <th className="p-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order._id} className="border-b border-gray-700">
                            <td className="p-3 text-gray-400">{formatDate(order.createdAt)}</td>
                            <td className="p-3 font-semibold">{order.symbol}</td>
                            <td className={`p-3 font-semibold ${order.tradeType === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                {order.orderType.replace('_', '-')} {order.tradeType}
                            </td>
                            <td className="p-3">{order.quantity}</td>
                            <td className="p-3">{formatCurrency(order.targetPrice)}</td>
                            <td className="p-3">
                                <button onClick={() => onCancel(order._id)} className="text-red-500 hover:text-red-400">
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PendingOrdersTable;  