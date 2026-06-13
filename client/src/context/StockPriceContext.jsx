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
        if (stockPrices.length === 0) {
            setIsLoading(true);
        }

        const stocks = await fetchAllStocks(user.token);

        if (stocks?.[0]?.source === 'UPSTOX') {
            console.log('✅ LIVE Upstox data received');
        }

        if (isMounted.current && Array.isArray(stocks) && stocks.length > 0) {
            stocks.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            setStockPrices(stocks);
            setLastUpdated(new Date());
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
