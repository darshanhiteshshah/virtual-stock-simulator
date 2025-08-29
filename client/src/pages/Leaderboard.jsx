import React, { useEffect, useState, useCallback } from "react";
import { fetchLeaderboard } from "../services/leaderboardService";
import { formatCurrency } from "../utils/currencyFormatter";
import { Trophy } from "lucide-react";
import LeaderboardCard from "../components/LeaderboardCard";

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Start in loading state
    const [error, setError] = useState("");

    // Wrap the data fetching logic in useCallback to create a stable function
    const fetchData = useCallback(async () => {
        // Don't show the main loading skeleton on background refreshes
        // setIsLoading(true); 
        setError("");
        try {
            const data = await fetchLeaderboard();
            setLeaderboard(data);
        } catch (err) {
            setError("Failed to fetch leaderboard. Please try again later.");
            console.error("Failed to fetch leaderboard:", err);
        } finally {
            // Only set loading to false on the initial fetch
            if (isLoading) {
                setIsLoading(false);
            }
        }
    }, [isLoading]); // Dependency on isLoading to manage initial load state

    // Set up an interval to refetch data every 5 seconds
    useEffect(() => {
        // Fetch data immediately when the component mounts
        fetchData();

        // Set up the interval to fetch data periodically
        const intervalId = setInterval(fetchData, 5000); // Refresh every 5 seconds

        // Cleanup function: clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [fetchData]);

    const renderLoadingSkeleton = () => (
        <div className="space-y-4 max-w-2xl mx-auto animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 bg-gray-700 rounded"></div>
                        <div className="h-6 w-32 bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-6 w-24 bg-gray-700 rounded"></div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="p-4 md:p-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-orange-400 flex items-center justify-center gap-3">
                    <Trophy size={32} className="text-yellow-400" />
                    Leaderboard
                </h1>
                <p className="text-gray-400 mt-2">Top traders ranked by total net worth. Updates automatically.</p>
            </div>

            {isLoading && renderLoadingSkeleton()}
            
            {error && (
                <div className="text-center text-red-400 p-8 bg-red-500/10 rounded-lg">{error}</div>
            )}

            {!isLoading && !error && (
                <div className="space-y-4 max-w-2xl mx-auto">
                    {leaderboard.length > 0 ? (
                        leaderboard.map((user, index) => (
                            <LeaderboardCard
                                key={user.username}
                                rank={index + 1}
                                username={user.username}
                                netWorth={formatCurrency(user.netWorth)}
                            />
                        ))
                    ) : (
                        <div className="text-center text-gray-500 p-8">The leaderboard is currently empty.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
