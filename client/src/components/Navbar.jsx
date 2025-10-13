import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        setUser(null);
        navigate("/");
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4 sticky top-0 z-50">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                {/* Logo */}
                <Link 
                    to={user ? "/dashboard" : "/"} 
                    className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
                >
                    VSM
                </Link>

                {/* Right Side Navigation */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setDropdownOpen(!dropdownOpen)} 
                                className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all duration-200"
                            >
                                <UserIcon size={18} className="text-slate-300" />
                                <span className="text-slate-200 text-sm font-medium">{user.username}</span>
                                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl rounded-lg shadow-2xl border border-slate-800/50 overflow-hidden">
                                    <Link 
                                        to="/profile" 
                                        onClick={() => setDropdownOpen(false)} 
                                        className="block px-4 py-3 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                                    >
                                        My Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-slate-800/50 hover:text-red-300 transition-colors border-t border-slate-800/50"
                                    >
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link 
                                to="/login" 
                                className="text-slate-300 hover:text-white font-medium transition-colors px-4 py-2"
                            >
                                Login
                            </Link>
                            <Link 
                                to="/register" 
                                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/20"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
