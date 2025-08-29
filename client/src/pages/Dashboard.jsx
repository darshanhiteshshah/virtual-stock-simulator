import React, { useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { usePortfolio } from '../context/PortfolioContext';
import PortfolioTable from '../components/PortfolioTable';
import SectorDonutChart from '../components/SectorDonutChart';
import ProfitLossChart from '../components/ProfitLossChart';
import TradeFeed from '../components/TradeFeed';
import { formatCurrency } from '../utils/currencyFormatter';
import { Wallet, Briefcase, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import PortfolioHistoryChart from '../components/PortfolioHistoryChart';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 100 },
    },
};

const Dashboard = () => {
    const { user } = useAuth();
    const { portfolio = [], walletBalance = 0, isLoading, error } = usePortfolio();

    const { totalPortfolioValue, sectorAllocation, profitLossData } = useMemo(() => {
        if (!portfolio.length) {
            return {
                totalPortfolioValue: 0,
                sectorAllocation: [],
                profitLossData: [],
            };
        }

        const totalValue = portfolio.reduce((acc, stock) => acc + (stock.totalValue || 0), 0);

        const allocationMap = {};
        for (const stock of portfolio) {
            const sector = stock.sector || 'Other';
            allocationMap[sector] = (allocationMap[sector] || 0) + (stock.totalValue || 0);
        }

        const allocation = Object.entries(allocationMap)
            .map(([sector, value]) => ({ name: sector, value }))
            .sort((a, b) => b.value - a.value);

        const plData = portfolio
            .map(({ symbol, profitLoss }) => ({
                symbol,
                profitLoss: profitLoss || 0,
            }))
            .sort((a, b) => Math.abs(b.profitLoss) - Math.abs(a.profitLoss));

        return {
            totalPortfolioValue: totalValue,
            sectorAllocation: allocation,
            profitLossData: plData,
        };
    }, [portfolio]);

    const totalNetWorth = (walletBalance || 0) + (totalPortfolioValue || 0);

    if (error) {
        return <div className="text-center text-red-400 p-8">{error}</div>;
    }

    return (
        <div className="p-6 max-w-full mx-auto space-y-6">
            {/* Header */}
            <motion.div
                className="text-left"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-white">
                    Dashboard
                </h1>
                <p className="text-slate-400 text-sm">
                    Welcome back, <span className="text-cyan-400 font-medium">{user?.username || 'Trader'}</span>!
                </p>
            </motion.div>

            {/* Summary Cards */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <DashboardCard
                    title="Wallet Balance"
                    value={formatCurrency(walletBalance || 0)}
                    icon={<Wallet size={24} className="text-green-400" />}
                />
                <DashboardCard
                    title="Portfolio Value"
                    value={formatCurrency(totalPortfolioValue || 0)}
                    icon={<Briefcase size={24} className="text-blue-400" />}
                />
                <DashboardCard
                    title="Total Net Worth"
                    value={formatCurrency(totalNetWorth || 0)}
                    icon={<TrendingUp size={24} className="text-cyan-400" />}
                />
            </motion.div>

            {/* --- NEW: PERFORMANCE CHART (Full Width) --- */}
        <motion.div
            className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 shadow"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
        >
            <h2 className="text-white text-lg font-semibold mb-4">Portfolio Performance</h2>
            <PortfolioHistoryChart />
        </motion.div>

        {/* Portfolio Table (Full Width) */}
        <motion.div
            className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 shadow"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }} // Adjusted delay
        >
            <h2 className="text-white text-lg font-semibold mb-4">Your Holdings</h2>
            <PortfolioTable stocks={portfolio} isLoading={isLoading} />
        </motion.div>

        {/* Bottom Row (Feed and Charts) */}
        {/* ... (Adjust delays as needed) */}
    

            {/* Portfolio Table (Full Width) */}
            <motion.div
                className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 shadow"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-white text-lg font-semibold mb-4">Your Holdings</h2>
                <PortfolioTable stocks={portfolio} isLoading={isLoading} />
            </motion.div>

            {/* Bottom Row (Feed and Charts) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.4 }}
                >
                    <TradeFeed />
                </motion.div>

                <motion.div
                    className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 shadow"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="text-white text-lg font-semibold mb-4">Profit / Loss</h2>
                    <ProfitLossChart data={profitLossData} />
                </motion.div>

                <motion.div
                    className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 shadow"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.6 }}
                >
                    <h2 className="text-white text-lg font-semibold mb-4">Sector Allocation</h2>
                    <SectorDonutChart data={sectorAllocation} />
                </motion.div>
            </div>
        </div>
    );
};

// Dashboard Card Component
const DashboardCard = ({ title, value, icon }) => {
    return (
        <motion.div
            className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow flex items-center gap-4"
            variants={itemVariants}
            whileHover={{ y: -4, shadow: 'xl' }}
        >
            <div className="bg-slate-800 p-3 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-xs text-slate-400">{title}</p>
                <p className="text-xl font-bold text-white">{value}</p>
            </div>
        </motion.div>
    );
};

export default Dashboard;