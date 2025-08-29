import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import StockTicker from "./StockTicker";
import NewsFeed from "./NewsFeed";
import useAuth from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { fetchNews } from "../services/newsService";

const Layout = () => {
    const { user } = useAuth();

    const [news, setNews] = useState([]);
    const [newsLoading, setNewsLoading] = useState(true);

    useEffect(() => {
        const loadNews = async () => {
            if (user?.token) {
                try {
                    const res = await fetchNews(user.token);
                    setNews(res.data);
                } catch (error) {
                    console.error("Failed to fetch news for ticker", error);
                } finally {
                    setNewsLoading(false);
                }
            }
        };
        loadNews();
    }, [user]);

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 overflow-hidden">
            {/* Sidebar */}
            {user && <Sidebar />}

            {/* Right section: navbar, tickers, main content */}
            <div className="flex flex-col flex-grow overflow-hidden">
                {/* Navbar at top */}
                <Navbar />

                {/* Stock ticker at top */}
                {user && <StockTicker />}

                {/* Main content (scrollable) */}
                <main className="flex-grow overflow-y-auto">
                    <Outlet />
                </main>

                {/* News ticker at bottom */}
                {user && <NewsFeed news={news} isLoading={newsLoading} />}
            </div>
        </div>
    );
};

export default Layout;
