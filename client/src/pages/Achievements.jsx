import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { fetchAchievements } from '../services/achievementService';
import { Award, CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

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

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-3xl font-bold text-orange-400 mb-6 flex items-center gap-3">
                <Award /> Achievements
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? [...Array(6)].map((_, i) => <div key={i} className="h-32 bg-gray-800 rounded-lg animate-pulse"></div>) :
                    achievements.map((ach, index) => (
                        <motion.div 
                            key={ach.code}
                            className={`p-6 rounded-xl border ${ach.isEarned ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-700 bg-gray-900'}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${ach.isEarned ? 'bg-yellow-400/20 text-yellow-400' : 'bg-gray-700 text-gray-400'}`}>
                                    {ach.isEarned ? <CheckCircle /> : <Lock />}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg ${ach.isEarned ? 'text-white' : 'text-gray-400'}`}>{ach.name}</h3>
                                    <p className="text-sm text-gray-500">{ach.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))
                }
            </div>
        </div>
    );
};

export default Achievements;
