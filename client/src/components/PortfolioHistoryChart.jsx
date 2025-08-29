import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { getPortfolioHistory } from '../services/userService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateFormatter';
import { Loader2 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm">{formatDate(label)}</p>
                <p className="text-white font-bold">{formatCurrency(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

const PortfolioHistoryChart = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user?.token) {
                try {
                    const res = await getPortfolioHistory(user.token);
                    setData(res.data);
                } catch (error) {
                    console.error("Failed to fetch portfolio history", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchHistory();
    }, [user]);

    if (isLoading) {
        return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-orange-400" /></div>;
    }
    
    if (data.length < 2) {
        return <div className="h-64 flex items-center justify-center text-gray-500">Not enough data to display chart. Check back tomorrow.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                    tickFormatter={(str) => new Date(str).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                    domain={['dataMin - 1000', 'dataMax + 1000']}
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                    tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="netWorth" stroke="#22c55e" strokeWidth={2} fill="url(#colorNetWorth)" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default PortfolioHistoryChart;