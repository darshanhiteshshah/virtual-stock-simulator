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
        <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
            {/* Sidebar */}
            {user && <Sidebar />}

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Navbar */}
                <Navbar />

                {/* Stock Ticker */}
                {user && <StockTicker />}

                {/* Main Content (Scrollable) */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>

                {/* News Feed */}
                {user && <NewsFeed news={news} isLoading={newsLoading} />}
            </div>
        </div>
    );
};

export default Layout;
