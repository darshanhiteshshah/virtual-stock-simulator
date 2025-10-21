import { useState, useEffect } from 'react';
import axios from 'axios';

const MarketStatus = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await axios.get('/api/market/status');
            setStatus(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch market status:', error);
            setLoading(false);
        }
    };

    if (loading) return null;

    return (
        <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg border ${
            status?.isOpen 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-gray-800/50 border-gray-700'
        }`}>
            {/* Status Indicator */}
            <div className="relative">
                {status?.isOpen ? (
                    <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                ) : (
                    <span className="inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                )}
            </div>

            {/* Status Text */}
            <div className="flex-1">
                <div className="flex items-center space-x-2">
                    <span className={`text-sm font-bold ${
                        status?.isOpen ? 'text-green-400' : 'text-gray-400'
                    }`}>
                        {status?.status || 'UNKNOWN'}
                    </span>
                    {status?.isPreMarket && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                            PRE-MARKET
                        </span>
                    )}
                </div>
                <div className="text-xs text-gray-500">
                    {status?.message || 'Market status unavailable'}
                </div>
            </div>

            {/* Current Time */}
            <div className="text-right">
                <div className="text-xs text-gray-400">IST</div>
                <div className="text-sm font-semibold text-gray-200">
                    {status?.currentTime || '--:--'}
                </div>
            </div>
        </div>
    );
};

export default MarketStatus;
