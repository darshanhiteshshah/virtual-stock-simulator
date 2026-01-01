import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { TrendingUp, Activity } from 'lucide-react';

const AdvancedStockChart = ({ data, symbol }) => {
    const chartContainerRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [indicators, setIndicators] = useState({
        sma20: true,
        sma50: false,
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!data || data.length === 0 || !chartContainerRef.current) {
            return;
        }

        try {
            // Clear any existing chart
            if (chartInstanceRef.current) {
                chartInstanceRef.current.remove();
                chartInstanceRef.current = null;
            }

            // Create new chart
            const chart = createChart(chartContainerRef.current, {
                width: chartContainerRef.current.clientWidth,
                height: 400,
                layout: {
                    background: { color: '#0f172a' },
                    textColor: '#94a3b8',
                },
                grid: {
                    vertLines: { color: '#1e293b' },
                    horzLines: { color: '#1e293b' },
                },
                crosshair: {
                    mode: 1,
                },
                rightPriceScale: {
                    borderColor: '#334155',
                },
                timeScale: {
                    borderColor: '#334155',
                    timeVisible: true,
                },
            });

            chartInstanceRef.current = chart;

            // Add candlestick series
            const candlestickSeries = chart.addCandlestickSeries({
                upColor: '#10b981',
                downColor: '#ef4444',
                borderVisible: false,
                wickUpColor: '#10b981',
                wickDownColor: '#ef4444',
            });

            // Format data
            const formattedData = data.map(d => ({
                time: Math.floor(new Date(d.date).getTime() / 1000),
                open: parseFloat(d.open),
                high: parseFloat(d.high),
                low: parseFloat(d.low),
                close: parseFloat(d.close),
            })).sort((a, b) => a.time - b.time);

            candlestickSeries.setData(formattedData);

            // Add SMA 20
            if (indicators.sma20 && formattedData.length >= 20) {
                const sma20Series = chart.addLineSeries({
                    color: '#3b82f6',
                    lineWidth: 2,
                });

                const sma20Data = calculateSMA(formattedData, 20);
                sma20Series.setData(sma20Data);
            }

            // Add SMA 50
            if (indicators.sma50 && formattedData.length >= 50) {
                const sma50Series = chart.addLineSeries({
                    color: '#f59e0b',
                    lineWidth: 2,
                });

                const sma50Data = calculateSMA(formattedData, 50);
                sma50Series.setData(sma50Data);
            }

            // Add Volume
            const volumeSeries = chart.addHistogramSeries({
                color: '#64748b',
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: '',
                scaleMargins: {
                    top: 0.8,
                    bottom: 0,
                },
            });

            const volumeData = data.map(d => ({
                time: Math.floor(new Date(d.date).getTime() / 1000),
                value: d.volume || 1000000,
                color: d.close >= d.open ? '#10b98155' : '#ef444455',
            })).sort((a, b) => a.time - b.time);

            volumeSeries.setData(volumeData);

            chart.timeScale().fitContent();

            // Handle resize
            const handleResize = () => {
                if (chartContainerRef.current && chartInstanceRef.current) {
                    chartInstanceRef.current.applyOptions({
                        width: chartContainerRef.current.clientWidth,
                    });
                }
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.remove();
                    chartInstanceRef.current = null;
                }
            };

        } catch (err) {
            console.error('Chart initialization error:', err);
            setError('Failed to initialize chart. Please try refreshing.');
        }
    }, [data, indicators]);

    const calculateSMA = (data, period) => {
        const smaData = [];
        for (let i = period - 1; i < data.length; i++) {
            const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
            smaData.push({
                time: data[i].time,
                value: sum / period,
            });
        }
        return smaData;
    };

    const toggleIndicator = (indicator) => {
        setIndicators(prev => ({
            ...prev,
            [indicator]: !prev[indicator]
        }));
    };

    if (error) {
        return (
            <div className="h-96 flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800/50">
                <div className="text-center">
                    <Activity className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <p className="text-red-400 mb-2">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-96 flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800/50">
                <div className="text-center">
                    <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No chart data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-4 border border-slate-800/50">
                <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">{symbol} - Advanced</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => toggleIndicator('sma20')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            indicators.sma20 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                        SMA 20
                    </button>
                    <button
                        onClick={() => toggleIndicator('sma50')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            indicators.sma50 
                                ? 'bg-orange-600 text-white' 
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                        SMA 50
                    </button>
                </div>
            </div>

            {/* Chart Container */}
            <div 
                ref={chartContainerRef} 
                className="w-full bg-slate-900/50 rounded-xl border border-slate-800/50 p-4"
                style={{ height: '400px' }}
            />

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs bg-slate-900/30 rounded-lg p-3">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                    <span className="text-slate-400">Bullish</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-slate-400">Bearish</span>
                </div>
                {indicators.sma20 && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-blue-500"></div>
                        <span className="text-slate-400">SMA 20</span>
                    </div>
                )}
                {indicators.sma50 && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-orange-500"></div>
                        <span className="text-slate-400">SMA 50</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedStockChart;
