import { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import { screenStocks } from '../services/stockService';
import { formatCurrency } from '../utils/currencyFormatter';
import { 
    Filter, Search, TrendingUp, X, Download, Save, 
    ArrowUpDown, ArrowUp, ArrowDown, Bookmark, Plus 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Screener = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState({
        sector: '',
        minMarketCap: '',
        maxMarketCap: '',
        minPeRatio: '',
        maxPeRatio: '',
        minPrice: '',
        maxPrice: '',
        minDividendYield: '',
        minROE: '',
        minVolume: '',
    });

    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [savedPresets, setSavedPresets] = useState([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [presetName, setPresetName] = useState('');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearch = useCallback(async () => {
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
    }, [filters, user.token]);

    const clearFilters = () => {
        setFilters({
            sector: '',
            minMarketCap: '',
            maxMarketCap: '',
            minPeRatio: '',
            maxPeRatio: '',
            minPrice: '',
            maxPrice: '',
            minDividendYield: '',
            minROE: '',
            minVolume: '',
        });
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedResults = [...results].sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === 'N/A') return 1;
        if (bVal === 'N/A') return -1;
        
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        
        if (sortConfig.direction === 'asc') {
            return aNum - bNum;
        }
        return bNum - aNum;
    });

    const savePreset = () => {
        if (!presetName.trim()) return;
        const newPreset = {
            id: Date.now(),
            name: presetName,
            filters: { ...filters }
        };
        const updated = [...savedPresets, newPreset];
        setSavedPresets(updated);
        localStorage.setItem('screenerPresets', JSON.stringify(updated));
        setShowSaveModal(false);
        setPresetName('');
    };

    const loadPreset = (preset) => {
        setFilters(preset.filters);
    };

    const deletePreset = (id) => {
        const updated = savedPresets.filter(p => p.id !== id);
        setSavedPresets(updated);
        localStorage.setItem('screenerPresets', JSON.stringify(updated));
    };

    const exportToCSV = () => {
        const headers = ['Symbol', 'Name', 'Sector', 'Price', 'Market Cap', 'P/E Ratio'];
        const csvContent = [
            headers.join(','),
            ...sortedResults.map(stock => [
                stock.symbol,
                `"${stock.name}"`,
                stock.sector,
                stock.price,
                stock.marketCap,
                stock.peRatio
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `screener-results-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    useEffect(() => {
        const saved = localStorage.getItem('screenerPresets');
        if (saved) {
            setSavedPresets(JSON.parse(saved));
        }
        handleSearch();
    }, []);

    const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

    const sectors = [
        "Information Technology", "Financial Services", "Automotive",
        "Pharmaceuticals", "FMCG", "Infrastructure", "Energy",
        "Metals", "Real Estate", "Conglomerate", "Telecom", "Healthcare"
    ];

    const quickFilters = [
        { name: 'Large Cap', filters: { minMarketCap: '20000' } },
        { name: 'Mid Cap', filters: { minMarketCap: '5000', maxMarketCap: '20000' } },
        { name: 'Small Cap', filters: { maxMarketCap: '5000' } },
        { name: 'Value Stocks', filters: { maxPeRatio: '15' } },
        { name: 'Growth Stocks', filters: { minPeRatio: '20' } },
        { name: 'Dividend Stocks', filters: { minDividendYield: '2' } },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Advanced Stock Screener</h1>
                        <p className="text-slate-400 text-sm">Filter stocks with 10+ criteria and save custom presets</p>
                    </div>
                    {results.length > 0 && (
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                        >
                            <Download size={18} />
                            Export CSV
                        </button>
                    )}
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2">
                    {quickFilters.map((qf, idx) => (
                        <button
                            key={idx}
                            onClick={() => setFilters(prev => ({ ...prev, ...qf.filters }))}
                            className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 text-sm rounded-lg border border-slate-700/50 transition-colors"
                        >
                            {qf.name}
                        </button>
                    ))}
                </div>

                {/* Saved Presets */}
                {savedPresets.length > 0 && (
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <Bookmark size={16} className="text-blue-400" />
                            Saved Presets
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {savedPresets.map(preset => (
                                <div key={preset.id} className="flex items-center gap-1 bg-slate-800/50 rounded-lg pr-1 border border-slate-700/50">
                                    <button
                                        onClick={() => loadPreset(preset)}
                                        className="px-3 py-1.5 text-sm text-slate-300 hover:text-white transition-colors"
                                    >
                                        {preset.name}
                                    </button>
                                    <button
                                        onClick={() => deletePreset(preset.id)}
                                        className="p-1 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                        <div className="flex gap-2">
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                                >
                                    <X size={16} />
                                    Clear All
                                </button>
                            )}
                            <button
                                onClick={() => setShowSaveModal(true)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg text-sm transition-colors"
                            >
                                <Save size={16} />
                                Save Preset
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {/* Sector */}
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

                        {/* Price Range */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-slate-400">Min Price (₹)</label>
                            <input 
                                type="number" 
                                name="minPrice" 
                                value={filters.minPrice} 
                                onChange={handleFilterChange} 
                                placeholder="e.g., 100"
                                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-slate-400">Max Price (₹)</label>
                            <input 
                                type="number" 
                                name="maxPrice" 
                                value={filters.maxPrice} 
                                onChange={handleFilterChange} 
                                placeholder="e.g., 5000"
                                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-500"
                            />
                        </div>

                        {/* Market Cap Range */}
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

                        {/* P/E Ratio Range */}
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

                        {/* Additional Filters */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-slate-400">Min Dividend Yield (%)</label>
                            <input 
                                type="number" 
                                name="minDividendYield" 
                                value={filters.minDividendYield} 
                                onChange={handleFilterChange} 
                                placeholder="e.g., 2"
                                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-slate-400">Min ROE (%)</label>
                            <input 
                                type="number" 
                                name="minROE" 
                                value={filters.minROE} 
                                onChange={handleFilterChange} 
                                placeholder="e.g., 15"
                                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-slate-400">Min Volume</label>
                            <input 
                                type="number" 
                                name="minVolume" 
                                value={filters.minVolume} 
                                onChange={handleFilterChange} 
                                placeholder="e.g., 100000"
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
                                {sortedResults.length} {sortedResults.length === 1 ? 'stock' : 'stocks'} found
                            </span>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800/50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Symbol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Sector</th>
                                    <th 
                                        onClick={() => handleSort('price')}
                                        className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-blue-400 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            Price
                                            {sortConfig.key === 'price' && (
                                                sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                            )}
                                            {sortConfig.key !== 'price' && <ArrowUpDown size={14} className="opacity-30" />}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('marketCap')}
                                        className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-blue-400 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            Market Cap
                                            {sortConfig.key === 'marketCap' && (
                                                sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                            )}
                                            {sortConfig.key !== 'marketCap' && <ArrowUpDown size={14} className="opacity-30" />}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('peRatio')}
                                        className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-blue-400 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            P/E Ratio
                                            {sortConfig.key === 'peRatio' && (
                                                sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                            )}
                                            {sortConfig.key !== 'peRatio' && <ArrowUpDown size={14} className="opacity-30" />}
                                        </div>
                                    </th>
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
                                ) : sortedResults.length > 0 ? (
                                    sortedResults.map(stock => (
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

            {/* Save Preset Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-white mb-4">Save Filter Preset</h3>
                        <input
                            type="text"
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            placeholder="Enter preset name..."
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 mb-4"
                            onKeyPress={(e) => e.key === 'Enter' && savePreset()}
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowSaveModal(false)}
                                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={savePreset}
                                disabled={!presetName.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Screener;
