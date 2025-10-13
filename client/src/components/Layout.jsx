import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import StockTicker from "./StockTicker";
import useAuth from "../hooks/useAuth";

const Layout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
            
            {/* Sidebar - only shown when user is logged in */}
            {user && <Sidebar />}
            
            {/* Main content area */}
            <div className="flex flex-col flex-grow overflow-hidden">
                <Navbar />
                
                {/* Stock ticker - only shown when user is logged in */}
                {user && <StockTicker />}
                
                {/* Main content with custom scrollbar */}
                <main className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
