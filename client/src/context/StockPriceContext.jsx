import React, { createContext, useContext, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { fetchAllStocks, fetchMultipleStockPrices } from '../services/stockService';

const StockPriceContext = createContext();

export const useStockPrices = () => useContext(StockPriceContext);

export const StockPriceProvider = ({ children }) => {
    const { user } = useAuth();
    const [stockPrices, setStockPrices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user?.token) {
            setStockPrices([]);
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        setIsLoading(true);

        const fetchPrices = async () => {
            try {
                const allStocks = await fetchAllStocks(user.token);

                if (isMounted && Array.isArray(allStocks) && allStocks.length > 0) {
                    const symbols = allStocks.map(s => s.symbol);
                    const prices = await fetchMultipleStockPrices(symbols, user.token);
                    
                    if (isMounted) {
                        prices.sort((a, b) => a.name.localeCompare(b.name));
                        setStockPrices(prices);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch stock prices for context:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchPrices();
        const intervalId = setInterval(fetchPrices, 3000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [user]); // Corrected: The effect should only re-run when the user logs in or out.

    const value = {
        stockPrices,
        isLoading,
    };

    return (
        <StockPriceContext.Provider value={value}>
            {children}
        </StockPriceContext.Provider>
    );
};
