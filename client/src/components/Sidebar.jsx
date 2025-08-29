import { Link, NavLink } from "react-router-dom";
import useAuth  from "../hooks/useAuth";
import { LayoutDashboard, ArrowLeftRight, History, Trophy, Star, Thermometer } from "lucide-react"; // Added Thermometer icon
import { Bell } from "lucide-react"; 
import { Award ,Filter} from "lucide-react";
const Sidebar = () => {
    const { user } = useAuth();
    if (!user) return null;

    const linkClasses = "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors";
    const activeLinkClasses = "bg-orange-500/10 text-orange-400";
    const inactiveLinkClasses = "hover:bg-gray-700/50 text-gray-300";

    return (
        <aside className="w-64 bg-gray-900 text-gray-100 p-4 border-r border-gray-800 flex flex-col">
            <div className="text-2xl font-bold text-orange-400 p-4 text-center">
                VirtualSim
            </div>
            <nav className="flex flex-col gap-2 mt-8">
                <NavLink to="/dashboard" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                    <LayoutDashboard size={20} /> Dashboard
                </NavLink>
                <NavLink to="/trade" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                    <ArrowLeftRight size={20} /> Trade
                </NavLink>
                <NavLink to="/watchlist" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                    <Star size={20} /> Watchlist
                </NavLink>
                <NavLink to="/screener" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                    <Filter size={20} /> Screener
                </NavLink>
                {/* --- NEW LINK --- */}
                <NavLink to="/sentiment" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                    <Thermometer size={20} /> Sentiment
                </NavLink>
                <NavLink to="/transactions" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                    <History size={20} /> Transactions
                </NavLink>
                <NavLink to="/leaderboard" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                    <Trophy size={20} /> Leaderboard
                </NavLink>
                <NavLink to="/alerts" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                    <Bell size={20} /> Price Alerts
                </NavLink>
                <NavLink to="/achievements" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                    <Award size={20} /> Achievements
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;