import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { fetchAchievements } from '../services/achievementService';
import { Award, CheckCircle, Lock, Trophy } from 'lucide-react';

const Achievements = () => {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAchievements = async () => {
            if (user?.token) {
                try {
                    const res = await fetchAchievements(user.token);
                    setAchievements(res.data);
                } catch (error) {
                    console.error("Failed to fetch achievements", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadAchievements();
    }, [user]);

    const earnedCount = achievements.filter(a => a.isEarned).length;
    const totalCount = achievements.length;
    const progressPercent = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Achievements</h1>
                    <p className="text-slate-400 text-sm">Unlock badges by reaching trading milestones</p>
                </div>

                {/* Progress Card */}
                {!isLoading && achievements.length > 0 && (
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <Trophy className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Your Progress</h2>
                                    <p className="text-sm text-slate-400">
                                        {earnedCount} of {totalCount} achievements unlocked
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-yellow-400">{progressPercent.toFixed(0)}%</p>
                                <p className="text-xs text-slate-500">Complete</p>
                            </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="absolute h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-1000"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Achievements Grid */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Award className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">All Achievements</h2>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-32 bg-slate-800/50 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    ) : achievements.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {achievements.map((ach) => (
                                <div 
                                    key={ach.code}
                                    className={`relative p-5 rounded-lg border transition-all duration-300 ${
                                        ach.isEarned 
                                            ? 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/30 hover:border-yellow-500/50' 
                                            : 'bg-slate-800/30 border-slate-800/50 hover:border-slate-700/50'
                                    }`}
                                >
                                    {ach.isEarned && (
                                        <div className="absolute top-3 right-3">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl flex-shrink-0 ${
                                            ach.isEarned 
                                                ? 'bg-yellow-500/20 border border-yellow-500/30' 
                                                : 'bg-slate-700/50 border border-slate-700'
                                        }`}>
                                            {ach.isEarned ? (
                                                <CheckCircle className="w-6 h-6 text-yellow-400" />
                                            ) : (
                                                <Lock className="w-6 h-6 text-slate-500" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-semibold mb-1 ${
                                                ach.isEarned ? 'text-white' : 'text-slate-400'
                                            }`}>
                                                {ach.name}
                                            </h3>
                                            <p className={`text-sm leading-relaxed ${
                                                ach.isEarned ? 'text-slate-300' : 'text-slate-500'
                                            }`}>
                                                {ach.description}
                                            </p>
                                            {ach.isEarned && (
                                                <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                                                    <Trophy className="w-3 h-3 text-yellow-400" />
                                                    <span className="text-xs font-medium text-yellow-400">Unlocked</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                <Award className="w-8 h-8 text-slate-600" />
                            </div>
                            <p className="text-slate-400 text-lg font-medium">No achievements available</p>
                            <p className="text-slate-500 text-sm">Check back later for updates</p>
                        </div>
                    )}
                </div>

                {/* Tips Section */}
                {!isLoading && achievements.length > 0 && earnedCount < totalCount && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                        <div className="flex items-start gap-3">
                            <Award className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div>
                                <h3 className="text-white font-semibold mb-2">Keep Trading!</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Complete more trades, build your portfolio, and reach new milestones to unlock all achievements. Each badge represents a significant trading accomplishment.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Achievements;
