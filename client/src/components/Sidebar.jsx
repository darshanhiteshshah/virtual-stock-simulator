import { useState } from "react";
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
    Zap,
    Newspaper,
    ChevronLeft,
    Menu,
    X
} from "lucide-react";

const Sidebar = () => {
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    if (!user) return null;

    const linkClasses = "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium group relative";
    const activeLinkClasses = "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/30";
    const inactiveLinkClasses = "text-slate-400 hover:text-white hover:bg-slate-800/80";

    const navigationItems = [
        { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/trade", icon: TrendingUp, label: "Trade" },
        { to: "/watchlist", icon: Star, label: "Watchlist" },
        { to: "/screener", icon: Filter, label: "Screener" },
        { to: "/sentiment", icon: Gauge, label: "Sentiment" },
    ];

    const secondaryItems = [
        { to: "/transactions", icon: History, label: "Transactions" },
        { to: "/alerts", icon: Bell, label: "Price Alerts" },
        { to: "/news", icon: Newspaper, label: "Market News" },
        { to: "/achievements", icon: Award, label: "Achievements" },
        { to: "/algo", icon: Zap, label: "Algo Trading" },
    ];

    return (
        <>
            {/* Mobile Menu Button - Fixed Position */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 rounded-lg text-white border border-slate-800 shadow-lg"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside 
                className={`
                    ${isCollapsed ? 'w-20' : 'w-64'} 
                    bg-gradient-to-b from-slate-900 to-slate-950 
                    border-r border-slate-800/50 
                    flex flex-col 
                    transition-all duration-300 ease-in-out
                    h-screen
                    fixed lg:relative
                    z-40
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-800/50 flex items-center justify-between flex-shrink-0">
                    {!isCollapsed && (
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                                VSM
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">Virtual Stock Market</p>
                        </div>
                    )}
                    
                    {isCollapsed && (
                        <div className="mx-auto">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">V</span>
                            </div>
                        </div>
                    )}

                    {/* Toggle Button - Desktop Only */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft 
                            size={18} 
                            className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>

                {/* Navigation - Scrollable */}
                <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
                    {/* Primary Navigation */}
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink 
                                key={item.to}
                                to={item.to} 
                                className={({ isActive }) => 
                                    `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                                }
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <Icon size={20} className="flex-shrink-0" />
                                {!isCollapsed && <span>{item.label}</span>}
                                
                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-xl border border-slate-700 transition-opacity z-50">
                                        {item.label}
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}

                    {/* Divider */}
                    <div className="my-3 border-t border-slate-800/50"></div>

                    {/* Secondary Navigation */}
                    {secondaryItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink 
                                key={item.to}
                                to={item.to} 
                                className={({ isActive }) => 
                                    `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                                }
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <Icon size={20} className="flex-shrink-0" />
                                {!isCollapsed && <span>{item.label}</span>}
                                
                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-xl border border-slate-700 transition-opacity z-50">
                                        {item.label}
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer - User Info */}
                <div className="p-4 border-t border-slate-800/50 flex-shrink-0">
                    {!isCollapsed ? (
                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg p-3 border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-1">Logged in as</p>
                            <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                            <div className="flex items-center space-x-1 mt-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-xs text-green-400">Online</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold border-2 border-blue-500/30 relative group">
                                {user.username.charAt(0).toUpperCase()}
                                <div className="absolute w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full bottom-0 right-0"></div>
                                
                                {/* Tooltip */}
                                <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-xl border border-slate-700 transition-opacity z-50">
                                    {user.username}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
