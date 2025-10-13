import React, { useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { usePortfolio } from '../context/PortfolioContext';
import PortfolioTable from '../components/PortfolioTable';
import SectorDonutChart from '../components/SectorDonutChart';
import ProfitLossChart from '../components/ProfitLossChart';
import TradeFeed from '../components/TradeFeed';
import { formatCurrency } from '../utils/currencyFormatter';
import { Wallet, TrendingUp, PieChart, Activity } from 'lucide-react';
import PortfolioHistoryChart from '../components/PortfolioHistoryChart';

const Dashboard = () => {
  const { user } = useAuth();
  const { portfolio = [], walletBalance = 0, isLoading, error } = usePortfolio();

  const { totalPortfolioValue, sectorAllocation, profitLossData, totalProfitLoss } = useMemo(() => {
    if (!portfolio.length) {
      return {
        totalPortfolioValue: 0,
        sectorAllocation: [],
        profitLossData: [],
        totalProfitLoss: 0,
      };
    }

    const totalValue = portfolio.reduce((acc, stock) => acc + (stock.totalValue || 0), 0);
    const totalPL = portfolio.reduce((acc, stock) => acc + (stock.profitLoss || 0), 0);

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
      totalProfitLoss: totalPL,
    };
  }, [portfolio]);

  const totalNetWorth = (walletBalance || 0) + (totalPortfolioValue || 0);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400 text-sm">
            Welcome back, <span className="text-blue-400 font-medium">{user?.username || 'Trader'}</span>
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Wallet Balance"
            value={formatCurrency(walletBalance || 0)}
            icon={<Wallet className="w-6 h-6 text-emerald-400" />}
            bgColor="bg-emerald-500/10"
            borderColor="border-emerald-500/20"
          />
          <StatCard
            title="Portfolio Value"
            value={formatCurrency(totalPortfolioValue || 0)}
            icon={<PieChart className="w-6 h-6 text-blue-400" />}
            bgColor="bg-blue-500/10"
            borderColor="border-blue-500/20"
          />
          <StatCard
            title="Total Net Worth"
            value={formatCurrency(totalNetWorth || 0)}
            icon={<TrendingUp className="w-6 h-6 text-violet-400" />}
            bgColor="bg-violet-500/10"
            borderColor="border-violet-500/20"
          />
          <StatCard
            title="Total P/L"
            value={formatCurrency(Math.abs(totalProfitLoss || 0))}
            icon={<Activity className="w-6 h-6 text-orange-400" />}
            bgColor={totalProfitLoss >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}
            borderColor={totalProfitLoss >= 0 ? "border-emerald-500/20" : "border-red-500/20"}
            valueColor={totalProfitLoss >= 0 ? "text-emerald-400" : "text-red-400"}
            prefix={totalProfitLoss >= 0 ? "+" : "-"}
          />
        </div>

        {/* Performance Chart */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-400" />
            Portfolio Performance
          </h2>
          <PortfolioHistoryChart />
        </div>

        {/* Portfolio Table */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart size={20} className="text-blue-400" />
            Your Holdings
          </h2>
          <PortfolioTable stocks={portfolio} isLoading={isLoading} />
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trade Feed */}
          <div className="lg:col-span-1">
            <TradeFeed />
          </div>

          {/* Profit/Loss Chart */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
            <ProfitLossChart data={profitLossData} />
          </div>

          {/* Sector Allocation */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
            <SectorDonutChart data={sectorAllocation} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, bgColor, borderColor, valueColor = "text-white", prefix = "" }) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 hover:border-slate-700/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-400 text-sm">{title}</p>
        <div className={`${bgColor} ${borderColor} border p-2 rounded-lg`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>
        {prefix}{value}
      </p>
    </div>
  );
};

export default Dashboard;
