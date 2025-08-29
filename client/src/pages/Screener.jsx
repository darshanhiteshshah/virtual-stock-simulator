import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { screenStocks } from '../services/stockService';
import { formatCurrency } from '../utils/currencyFormatter';
import { Filter, Loader2, Search } from 'lucide-react';
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

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            const data = await screenStocks(filters, user.token);
            setResults(data);
        } catch (error) {
            console.error("Failed to fetch screener results", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleSearch(); // initial search on load
    }, []);

    const sectors = [
        "Information Technology", "Financial Services", "Automotive",
        "Pharmaceuticals", "FMCG", "Infrastructure", "Energy",
        "Metals", "Real Estate", "Conglomerate"
    ];

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-orange-400 mb-6 flex items-center gap-3">
                <Filter /> Stock Screener
            </h1>

            {/* Filters */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Sector</label>
                    <select
                        name="sector"
                        value={filters.sector}
                        onChange={handleFilterChange}
                        className="bg-gray-800 p-2 rounded-lg"
                    >
                        <option value="">All</option>
                        {sectors.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Min Market Cap (Cr.)</label>
                    <input type="number" name="minMarketCap" value={filters.minMarketCap} onChange={handleFilterChange} className="bg-gray-800 p-2 rounded-lg" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Max Market Cap (Cr.)</label>
                    <input type="number" name="maxMarketCap" value={filters.maxMarketCap} onChange={handleFilterChange} className="bg-gray-800 p-2 rounded-lg" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Min P/E Ratio</label>
                    <input type="number" name="minPeRatio" value={filters.minPeRatio} onChange={handleFilterChange} className="bg-gray-800 p-2 rounded-lg" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Max P/E Ratio</label>
                    <input type="number" name="maxPeRatio" value={filters.maxPeRatio} onChange={handleFilterChange} className="bg-gray-800 p-2 rounded-lg" />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="bg-orange-500 p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                    Apply
                </button>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-800">
                <table className="min-w-full text-sm text-left text-gray-300">
                    <thead className="bg-gray-800 text-orange-300 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3">Symbol</th>
                            <th className="px-6 py-3">Sector</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Market Cap (Cr.)</th>
                            <th className="px-6 py-3">P/E Ratio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-8">
                                    <Loader2 className="animate-spin inline-block" />
                                </td>
                            </tr>
                        ) : results.length > 0 ? (
                            results.map(stock => (
                                <tr key={stock.symbol} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4">
                                        <Link to={`/stock/${stock.symbol}`} className="font-semibold text-blue-300 hover:underline">
                                            {stock.symbol}
                                        </Link>
                                        <div className="text-xs text-gray-500">{stock.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{stock.sector}</td>
                                    <td className="px-6 py-4 font-medium text-yellow-300">{formatCurrency(Number(stock.price))}</td>
                                    <td className="px-6 py-4">{Number(stock.marketCap).toLocaleString()}</td>
                                    <td className="px-6 py-4">{stock.peRatio}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-gray-500">
                                    No stocks match your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Screener;
