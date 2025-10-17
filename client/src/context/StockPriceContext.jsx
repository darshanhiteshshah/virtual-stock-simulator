import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { fetchAllStocks } from '../services/stockService';
import useAuth from '../hooks/useAuth';

const StockPriceContext = createContext();

export const StockPriceProvider = ({ children }) => {
    const { user } = useAuth();
    const [stockPrices, setStockPrices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        if (!user?.token) {
            setStockPrices([]);
            setIsLoading(false);
            return;
        }

        const fetchPrices = async () => {
            try {
                setIsLoading(true);
                
                console.log('🔄 Fetching fresh stock data from backend...');
                console.log('API URL:', import.meta.env.VITE_API_URL);
                
                // Force fresh fetch by adding cache-busting parameter
                const timestamp = Date.now();
                const stocks = await fetchAllStocks(user.token);
                
                console.log('📦 Received from backend:', stocks?.length, 'stocks');
                console.log('📊 First stock:', stocks?.[0]);
                console.log('💰 First stock price:', stocks?.[0]?.price);
                console.log('🏢 First stock exchange:', stocks?.[0]?.exchange);

                if (stocks?.[0]?.exchange === 'BSE') {
                    console.log('✅✅✅ RECEIVING YAHOO FINANCE DATA!');
                } else if (stocks?.[0]?.exchange === 'BSE (Mock)') {
                    console.error('❌ STILL RECEIVING MOCK DATA!');
                }

                if (isMounted.current && Array.isArray(stocks) && stocks.length > 0) {
                    // Sort by name
                    stocks.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    
                    setStockPrices(stocks);
                    setLastUpdated(new Date());
                    
                    console.log(`✅ Stock prices updated: ${stocks.length} stocks`);
                }
            } catch (error) {
                console.error("❌ Failed to fetch stock prices:", error);
            } finally {
                if (isMounted.current) {
                    setIsLoading(false);
                }
            }
        };

        // Initial fetch
        fetchPrices();

        // Auto-refresh every 2 minutes
        const intervalId = setInterval(fetchPrices, 120000);

        return () => clearInterval(intervalId);
    }, [user]);

    return (
        <StockPriceContext.Provider value={{ stockPrices, isLoading, lastUpdated }}>
            {children}
        </StockPriceContext.Provider>
    );
};

export const useStockPrices = () => {
    const context = useContext(StockPriceContext);
    if (!context) {
        throw new Error('useStockPrices must be used within StockPriceProvider');
    }
    return context;
};

export default StockPriceContext;
