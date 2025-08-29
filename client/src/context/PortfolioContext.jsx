import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import { useStockPrices } from "./StockPriceContext";
import { fetchPortfolio } from "../services/portfolioService";
import Decimal from "decimal.js";

const PortfolioContext = createContext();
export const usePortfolio = () => useContext(PortfolioContext);

export const PortfolioProvider = ({ children }) => {
    const { user } = useAuth();
    const { stockPrices } = useStockPrices();
    const [holdings, setHoldings] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const refetchPortfolio = useCallback(async () => {
        if (!user?.token) return;
        try {
            const res = await fetchPortfolio(user.token);
            setHoldings(res.data.stocks || []);
            setWalletBalance(res.data.walletBalance || 0);
        } catch (error) {
            console.error("Failed to refetch portfolio", error);
        }
    }, [user]);

    useEffect(() => {
        const fetchHoldings = async () => {
            if (!user?.token) {
                setHoldings([]);
                setWalletBalance(0);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const res = await fetchPortfolio(user.token);
                setHoldings(res.data.stocks || []);
                setWalletBalance(res.data.walletBalance || 0);
            } catch (error) {
                console.error("Failed to fetch holdings", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHoldings();
    }, [user]);

    const portfolioWithLiveValues = useMemo(() => {
        if (holdings.length === 0 || stockPrices.length === 0) {
            return [];
        }
        
        const priceMap = new Map(stockPrices.map(stock => [stock.symbol, stock]));

        return holdings.map(holding => {
            const liveData = priceMap.get(holding.symbol);
            if (!liveData) {
                return { 
                    ...holding, 
                    name: holding.symbol,
                    sector: 'Other',
                    currentPrice: '0.00',
                    totalValue: 0, 
                    profitLoss: 0, 
                    dayChangePercent: 0 
                };
            }

            const currentPrice = new Decimal(liveData.price);
            const previousClose = new Decimal(liveData.previousClose);
            const quantity = new Decimal(holding.quantity);
            const avgBuyPrice = new Decimal(holding.avgBuyPrice);

            const totalValue = currentPrice.times(quantity);
            const profitLoss = totalValue.minus(avgBuyPrice.times(quantity));
            const dayChangePercent = previousClose.isZero() ? 0 : currentPrice.minus(previousClose).dividedBy(previousClose).times(100);

            return {
                ...holding,
                name: liveData.name,
                sector: liveData.sector, // --- THIS LINE IS THE FIX ---
                currentPrice: currentPrice.toFixed(2),
                totalValue: totalValue.toNumber(),
                profitLoss: profitLoss.toNumber(),
                dayChangePercent: dayChangePercent.toNumber(),
            };
        });
    }, [holdings, stockPrices]);

    const value = {
        portfolio: portfolioWithLiveValues,
        walletBalance,
        isLoading,
        refetchPortfolio,
    };

    return (
        <PortfolioContext.Provider value={value}>
            {children}
        </PortfolioContext.Provider>
    );
};
