import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        setUser(null);
        navigate("/");
    };

    return (
        <nav className="bg-gray-900/50 text-gray-100 px-6 py-4 shadow-lg border-b border-gray-800">
            <div className="flex justify-between items-center max-w-full mx-auto">
                <Link to={user ? "/dashboard" : "/"} className="text-xl font-bold text-orange-400">
                    Virtual Stock Sim
                </Link>
                <div className="flex items-center gap-4 text-sm sm:text-base">
                    {user ? (
                        <div className="relative">
                            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 text-gray-300 hover:text-orange-400 transition-colors">
                                <span>{user.username}</span>
                                <UserIcon size={18} />
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-10">
                                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-gray-300 hover:bg-gray-700">My Profile</Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-gray-700"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-orange-300 transition">Login</Link>
                            <Link to="/register" className="bg-orange-500 hover:bg-orange-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
