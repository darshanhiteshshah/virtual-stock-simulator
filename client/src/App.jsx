import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";

// Layout and Page Imports
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Trade from "./pages/Trade";
import TransactionHistory from "./pages/TransactionHistory";
import Leaderboard from "./pages/Leaderboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Watchlist from "./pages/Watchlist";
import Profile from "./pages/Profile";
import Sentiment from "./pages/Sentiment";
import Alerts from "./pages/Alerts"; 
import Achievements from "./pages/Achievements"; 
import Screener from "./pages/Screener";
import StockProfilePage from "./pages/StockProfilePage";

// This is a simple wrapper component that adds a fade-in animation to any page.
const PageWrapper = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.4 }}
    >
        {children}
    </motion.div>
);

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes - These do not use the main Layout */}
                <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
                <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />

                {/* Protected Routes - These are wrapped in the Layout and ProtectedRoute */}
                <Route 
                    path="/dashboard" 
                    element={<ProtectedRoute><Layout><PageWrapper><Dashboard /></PageWrapper></Layout></ProtectedRoute>} 
                />
                <Route 
                    path="/stock/:symbol" 
                    element={<ProtectedRoute><Layout><PageWrapper><StockProfilePage /></PageWrapper></Layout></ProtectedRoute>} 
                />
                <Route 
                    path="/trade" 
                    element={<ProtectedRoute><Layout><PageWrapper><Trade /></PageWrapper></Layout></ProtectedRoute>} 
                />
                <Route 
                    path="/transactions" 
                    element={<ProtectedRoute><Layout><PageWrapper><TransactionHistory /></PageWrapper></Layout></ProtectedRoute>} 
                />
                <Route 
                    path="/leaderboard" 
                    element={<ProtectedRoute><Layout><PageWrapper><Leaderboard /></PageWrapper></Layout></ProtectedRoute>} 
                />
                <Route 
                    path="/screener" 
                    element={<ProtectedRoute><Layout><PageWrapper><Screener /></PageWrapper></Layout></ProtectedRoute>} 
                />
                <Route 
                    path="/watchlist" 
                    element={<ProtectedRoute><Layout><PageWrapper><Watchlist /></PageWrapper></Layout></ProtectedRoute>} 
                />
                <Route 
                    path="/profile" 
                    element={<ProtectedRoute><Layout><PageWrapper><Profile /></PageWrapper></Layout></ProtectedRoute>} 
                />
                <Route 
                    path="/sentiment" 
                    element={<ProtectedRoute><Layout><PageWrapper><Sentiment /></PageWrapper></Layout></ProtectedRoute>} 
                />
                <Route 
                    path="/alerts" 
                    element={<ProtectedRoute><Layout><PageWrapper><Alerts /></PageWrapper></Layout></ProtectedRoute>} 
                />
                <Route 
                    path="/achievements" 
                    element={<ProtectedRoute><Layout><PageWrapper><Achievements /></PageWrapper></Layout></ProtectedRoute>} 
                />
            </Routes>
        </Router>
    );
}

export default App;
