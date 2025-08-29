import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../utils/currencyFormatter';
import { PieChart as PieIcon } from 'lucide-react';
import { motion } from 'framer-motion';

// A predefined color palette for the chart sectors
const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#eab308'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <p className="text-gray-300 font-semibold">{data.name}</p>
                <p className="text-white">{formatCurrency(data.value)}</p>
                <p className="text-cyan-400">{`(${(data.percent * 100).toFixed(2)}%)`}</p>
            </div>
        );
    }
    return null;
};

const SectorDonutChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800 h-full flex flex-col items-center justify-center">
                <PieIcon className="text-gray-600 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-400">No Sector Data</h3>
                <p className="text-sm text-gray-500">Buy stocks to see your portfolio allocation.</p>
            </div>
        );
    }

    return (
        <motion.div 
            className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800 h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
        >
            <h2 className="text-2xl font-bold text-orange-400 mb-4 flex items-center gap-2">
                <PieIcon size={24} /> Sector Allocation
            </h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default SectorDonutChart;
