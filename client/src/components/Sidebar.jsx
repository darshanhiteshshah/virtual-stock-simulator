import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { 
    LayoutDashboard, 
    TrendingUp, 
    Star, 
    History, 
    Bell, 
    Award, 
    Filter, 
    Gauge,
    Zap  // ← Add this
} from "lucide-react";

const Sidebar = () => {
    const { user } = useAuth();
    if (!user) return null;

    const linkClasses = "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium";
    const activeLinkClasses = "bg-blue-600 text-white shadow-lg shadow-blue-900/30";
    const inactiveLinkClasses = "text-slate-400 hover:text-white hover:bg-slate-800/50";

    return (
        <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-800/50">
                <h1 className="text-2xl font-bold text-white">VSM</h1>
                <p className="text-xs text-slate-500 mt-1">Virtual Stock Market</p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 p-4 flex-1">
                <NavLink 
                    to="/dashboard" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink 
                    to="/trade" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                    <TrendingUp size={20} />
                    <span>Trade</span>
                </NavLink>

                <NavLink 
                    to="/watchlist" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                    <Star size={20} />
                    <span>Watchlist</span>
                </NavLink>

                <NavLink 
                    to="/screener" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                    <Filter size={20} />
                    <span>Screener</span>
                </NavLink>

                <NavLink 
                    to="/sentiment" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                    <Gauge size={20} />
                    <span>Sentiment</span>
                </NavLink>

                {/* Divider */}
                <div className="my-3 border-t border-slate-800/50"></div>

                <NavLink 
                    to="/transactions" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                    <History size={20} />
                    <span>Transactions</span>
                </NavLink>

                <NavLink 
                    to="/alerts" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                    <Bell size={20} />
                    <span>Price Alerts</span>
                </NavLink>

                <NavLink 
                    to="/achievements" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                    <Award size={20} />
                    <span>Achievements</span>
                </NavLink>

                {/* Algo Trading Link - FIXED */}
                <NavLink 
                    to="/algo" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                    <Zap size={20} />
                    <span>Algo Trading</span>
                </NavLink>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800/50">
                <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Logged in as</p>
                    <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
