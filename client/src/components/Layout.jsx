import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import StockTicker from "./StockTicker";
import useAuth from "../hooks/useAuth";

const Layout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 overflow-hidden">
            
            {/* The sidebar is only rendered when a user is logged in */}
            {user && <Sidebar />}
            
            {/* This container holds the main content and grows to fill available space */}
            <div className="flex flex-col flex-grow overflow-hidden">
                <Navbar />
                
                {/* The stock ticker is also conditionally rendered for logged-in users */}
                {user && <StockTicker />}
                
                {/* The main content area fills the remaining vertical space and becomes scrollable if needed */}
                <main className="flex-grow p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
