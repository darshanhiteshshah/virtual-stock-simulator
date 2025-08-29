import { useEffect, useState } from "react";
import { fetchTransactions } from "../services/transactionService";
import useAuth from "../hooks/useAuth";
import { formatCurrency } from "../utils/currencyFormatter";
import { formatDate } from "../utils/dateFormatter";
import { History, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const TransactionTable = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

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
                // Sort transactions by date, most recent first
                const sortedTxns = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setTransactions(sortedTxns);
            } catch (err) {
                console.error("Failed to fetch transactions:", err);
                setError("Could not load your transaction history. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user?.token]);

    const renderLoadingSkeleton = () => (
        [...Array(5)].map((_, index) => (
            <tr key={index} className="border-b border-gray-700 animate-pulse">
                <td className="p-4"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-700 rounded w-20"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-700 rounded w-12"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-700 rounded w-28"></div></td>
            </tr>
        ))
    );

    if (!user) {
        return (
            <div className="text-center text-gray-500 p-8 bg-gray-900 rounded-xl border border-gray-800">
                Please log in to view your transaction history.
            </div>
        );
    }

    return (
        <div className="rounded-xl shadow-lg p-6 bg-gray-900 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-orange-400 flex items-center gap-2">
                <History size={24} />
                Transaction History
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-800 text-orange-300 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold">Type</th>
                            <th className="p-4 font-semibold">Symbol</th>
                            <th className="p-4 font-semibold">Quantity</th>
                            <th className="p-4 font-semibold">Price</th>
                            <th className="p-4 font-semibold">Total Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? renderLoadingSkeleton() : (
                            error ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-8 text-red-400">{error}</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-8 text-gray-500">
                                        You have no transactions yet.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((txn) => {
                                    const isBuy = txn.type === "BUY";
                                    const isSell = txn.type === "SELL";
                                    const isDividend = txn.type === "DIVIDEND";

                                    return (
                                        <tr key={txn._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200">
                                            <td className="p-4 text-gray-400">{formatDate(txn.date)}</td>
                                            <td className={`p-4 font-semibold flex items-center gap-2 ${isBuy || isDividend ? "text-green-400" : "text-red-400"}`}>
                                                {isBuy && <TrendingUp size={16} />}
                                                {isSell && <TrendingDown size={16} />}
                                                {isDividend && <DollarSign size={16} />}
                                                {txn.type}
                                            </td>
                                            <td className="p-4 font-mono text-blue-300">{txn.symbol}</td>
                                            <td className="p-4">{txn.quantity}</td>
                                            <td className="p-4">
                                                {formatCurrency(txn.price)}
                                                {isDividend && <span className="text-xs text-gray-500"> / share</span>}
                                            </td>
                                            <td className="p-4 font-medium text-white">{formatCurrency(txn.quantity * txn.price)}</td>
                                        </tr>
                                    );
                                })
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionTable;