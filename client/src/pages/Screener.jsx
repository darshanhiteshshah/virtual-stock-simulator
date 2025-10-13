import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { screenStocks } from '../services/stockService';
import { formatCurrency } from '../utils/currencyFormatter';
import { Filter, Search, TrendingUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Screener = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState({
        sector: '',
        minMarketCap: '',
        maxMarketCap: '',
        minPeRatio: '',
        maxPeRatio: '',
    });

    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearch = async () => {
        setIsLoading(true);
        setHasSearched(true);
        try {
            const data = await screenStocks(filters, user.token);
            setResults(data);
        } catch (error) {
            console.error("Failed to fetch screener results", error);
        } finally {
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({
            sector: '',
            minMarketCap: '',
            maxMarketCap: '',
            minPeRatio: '',
            maxPeRatio: '',
        });
    };

    const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

    useEffect(() => {
        handleSearch();
    }, []);

    const sectors = [
        "Information Technology", "Financial Services", "Automotive",
        "Pharmaceuticals", "FMCG", "Infrastructure", "Energy",
        "Metals", "Real Estate", "Conglomerate"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Stock Screener</h1>
                    <p className="text-slate-400 text-sm">Filter stocks based on your investment criteria</p>
                </div>

                {/* Filters */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Filter size={20} className="text-blue-400" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </h2>
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                            >
                                <X size={16} />
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-slate-400">Sector</label>
                            <select
                                name="sector"
                                value={filters.sector}
                                onChange={handleFilterChange}
                                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                <option value="">All Sectors</option>
                                {sectors.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-slate-400">Min Market Cap (Cr.)</label>
                            <input 
                                type="number" 
                                name="minMarketCap" 
                                value={filters.minMarketCap} 
                                onChange={handleFilterChange} 
                                placeholder="e.g., 1000"
                                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-slate-400">Max Market Cap (Cr.)</label>
                            <input 
                                type="number" 
                                name="maxMarketCap" 
                                value={filters.maxMarketCap} 
                                onChange={handleFilterChange} 
                                placeholder="e.g., 100000"
                                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-slate-400">Min P/E Ratio</label>
                            <input 
                                type="number" 
                                name="minPeRatio" 
                                value={filters.minPeRatio} 
                                onChange={handleFilterChange} 
                                placeholder="e.g., 10"
                                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-slate-400">Max P/E Ratio</label>
                            <input 
                                type="number" 
                                name="maxPeRatio" 
                                value={filters.maxPeRatio} 
                                onChange={handleFilterChange} 
                                placeholder="e.g., 30"
                                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="mt-6 w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Searching...</span>
                            </>
                        ) : (
                            <>
                                <Search size={20} />
                                <span>Apply Filters</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Results */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">
                            Results
                        </h2>
                        {!isLoading && hasSearched && (
                            <span className="text-sm text-slate-400">
                                {results.length} {results.length === 1 ? 'stock' : 'stocks'} found
                            </span>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800/50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Symbol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Sector</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Market Cap</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">P/E Ratio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                                                <p className="text-slate-400 text-sm">Searching stocks...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : results.length > 0 ? (
                                    results.map(stock => (
                                        <tr key={stock.symbol} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link 
                                                    to={`/stock/${stock.symbol}`} 
                                                    className="font-semibold text-blue-400 hover:text-blue-300 uppercase transition-colors"
                                                >
                                                    {stock.symbol}
                                                </Link>
                                                <div className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{stock.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-300 text-xs">{stock.sector}</span>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-white">
                                                {formatCurrency(Number(stock.price))}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">
                                                ₹{Number(stock.marketCap).toLocaleString()} Cr
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                    stock.peRatio === 'N/A' ? 'bg-slate-700/50 text-slate-400' :
                                                    Number(stock.peRatio) < 15 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    Number(stock.peRatio) > 30 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                    {stock.peRatio}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
                                                    <TrendingUp className="w-8 h-8 text-slate-600" />
                                                </div>
                                                <p className="text-slate-400 text-lg font-medium">No stocks found</p>
                                                <p className="text-slate-500 text-sm">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Screener;
