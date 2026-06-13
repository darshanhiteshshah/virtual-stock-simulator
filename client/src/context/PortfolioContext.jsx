// import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
// import useAuth from "../hooks/useAuth";
// import { useStockPrices } from "./StockPriceContext";
// import { fetchPortfolio } from "../services/portfolioService";
// import Decimal from "decimal.js";

// const PortfolioContext = createContext();
// export const usePortfolio = () => useContext(PortfolioContext);

// export const PortfolioProvider = ({ children }) => {
//     const { user } = useAuth();
//     const { stockPrices } = useStockPrices();
//     const [holdings, setHoldings] = useState([]);
//     const [walletBalance, setWalletBalance] = useState(0);
//     const [isLoading, setIsLoading] = useState(true);

//     const refetchPortfolio = useCallback(async () => {
//         if (!user?.token) return;
//         try {
//             const res = await fetchPortfolio(user.token);
//             setHoldings(res.data.stocks || []);
//             setWalletBalance(res.data.walletBalance || 0);
//         } catch (error) {
//             console.error("Failed to refetch portfolio", error);
//         }
//     }, [user]);

//     useEffect(() => {
//         const fetchHoldings = async () => {
//             if (!user?.token) {
//                 setHoldings([]);
//                 setWalletBalance(0);
//                 setIsLoading(false);
//                 return;
//             }
//             setIsLoading(true);
//             try {
//                 const res = await fetchPortfolio(user.token);
//                 setHoldings(res.data.stocks || []);
//                 setWalletBalance(res.data.walletBalance || 0);
//             } catch (error) {
//                 console.error("Failed to fetch holdings", error);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         fetchHoldings();
//     }, [user]);

//     const portfolioWithLiveValues = useMemo(() => {
//         if (holdings.length === 0 || stockPrices.length === 0) {
//             return [];
//         }
        
//         const priceMap = new Map(stockPrices.map(stock => [stock.symbol, stock]));

//         return holdings.map(holding => {
//             const liveData = priceMap.get(holding.symbol);
//             if (!liveData) {
//                 return { 
//                     ...holding, 
//                     name: holding.symbol,
//                     sector: 'Other',
//                     currentPrice: '0.00',
//                     totalValue: 0, 
//                     profitLoss: 0, 
//                     dayChangePercent: 0 
//                 };
//             }

//             const currentPrice = new Decimal(liveData.price);
//             const changePercent = new Decimal(liveData.changePercent);
//             const quantity = new Decimal(holding.quantity);
//             const avgBuyPrice = new Decimal(holding.avgBuyPrice);

//             const totalValue = currentPrice.times(quantity);
//             const profitLoss = totalValue.minus(avgBuyPrice.times(quantity));
//             const dayChangePercent = changePercent.isZero() ? 0 : currentPrice.minus(changePercent).dividedBy(changePercent).times(100);

//             return {
//                 ...holding,
//                 name: liveData.name,
//                 sector: liveData.sector, // --- THIS LINE IS THE FIX ---
//                 currentPrice: currentPrice.toFixed(2),
//                 totalValue: totalValue.toNumber(),
//                 profitLoss: profitLoss.toNumber(),
//                 dayChangePercent: dayChangePercent.toNumber(),
//             };
//         });
//     }, [holdings, stockPrices]);

//     const value = {
//         portfolio: portfolioWithLiveValues,
//         walletBalance,
//         isLoading,
//         refetchPortfolio,
//     };

//     return (
//         <PortfolioContext.Provider value={value}>
//             {children}
//         </PortfolioContext.Provider>
//     );
// };


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
        if (!user || !user.token) return;

        try {
            const res = await fetchPortfolio(user.token);
            setHoldings(res.data.stocks || []);
            setWalletBalance(res.data.walletBalance || 0);
        } catch (error) {
            console.log("refetch error", error);
        }
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !user.token) {
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
                console.log("fetch error", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const portfolioWithLiveValues = useMemo(() => {
        if (holdings.length === 0 || stockPrices.length === 0) {
            return [];
        }

        const priceMap = new Map();

        for (let i = 0; i < stockPrices.length; i++) {
            priceMap.set(stockPrices[i].symbol, stockPrices[i]);
        }

        const result = [];

        for (let i = 0; i < holdings.length; i++) {
            const holding = holdings[i];
            const liveData = priceMap.get(holding.symbol);

            if (!liveData) {
                result.push({
                    ...holding,
                    name: holding.symbol,
                    sector: "Other",
                    currentPrice: "0.00",
                    totalValue: 0,
                    profitLoss: 0,
                    dayChangePercent: 0
                });
                continue;
            }

            const currentPrice = new Decimal(liveData.price || 0);
            const quantity = new Decimal(holding.quantity || 0);
            const avgBuyPrice = new Decimal(holding.avgBuyPrice || 0);

            const totalValue = currentPrice.times(quantity);
            const profitLoss = totalValue.minus(avgBuyPrice.times(quantity));

            // ✅ Correct usage (API already gives %)
            const dayChangePercent = Number(liveData.changePercent || 0);

            result.push({
                ...holding,
                name: liveData.name,
                sector: liveData.sector || "Other",
                currentPrice: currentPrice.toFixed(2),
                totalValue: totalValue.toNumber(),
                profitLoss: profitLoss.toNumber(),
                dayChangePercent: dayChangePercent
            });
        }

        return result;
    }, [holdings, stockPrices]);

    const value = {
        portfolio: portfolioWithLiveValues,
        walletBalance,
        isLoading,
        refetchPortfolio
    };

    return (
        <PortfolioContext.Provider value={value}>
            {children}
        </PortfolioContext.Provider>
    );
};