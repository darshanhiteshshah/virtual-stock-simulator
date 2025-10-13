import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { getUserProfile, updateUserPassword, logoutOtherSessions } from '../services/userService';
import { formatCurrency } from '../utils/currencyFormatter';
import { User, Wallet, TrendingUp, Lock, ShieldCheck, Mail, Calendar, PieChart } from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.token) {
                try {
                    const res = await getUserProfile(user.token);
                    setProfileData(res.data);
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
            return;
        }
        setIsUpdating(true);
        try {
            const res = await updateUserPassword(passwordData, user.token);
            setMessage({ type: 'success', text: res.data.message });
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password.' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogoutOthers = async () => {
        setIsLoggingOut(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await logoutOtherSessions(user.token);
            setUser({ ...user, token: res.data.token });
            setMessage({ type: 'success', text: res.data.message });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to log out other sessions.' });
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                    <p className="text-red-400">Could not load profile data.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
                    <p className="text-slate-400 text-sm">Manage your account settings and information</p>
                </div>

                {/* Account Information */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <User size={20} className="text-blue-400" />
                        Account Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoCard 
                            icon={<User size={16} className="text-blue-400" />}
                            title="Username" 
                            value={profileData.username} 
                        />
                        <InfoCard 
                            icon={<Mail size={16} className="text-violet-400" />}
                            title="Email" 
                            value={profileData.email} 
                        />
                        <InfoCard 
                            icon={<Calendar size={16} className="text-emerald-400" />}
                            title="Member Since" 
                            value={new Date(profileData.createdAt).toLocaleDateString('en-IN', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                            })} 
                        />
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <PieChart size={20} className="text-blue-400" />
                        Financial Summary
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard 
                            icon={<Wallet className="text-emerald-400" />}
                            title="Wallet Balance" 
                            value={formatCurrency(profileData.walletBalance)}
                            color="emerald"
                        />
                        <StatCard 
                            icon={<TrendingUp className="text-blue-400" />}
                            title="Portfolio Value" 
                            value={formatCurrency(profileData.portfolioValue)}
                            color="blue"
                        />
                        <StatCard 
                            icon={<PieChart className="text-violet-400" />}
                            title="Net Worth" 
                            value={formatCurrency(profileData.netWorth)}
                            color="violet"
                        />
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <ShieldCheck size={20} className="text-blue-400" />
                        Security Settings
                    </h2>

                    <div className="space-y-8">
                        {/* Update Password Section */}
                        <div>
                            <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                                <Lock size={18} className="text-slate-400" />
                                Change Password
                            </h3>
                            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-slate-300">
                                        Current Password
                                    </label>
                                    <input 
                                        type="password" 
                                        name="currentPassword" 
                                        value={passwordData.currentPassword} 
                                        onChange={handlePasswordChange} 
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-white placeholder-slate-500"
                                        placeholder="Enter current password"
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-slate-300">
                                        New Password
                                    </label>
                                    <input 
                                        type="password" 
                                        name="newPassword" 
                                        value={passwordData.newPassword} 
                                        onChange={handlePasswordChange} 
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-white placeholder-slate-500"
                                        placeholder="Enter new password (min 6 characters)"
                                        required 
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isUpdating} 
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
                                >
                                    {isUpdating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Updating...</span>
                                        </>
                                    ) : (
                                        'Update Password'
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Session Management Section */}
                        <div className="pt-8 border-t border-slate-800/50">
                            <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                                <ShieldCheck size={18} className="text-slate-400" />
                                Session Management
                            </h3>
                            <p className="text-slate-400 mb-4 text-sm max-w-xl">
                                If you suspect unauthorized activity, you can log out all other active sessions on other devices. This will keep your current session active.
                            </p>
                            <button 
                                onClick={handleLogoutOthers} 
                                disabled={isLoggingOut} 
                                className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px]"
                            >
                                {isLoggingOut ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Logging Out...</span>
                                    </>
                                ) : (
                                    'Logout Other Sessions'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Message Display */}
                {message.text && (
                    <div className={`p-4 rounded-lg ${
                        message.type === 'error' 
                            ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    }`}>
                        <p className="font-medium text-center">{message.text}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const InfoCard = ({ icon, title, value }) => (
    <div className="bg-slate-800/30 border border-slate-800/50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <h3 className="text-xs text-slate-400 uppercase tracking-wider">{title}</h3>
        </div>
        <p className="text-lg font-semibold text-white truncate">{value}</p>
    </div>
);

const StatCard = ({ icon, title, value, color }) => {
    const colorClasses = {
        emerald: 'bg-emerald-500/10 border-emerald-500/20',
        blue: 'bg-blue-500/10 border-blue-500/20',
        violet: 'bg-violet-500/10 border-violet-500/20'
    };

    return (
        <div className="bg-slate-800/30 border border-slate-800/50 p-5 rounded-lg hover:border-slate-700/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">{title}</span>
                <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    );
};

export default Profile;
