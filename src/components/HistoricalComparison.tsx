"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Scenario {
  period: string;
  description: string;
  similarity: number;
  trend: string;
  volatility: number;
  sentiment: string;
  keyEvents: string[];
}

interface MarketConditions {
  summary: string;
  indicators: {
    marketTrend: string;
    volatility: number;
    sentiment: string;
  };
}

interface HistoricalData {
  scenarios: Scenario[];
  currentConditions: MarketConditions;
}

export function HistoricalComparison() {
  const [data, setData] = useState<HistoricalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/historical-scenarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        setData(result);
        if (result.scenarios.length > 0) {
          setSelectedScenario(result.scenarios[0]);
        }
      } catch (error) {
        console.error("Error fetching historical data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-black/40 backdrop-blur-md rounded-lg shadow-lg border border-white/10 p-6">
        <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Historical Analysis
        </h3>
        <div className="animate-pulse">
          <div className="h-24 bg-gray-700/50 rounded mb-4"></div>
          <div className="h-24 bg-gray-700/50 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-md rounded-lg shadow-lg border border-white/10 p-6"
    >
      <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
        Historical Analysis
      </h3>

      {/* Current Market Conditions */}
      <div className="mb-6 p-4 bg-black/20 rounded-md">
        <h4 className="font-semibold mb-2">Current Market Conditions</h4>
        <p className="text-gray-400 mb-3">{data.currentConditions.summary}</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-400">Trend</div>
            <div
              className={`font-semibold ${
                data.currentConditions.indicators.marketTrend === "bullish"
                  ? "text-green-400"
                  : data.currentConditions.indicators.marketTrend === "bearish"
                  ? "text-red-400"
                  : "text-yellow-400"
              }`}
            >
              {data.currentConditions.indicators.marketTrend}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Volatility</div>
            <div className="font-semibold">
              {Math.round(data.currentConditions.indicators.volatility * 100)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Sentiment</div>
            <div
              className={`font-semibold ${
                data.currentConditions.indicators.sentiment === "positive"
                  ? "text-green-400"
                  : data.currentConditions.indicators.sentiment === "negative"
                  ? "text-red-400"
                  : "text-yellow-400"
              }`}
            >
              {data.currentConditions.indicators.sentiment}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Scenarios */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {data.scenarios.map((scenario) => (
          <motion.button
            key={scenario.period}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedScenario(scenario)}
            className={`p-4 rounded-md text-left transition-colors ${
              selectedScenario?.period === scenario.period
                ? "bg-blue-500/20 border border-blue-500/50"
                : "bg-black/20 border border-white/10"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold">{scenario.period}</h4>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  scenario.similarity > 75
                    ? "bg-red-500/20 text-red-400"
                    : scenario.similarity > 50
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {scenario.similarity}% Similar
              </span>
            </div>
            <p className="text-sm text-gray-400">{scenario.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Selected Scenario Details */}
      <AnimatePresence mode="wait">
        {selectedScenario && (
          <motion.div
            key={selectedScenario.period}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-black/20 rounded-md"
          >
            <h4 className="font-semibold mb-3">Key Events</h4>
            <ul className="space-y-2">
              {selectedScenario.keyEvents.map((event, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-2"
                >
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-400">{event}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
