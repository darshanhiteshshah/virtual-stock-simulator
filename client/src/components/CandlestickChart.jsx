import React from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Bar,
} from 'recharts';
import { formatCurrency } from '../utils/currencyFormatter';

// ✅ Corrected Custom Candlestick Shape
const Candlestick = (props) => {
    const { x, y, width, height, payload } = props;
    const { open, close, high, low } = payload;

    const isBullish = close >= open;
    const fill = isBullish ? '#22c55e' : '#ef4444';
    const stroke = isBullish ? '#16a34a' : '#dc2626';

    const chartHeight = props.height || 1;
    const minY = Math.min(open, close, high, low);
    const maxY = Math.max(open, close, high, low);

    const priceRange = maxY - minY;

    if (priceRange <= 0) {
        return (
            <line
                x1={x}
                y1={y}
                x2={x + width}
                y2={y}
                stroke={stroke}
                strokeWidth={1}
            />
        );
    }

    const scaleY = (val) => {
        return chartHeight * ((maxY - val) / priceRange);
    };

    const bodyY = y + scaleY(Math.max(open, close));
    const bodyHeight = Math.max(1, Math.abs(scaleY(open) - scaleY(close)));

    const wickTop = y + scaleY(high);
    const wickBottom = y + scaleY(low);

    return (
        <g>
            {/* Wick */}
            <line
                x1={x + width / 2}
                y1={wickTop}
                x2={x + width / 2}
                y2={wickBottom}
                stroke={stroke}
                strokeWidth={1}
            />
            {/* Body */}
            <rect
                x={x}
                y={bodyY}
                width={width}
                height={bodyHeight}
                fill={fill}
                stroke={stroke}
            />
        </g>
    );
};

const CandlestickChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500">
                No chart data available.
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-sm">
                    <p className="text-gray-400">{label}</p>
                    <p><span className="text-gray-500">O:</span> {formatCurrency(d.open)}</p>
                    <p><span className="text-gray-500">H:</span> {formatCurrency(d.high)}</p>
                    <p><span className="text-gray-500">L:</span> {formatCurrency(d.low)}</p>
                    <p><span className="text-gray-500">C:</span> {formatCurrency(d.close)}</p>
                </div>
            );
        }
        return null;
    };

    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const domainPadding = (maxPrice - minPrice) * 0.1;

    return (
        <div className="h-64 w-full mt-4">
            <ResponsiveContainer>
                <ComposedChart
                    data={data}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickFormatter={(str) =>
                            new Date(str).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                            })
                        }
                    />
                    <YAxis
                        domain={[minPrice - domainPadding, maxPrice + domainPadding]}
                        orientation="right"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickFormatter={(val) => `₹${val.toLocaleString()}`}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                    />
                    <Bar
                        dataKey="close" // dummy key to trigger rendering
                        barSize={6}
                        shape={<Candlestick />}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CandlestickChart;
