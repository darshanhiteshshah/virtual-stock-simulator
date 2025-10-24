import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://virtual-stock-simulator.onrender.com';

const MarketStatus = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const calculateLocalStatus = useCallback(() => {
        // Fallback: Calculate market status locally using IST
        const now = new Date();
        const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        
        const hours = istTime.getHours();
        const minutes = istTime.getMinutes();
        const currentTime = hours * 100 + minutes;
        const day = istTime.getDay();
        
        const isWeekend = day === 0 || day === 6;
        const isMarketHours = currentTime >= 915 && currentTime <= 1530;
        const isPreMarket = currentTime >= 900 && currentTime < 915;
        const isPostMarket = currentTime > 1530 && currentTime < 1600;
        
        const timeString = istTime.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        
        let statusInfo = {
            isOpen: false,
            status: 'CLOSED',
            message: 'Market is closed',
            currentTime: timeString,
            isPreMarket: false
        };
        
        if (isWeekend) {
            statusInfo.message = 'Market closed (Weekend)';
            statusInfo.status = 'WEEKEND';
        } else if (isPreMarket) {
            statusInfo.status = 'PRE_MARKET';
            statusInfo.message = 'Opening at 9:15 AM';
            statusInfo.isPreMarket = true;
        } else if (isMarketHours) {
            statusInfo.isOpen = true;
            statusInfo.status = 'OPEN';
            statusInfo.message = 'Market is open';
        } else if (isPostMarket) {
            statusInfo.status = 'POST_MARKET';
            statusInfo.message = 'Post-market hours';
        } else if (currentTime < 900) {
            statusInfo.status = 'PRE_MARKET';
            statusInfo.message = 'Market opens at 9:15 AM';
        }
        
        return statusInfo;
    }, []);

    const fetchStatus = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/api/stocks/market-status`);
            
            // If we get a valid response with status
            if (response.data && response.data.status && response.data.status !== 'UNKNOWN') {
                setStatus(response.data);
            } else {
                // Fallback to local calculation
                setStatus(calculateLocalStatus());
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch market status:', error);
            // Fallback to local calculation on error
            setStatus(calculateLocalStatus());
            setLoading(false);
        }
    }, [calculateLocalStatus]);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [fetchStatus]);

    if (loading) {
        return (
            <div className="flex items-center space-x-3 px-4 py-2 rounded-lg border bg-slate-800/30 border-slate-700/50 animate-pulse">
                <div className="h-3 w-3 bg-slate-700 rounded-full"></div>
                <div className="flex-1">
                    <div className="h-4 bg-slate-700 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-slate-700 rounded w-32"></div>
                </div>
            </div>
        );
    }

    const getStatusColor = () => {
        if (status?.isOpen) return 'green';
        if (status?.status === 'PRE_MARKET' || status?.isPreMarket) return 'yellow';
        return 'red';
    };

    const statusColor = getStatusColor();

    return (
        <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg border ${
            statusColor === 'green'
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : statusColor === 'yellow'
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-slate-800/50 border-slate-700/50'
        }`}>
            {/* Status Indicator */}
            <div className="relative">
                {status?.isOpen ? (
                    <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                ) : status?.isPreMarket || status?.status === 'PRE_MARKET' ? (
                    <span className="flex h-3 w-3">
                        <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                    </span>
                ) : (
                    <span className="inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                )}
            </div>

            {/* Status Text */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                    {status?.isOpen ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-bold truncate ${
                        status?.isOpen 
                            ? 'text-emerald-400' 
                            : status?.isPreMarket || status?.status === 'PRE_MARKET'
                            ? 'text-yellow-400'
                            : 'text-slate-400'
                    }`}>
                        {status?.status?.replace('_', ' ') || 'UNKNOWN'}
                    </span>
                </div>
                <div className="text-xs text-slate-500 truncate">
                    {status?.message || 'Checking status...'}
                </div>
            </div>

            {/* Current Time */}
            <div className="text-right flex-shrink-0">
                <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>IST</span>
                </div>
                <div className="text-sm font-semibold text-slate-200">
                    {status?.currentTime || new Date().toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'Asia/Kolkata'
                    })}
                </div>
            </div>
        </div>
    );
};

export default MarketStatus;
