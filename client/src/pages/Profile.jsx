import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { getUserProfile, updateUserPassword, logoutOtherSessions } from '../services/userService';
import { formatCurrency } from '../utils/currencyFormatter';
import { User, Wallet, Briefcase, Lock, Loader2, ShieldCheck } from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useAuth(); // Get setUser to update token
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false); // State for new button

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
    
    // --- NEW HANDLER ---
    const handleLogoutOthers = async () => {
        setIsLoggingOut(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await logoutOtherSessions(user.token);
            // Update the user in context with the new token to keep this session active
            setUser({ ...user, token: res.data.token });
            setMessage({ type: 'success', text: res.data.message });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to log out other sessions.' });
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin text-orange-400" size={32} /></div>;
    }
    if (!profileData) {
        return <div className="text-center text-red-400 p-8">Could not load profile data.</div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-8">
            <h1 className="text-3xl font-bold text-orange-400 flex items-center gap-3"><User /> User Profile</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoCard title="Username" value={profileData.username} />
                <InfoCard title="Email" value={profileData.email} />
                <InfoCard title="Member Since" value={new Date(profileData.createdAt).toLocaleDateString('en-IN')} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoCard title="Wallet Balance" value={formatCurrency(profileData.walletBalance)} icon={<Wallet />} />
                <InfoCard title="Portfolio Value" value={formatCurrency(profileData.portfolioValue)} icon={<Briefcase />} />
                <InfoCard title="Net Worth" value={formatCurrency(profileData.netWorth)} />
            </div>

            {/* --- NEW SECURITY SECTION --- */}
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800 space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-orange-400 mb-4 flex items-center gap-2"><Lock /> Update Password</h2>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                        {/* Inputs for password update */}
                        <div>
                            <label className="block mb-1 text-gray-400">Current Password</label>
                            <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700" required />
                        </div>
                        <div>
                            <label className="block mb-1 text-gray-400">New Password</label>
                            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700" required />
                        </div>
                        <button type="submit" disabled={isUpdating} className="px-6 py-2 bg-orange-500 rounded-lg hover:bg-orange-600 font-semibold flex items-center justify-center w-40 disabled:bg-orange-700">
                            {isUpdating ? <Loader2 className="animate-spin" /> : 'Update Password'}
                        </button>
                    </form>
                </div>

                <div className="border-t border-gray-700 pt-8">
                     <h2 className="text-2xl font-bold text-orange-400 mb-4 flex items-center gap-2"><ShieldCheck /> Account Security</h2>
                     <p className="text-gray-400 mb-4 max-w-md">If you suspect unauthorized activity, you can log out all other active sessions on other devices.</p>
                     <button onClick={handleLogoutOthers} disabled={isLoggingOut} className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center w-52 disabled:bg-red-800">
                        {isLoggingOut ? <Loader2 className="animate-spin" /> : 'Logout Other Sessions'}
                    </button>
                </div>
            </div>

            {message.text && (
                <p className={`mt-4 text-center font-semibold ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{message.text}</p>
            )}
        </div>
    );
};

const InfoCard = ({ title, value, icon }) => (
    <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm text-gray-400 flex items-center gap-2">{icon}{title}</h3>
        <p className="text-xl font-semibold text-white">{value}</p>
    </div>
);

export default Profile;