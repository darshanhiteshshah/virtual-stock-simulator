import { 
    TrendingUp, 
    TrendingDown, 
    Target, 
    Activity,
    DollarSign,
    Percent,
    BarChart3,
    CheckCircle,
    XCircle
} from 'lucide-react';

const BacktestResults = ({ results }) => {
    if (!results) return null;

    const isProfit = parseFloat(results.totalReturn) > 0;
    const winRate = parseFloat(results.winRate);
    const profitFactor = parseFloat(results.profitFactor);

    const getWinRateColor = (rate) => {
        if (rate >= 60) return 'text-emerald-400 bg-emerald-900/30';
        if (rate >= 40) return 'text-orange-400 bg-orange-900/30';
        return 'text-red-400 bg-red-900/30';
    };

    const getProfitFactorColor = (pf) => {
        if (pf >= 2) return 'text-emerald-400';
        if (pf >= 1) return 'text-blue-400';
        return 'text-red-400';
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                    Backtest Results
                </h2>
                <div className="text-xs text-slate-500">
                    {results.backtestPeriod?.start && results.backtestPeriod?.end && (
                        <>
                            {new Date(results.backtestPeriod.start).toLocaleDateString()} - {' '}
                            {new Date(results.backtestPeriod.end).toLocaleDateString()}
                        </>
                    )}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Total Return */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                        <DollarSign className="w-3.5 h-3.5" />
                        Total Return
                    </div>
                    <div className={`text-2xl font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}{results.totalReturn}%
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        {isProfit ? 
                            <TrendingUp className="w-4 h-4 text-emerald-400" /> : 
                            <TrendingDown className="w-4 h-4 text-red-400" />
                        }
                        <span className="text-xs text-slate-400">Overall Performance</span>
                    </div>
                </div>

                {/* Win Rate */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                        <Target className="w-3.5 h-3.5" />
                        Win Rate
                    </div>
                    <div className="text-2xl font-bold">
                        <span className={getWinRateColor(winRate).split(' ')[0]}>
                            {results.winRate}%
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-full ${getWinRateColor(winRate).split(' ')[1]}`}
                                style={{ width: `${winRate}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Total Trades */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                        <Activity className="w-3.5 h-3.5" />
                        Total Trades
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {results.totalTrades}
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                        <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle className="w-3 h-3" />
                            {results.winningTrades}
                        </span>
                        <span className="text-slate-500">/</span>
                        <span className="flex items-center gap-1 text-red-400">
                            <XCircle className="w-3 h-3" />
                            {results.losingTrades}
                        </span>
                    </div>
                </div>

                {/* Profit Factor */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                        <Percent className="w-3.5 h-3.5" />
                        Profit Factor
                    </div>
                    <div className={`text-2xl font-bold ${getProfitFactorColor(profitFactor)}`}>
                        {results.profitFactor}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                        {profitFactor >= 2 ? 'Excellent' : profitFactor >= 1 ? 'Good' : 'Poor'}
                    </div>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/30 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-3 text-slate-300">Win Statistics</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Winning Trades:</span>
                            <span className="font-semibold text-emerald-400">{results.winningTrades}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Average Win:</span>
                            <span className="font-semibold text-emerald-400">₹{results.avgWin}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Win Rate:</span>
                            <span className="font-semibold text-emerald-400">{results.winRate}%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/30 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-3 text-slate-300">Loss Statistics</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Losing Trades:</span>
                            <span className="font-semibold text-red-400">{results.losingTrades}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Average Loss:</span>
                            <span className="font-semibold text-red-400">₹{results.avgLoss}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Loss Rate:</span>
                            <span className="font-semibold text-red-400">{(100 - winRate).toFixed(2)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Indicators */}
            <div className="bg-slate-800/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3 text-slate-300">Performance Analysis</h3>
                <div className="space-y-3">
                    {/* Win Rate Quality */}
                    <div>
                        <div className="flex justify-between mb-1 text-xs">
                            <span className="text-slate-400">Win Rate Quality</span>
                            <span className={getWinRateColor(winRate).split(' ')[0]}>
                                {winRate >= 60 ? 'Excellent' : winRate >= 40 ? 'Good' : 'Needs Improvement'}
                            </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                                className={`h-full rounded-full ${getWinRateColor(winRate).split(' ')[1]}`}
                                style={{ width: `${winRate}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Profit Factor Quality */}
                    <div>
                        <div className="flex justify-between mb-1 text-xs">
                            <span className="text-slate-400">Profit Factor</span>
                            <span className={getProfitFactorColor(profitFactor)}>
                                {profitFactor >= 2 ? 'Excellent' : profitFactor >= 1 ? 'Profitable' : 'Unprofitable'}
                            </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                                className={`h-full rounded-full ${profitFactor >= 2 ? 'bg-emerald-500' : profitFactor >= 1 ? 'bg-blue-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(profitFactor * 33.33, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Trade Activity */}
                    <div>
                        <div className="flex justify-between mb-1 text-xs">
                            <span className="text-slate-400">Trade Activity</span>
                            <span className="text-slate-300">
                                {results.totalTrades >= 30 ? 'High' : results.totalTrades >= 10 ? 'Medium' : 'Low'}
                            </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                                className="h-full rounded-full bg-purple-500"
                                style={{ width: `${Math.min((results.totalTrades / 50) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final Capital */}
            {results.finalCapital && (
                <div className="mt-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-slate-400 mb-1">Final Capital</div>
                            <div className="text-2xl font-bold text-white">
                                ₹{parseFloat(results.finalCapital).toLocaleString('en-IN')}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-400 mb-1">Starting: ₹1,00,000</div>
                            <div className={`text-lg font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isProfit ? '+' : ''}₹{(parseFloat(results.finalCapital) - 100000).toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            <div className="mt-6 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-2 text-blue-300">Recommendations</h3>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {winRate < 40 && <li>Consider adjusting entry/exit conditions to improve win rate</li>}
                    {profitFactor < 1 && <li className="text-red-400 font-semibold">⚠️ Strategy is unprofitable - Do not deploy live</li>}
                    {profitFactor >= 2 && <li className="text-emerald-400">✓ Strong profit factor - Strategy shows promise</li>}
                    {results.totalTrades < 10 && <li>Run longer backtest for more reliable results (current: {results.totalTrades} trades)</li>}
                    {results.totalTrades >= 30 && winRate >= 50 && <li className="text-emerald-400">✓ Sufficient trade data with good win rate</li>}
                </ul>
            </div>
        </div>
    );
};

export default BacktestResults;
