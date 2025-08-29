import TransactionTable from "../components/TransactionTable";
import { History } from "lucide-react";

const TransactionHistory = () => {
    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold text-orange-400 flex items-center gap-3">
                    <History size={32} />
                    Transaction History
                </h1>
                <p className="text-gray-400 mt-2 max-w-md">
                    Below is a detailed record of all your buy and sell transactions, sorted by the most recent.
                </p>
            </div>

            {/* The TransactionTable component will be rendered here */}
            <TransactionTable />
        </div>
    );
};

export default TransactionHistory;
