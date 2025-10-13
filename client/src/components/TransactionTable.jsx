import { useEffect, useState } from "react";
import { fetchTransactions } from "../services/transactionService";
import useAuth from "../hooks/useAuth";
import { formatCurrency } from "../utils/currencyFormatter";
import { formatDate } from "../utils/dateFormatter";
import { History, ShoppingCart, Banknote, Filter } from "lucide-react";

const TransactionTable = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [filterType, setFilterType] = useState("ALL");

    useEffect(() => {
        if (!user?.token) {
            setTransactions([]);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError("");
            try {
                const res = await fetchTransactions(user.token);
                const sortedTxns = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setTransactions(sortedTxns);
                setFilteredTransactions(sortedTxns);
            } catch (err) {
                console.error("Failed to fetch transactions:", err);
                setError("Could not load your transaction history. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user?.token]);

    // Filter transactions
    useEffect(() => {
        if (filterType === "ALL") {
            setFilteredTransactions(transactions);
        } else {
            setFilteredTransactions(transactions.filter(txn => txn.type === filterType));
        }
    }, [filterType, transactions]);

    // Calculate summary stats
    const stats = {
        totalBuys: transactions.filter(t => t.type === "BUY").reduce((sum, t) => sum + (t.quantity * t.price), 0),
        totalSells: transactions.filter(t => t.type === "SELL").reduce((sum, t) => sum + (t.quantity * t.price), 0),
        totalDividends: transactions.filter(t => t.type === "DIVIDEND").reduce((sum, t) => sum + (t.quantity * t.price), 0)
    };

    const renderLoadingSkeleton = () => (
        [...Array(5)].map((_, index) => (
            <tr key={index} className="border-b border-slate-800/50 animate-pulse">
                <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-12"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-28"></div></td>
            </tr>
        ))
    );

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center text-slate-400 p-12 bg-slate-900/50 rounded-xl border border-slate-800/50">
                        Please log in to view your transaction history.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
                    <p className="text-slate-400 text-sm">View all your trading activity</p>
                </div>

                {/* Summary Stats */}
                {!isLoading && transactions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">Total Purchases</span>
                                <ShoppingCart className="w-5 h-5 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalBuys)}</p>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">Total Sales</span>
                                <Banknote className="w-5 h-5 text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalSells)}</p>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">Total Dividends</span>
                                <History className="w-5 h-5 text-violet-400" />
                            </div>
                            <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalDividends)}</p>
                        </div>
                    </div>
                )}

                {/* Filter and Table */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                    {/* Filter Buttons */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <History size={20} />
                            All Transactions
                        </h2>
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400" />
                            {["ALL", "BUY", "SELL", "DIVIDEND"].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        filterType === type
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800/50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Symbol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Total Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? renderLoadingSkeleton() : (
                                    error ? (
                                        <tr>
                                            <td colSpan="6" className="text-center p-12">
                                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 inline-block">
                                                    <p className="text-red-400">{error}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center p-12">
                                                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <History className="w-8 h-8 text-slate-600" />
                                                </div>
                                                <p className="text-slate-400 text-lg font-medium mb-2">
                                                    {filterType === "ALL" ? "No transactions yet" : `No ${filterType} transactions`}
                                                </p>
                                                <p className="text-slate-500 text-sm">Start trading to see your history here</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTransactions.map((txn) => {
                                            const isBuy = txn.type === "BUY";
                                            const isSell = txn.type === "SELL";
                                            const isDividend = txn.type === "DIVIDEND";

                                            return (
                                                <tr key={txn._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors duration-200">
                                                    <td className="px-6 py-4 text-slate-300">{formatDate(txn.date)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold ${
                                                            isBuy ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                            isSell ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                            'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                                        }`}>
                                                            {txn.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold text-blue-400 uppercase">{txn.symbol}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-white font-medium">{txn.quantity}</td>
                                                    <td className="px-6 py-4 text-slate-300">
                                                        {formatCurrency(txn.price)}
                                                        {isDividend && <span className="text-xs text-slate-500 ml-1">/ share</span>}
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-white">
                                                        {formatCurrency(txn.quantity * txn.price)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Results Count */}
                    {!isLoading && filteredTransactions.length > 0 && (
                        <div className="mt-4 text-center text-sm text-slate-400">
                            Showing {filteredTransactions.length} of {transactions.length} transactions
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionTable;
