import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { fetchSentimentData } from '../services/sentimentService';
import { Thermometer, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper function to map a sentiment score (-1 to 1) to a color
const getSentimentColor = (score) => {
    if (score > 0.6) return 'bg-green-600';
    if (score > 0.2) return 'bg-green-800';
    if (score < -0.6) return 'bg-red-600';
    if (score < -0.2) return 'bg-red-800';
    return 'bg-gray-700';
};

const Sentiment = () => {
    const { user } = useAuth();
    const [sentimentData, setSentimentData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSentiment = async () => {
            if (user?.token) {
                try {
                    const res = await fetchSentimentData(user.token);
                    setSentimentData(res.data);
                } catch (error) {
                    console.error("Failed to fetch sentiment data", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadSentiment();
    }, [user]);

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-3xl font-bold text-orange-400 mb-6 flex items-center gap-3">
                <Thermometer /> Market Sentiment Analysis
            </h1>

            {/* Heatmap */}
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800 mb-8">
                <div className="grid grid-cols-4 gap-2 text-center text-sm font-semibold text-gray-300 mb-4">
                    <div>Sector</div>
                    <div>Retail</div>
                    <div>FII</div>
                    <div>DII</div>
                </div>
                <div className="space-y-2">
                    {isLoading ? [...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-800 rounded-lg animate-pulse"></div>) :
                        sentimentData.map((data, index) => (
                            <motion.div 
                                key={data.sector}
                                className="grid grid-cols-4 gap-2 items-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="text-left font-semibold text-blue-300 p-3">{data.sector}</div>
                                <div className={`p-3 rounded-lg text-white ${getSentimentColor(data.retailSentiment)}`}>
                                    {data.retailSentiment > 0.2 ? 'Bullish' : data.retailSentiment < -0.2 ? 'Bearish' : 'Neutral'}
                                </div>
                                <div className={`p-3 rounded-lg text-white ${getSentimentColor(data.fiiSentiment)}`}>
                                     {data.fiiSentiment > 0.2 ? 'Bullish' : data.fiiSentiment < -0.2 ? 'Bearish' : 'Neutral'}
                                </div>
                                <div className={`p-3 rounded-lg text-white ${getSentimentColor(data.diiSentiment)}`}>
                                     {data.diiSentiment > 0.2 ? 'Bullish' : data.diiSentiment < -0.2 ? 'Bearish' : 'Neutral'}
                                </div>
                            </motion.div>
                        ))
                    }
                </div>
            </div>

            {/* AI Buzz Section */}
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800">
                 <h2 className="text-2xl font-bold text-orange-400 mb-4 flex items-center gap-2">
                    <MessageSquare /> AI-Generated Buzz
                </h2>
                <div className="space-y-4">
                     {isLoading ? <div className="h-20 bg-gray-800 rounded-lg animate-pulse"></div> :
                        sentimentData.map((data) => (
                            <div key={data.sector} className="text-gray-400 text-sm">
                                <strong className="text-cyan-400">{data.sector}:</strong> {data.buzz}
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default Sentiment;
