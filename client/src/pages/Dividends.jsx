import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://virtual-stock-simulator.onrender.com';

const Dividends = () => {
    const { token } = useAuth();
    const [userDividends, setUserDividends] = useState(null);
    const [upcomingDividends, setUpcomingDividends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDividends();
    }, []);

    const fetchDividends = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [userRes, upcomingRes] = await Promise.all([
                axios.get(`${API_URL}/api/dividends/user`, config),
                axios.get(`${API_URL}/api/dividends/upcoming`, config)
            ]);

            setUserDividends(userRes.data);
            setUpcomingDividends(upcomingRes.data.dividends);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dividends:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="w-full overflow-x-hidden min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-3">
                    <DollarSign className="w-8 h-8 text-emerald-400" />
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Dividend Tracker</h1>
                        <p className="text-slate-400 text-sm">Track your dividend income</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">Total Dividend Income</span>
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">
                            ₹{userDividends?.totalIncome.toFixed(2) || '0.00'}
                        </div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">Dividends Received</span>
                            <Calendar className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {userDividends?.count || 0}
                        </div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">Upcoming Dividends</span>
                            <DollarSign className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {upcomingDividends.length}
                        </div>
                    </div>
                </div>

                {/* Dividend History */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50 p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Dividend History</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Symbol</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Amount</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Quantity</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Total Income</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Ex-Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userDividends?.dividends.map((div, index) => (
                                    <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                        <td className="py-3 px-4 text-white font-medium">{div.symbol}</td>
                                        <td className="py-3 px-4 text-right text-slate-300">₹{div.amount.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-right text-slate-300">{div.quantity}</td>
                                        <td className="py-3 px-4 text-right text-emerald-400 font-semibold">
                                            ₹{div.totalIncome.toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-right text-slate-400">
                                            {new Date(div.exDate).toLocaleDateString('en-IN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dividends;
