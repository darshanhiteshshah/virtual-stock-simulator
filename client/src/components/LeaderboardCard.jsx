import React from 'react';

/**
 * A reusable card component to display a single user's rank on the leaderboard.
 * @param {object} props - The component props.
 * @param {number} props.rank - The user's rank.
 * @param {string} props.username - The user's name.
 * @param {string} props.netWorth - The user's formatted net worth.
 */
const LeaderboardCard = ({ rank, username, netWorth }) => {
    // Determine border color based on rank for a gamified feel
    const rankColor = rank === 1 ? 'border-yellow-400' : 
                      rank === 2 ? 'border-gray-400' : 
                      rank === 3 ? 'border-yellow-600' : 'border-gray-700';
    
    return (
        <div className={`flex items-center justify-between bg-gray-900 p-4 rounded-xl shadow-lg border ${rankColor} transition-all hover:bg-gray-800`}>
            <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-orange-400 w-8 text-center">#{rank}</div>
                <div className="text-lg font-semibold text-white">{username}</div>
            </div>
            <div className="text-xl font-bold text-green-400">{netWorth}</div>
        </div>
    );
};

export default LeaderboardCard;
