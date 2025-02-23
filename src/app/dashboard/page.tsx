"use client";

import { useEffect, useState } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import {
  LineChart,
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { MdRefresh } from "react-icons/md";

// Portfolio Input Form Component
const PortfolioInput = ({ onSubmit }) => {
  const [holdings, setHoldings] = useState([{ asset: "", allocation: "" }]);

  const addHolding = () => {
    setHoldings([...holdings, { asset: "", allocation: "" }]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-md rounded-lg shadow-lg border border-white/10 p-6"
    >
      <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
        Portfolio Analysis
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(holdings);
        }}
      >
        {holdings.map((holding, index) => (
          <div key={index} className="flex flex-wrap gap-4 mb-3">
            <input
              type="text"
              placeholder="Asset Name"
              className="flex-1 min-w-[150px] p-2 border border-purple-500/20 rounded bg-black/40 text-purple-200 placeholder-purple-400"
              value={holding.asset}
              onChange={(e) => {
                const newHoldings = [...holdings];
                newHoldings[index].asset = e.target.value;
                setHoldings(newHoldings);
              }}
            />
            <input
              type="number"
              placeholder="Allocation %"
              className="w-32 p-2 border border-purple-500/20 rounded bg-black/40 text-purple-200 placeholder-purple-400"
              value={holding.allocation}
              onChange={(e) => {
                const newHoldings = [...holdings];
                newHoldings[index].allocation = e.target.value;
                setHoldings(newHoldings);
              }}
            />
          </div>
        ))}
        <div className="flex flex-wrap gap-4 mt-4">
          <button
            type="button"
            onClick={addHolding}
            className="px-4 py-2 bg-black/40 border border-purple-500/20 text-purple-200 rounded hover:bg-purple-500/20 transition-colors"
          >
            Add Asset
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded hover:opacity-90 transition-opacity"
          >
            Analyze Portfolio
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// Portfolio Analysis Component
const PortfolioAnalysis = ({ analysis }) => (
  <div className="bg-black/40 backdrop-blur-md rounded-lg shadow-lg border border-white/10 p-6 text-white">
    <h3 className="text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
      Portfolio Health
    </h3>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {["Risk Score", "Diversification", "Growth Potential"].map((metric) => (
        <div
          key={metric}
          className="bg-black/40 border border-purple-500/20 p-4 rounded-lg"
        >
          <div className="text-sm text-purple-300 mb-1">{metric}</div>
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            {analysis[metric.toLowerCase().replace(" ", "_")]}%
          </div>
        </div>
      ))}
    </div>

    <div className="mb-6">
      <h4 className="font-semibold mb-3 text-purple-300">Asset Allocation</h4>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={analysis.allocation}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            label
          >
            {analysis.allocation.map((entry, index) => (
              <Cell key={index} fill={`hsl(${index * 45}, 70%, 50%)`} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>

    <div>
      <h4 className="font-semibold mb-3 text-purple-300">
        Recommended Reallocation
      </h4>
      <div className="space-y-2">
        {analysis.recommendations.map((rec, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-purple-200">{rec.asset}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-200">{rec.current}%</span>
              <span className="text-gray-400">→</span>
              <span
                className={`text-sm ${
                  rec.target > rec.current ? "text-green-400" : "text-red-400"
                }`}
              >
                {rec.target}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Enhanced Risk Analysis Component
const RiskAnalysis = ({ analysis }) => (
  <div className="bg-black/40 backdrop-blur-md rounded-lg shadow-lg border border-white/10 p-6 text-white">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
        Risk Analysis
      </h2>
      <span className="text-sm text-purple-300">
        Updated: {analysis.lastUpdated}
      </span>
    </div>

    <div className="mb-6">
      <div className="inline-block px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
        Risk Level: {analysis.riskLevel}
      </div>
      <p className="mt-4 text-purple-200">{analysis.summary}</p>
    </div>

    <div className="mb-6">
      <h3 className="font-semibold mb-3 text-purple-300">Market Trends</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={analysis.marketTrends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="url(#gradient)" />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>

    <div>
      <h3 className="font-semibold mb-3 text-purple-300">
        Recommended Actions:
      </h3>
      <ul className="space-y-2">
        {analysis.actionItems.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start"
          >
            <span className="mr-2">•</span>
            <span className="text-purple-200">{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  </div>
);

// Alert Component
const AlertItem = ({ alert }: { alert: any }) => (
  <div
    className={`p-4 mb-3 rounded-lg border bg-black/40 backdrop-blur-md ${
      alert.severity === "high"
        ? "border-red-500/50"
        : alert.severity === "medium"
        ? "border-yellow-500/50"
        : "border-blue-500/50"
    }`}
  >
    <div className="flex items-center justify-between">
      <span
        className={`text-sm font-semibold ${
          alert.severity === "high"
            ? "text-red-400"
            : alert.severity === "medium"
            ? "text-yellow-400"
            : "text-blue-400"
        }`}
      >
        {alert.severity.toUpperCase()}
      </span>
      <span className="text-xs text-purple-300">{alert.timestamp}</span>
    </div>
    <p className="mt-2 text-sm text-purple-200">{alert.message}</p>
  </div>
);

// Historical Comparison Component
const HistoricalComparison = ({ comparison }: { comparison: any }) => (
  <div className="bg-black/40 backdrop-blur-md rounded-lg shadow-lg border border-white/10 p-6 text-white">
    <h2 className="text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
      Historical Comparison
    </h2>
    <h3 className="text-lg font-semibold mb-4 text-purple-300">
      {comparison.period}
    </h3>

    <div className="mb-6">
      <h4 className="font-medium mb-2 text-purple-300">Similarities</h4>
      <ul className="space-y-2">
        {comparison.similarities.map((item: string, index: number) => (
          <li key={index} className="text-sm text-purple-200">
            • {item}
          </li>
        ))}
      </ul>
    </div>

    <div className="mb-6">
      <h4 className="font-medium mb-2 text-purple-300">Differences</h4>
      <ul className="space-y-2">
        {comparison.differences.map((item: string, index: number) => (
          <li key={index} className="text-sm text-purple-200">
            • {item}
          </li>
        ))}
      </ul>
    </div>

    <div>
      <h4 className="font-medium mb-2 text-purple-300">Key Lessons</h4>
      <ul className="space-y-2">
        {comparison.lessons.map((item: string, index: number) => (
          <li key={index} className="text-sm text-purple-200">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default function Dashboard() {
  const {
    alerts = [],
    riskAnalysis,
    historicalComparison,
    isLoading,
    fetchInitialData,
    portfolioAnalysis,
    setPortfolioAnalysis,
  } = useDashboardStore();

  const [marketData, setMarketData] = useState(null);
  const [isMarketDataLoading, setIsMarketDataLoading] = useState(true);

  const fetchMarketData = async () => {
    try {
      setIsMarketDataLoading(true);
      const response = await fetch("/api/market-data");
      if (!response.ok) throw new Error("Failed to fetch market data");

      const data = await response.json();
      console.log("Fetched market data:", data); // Debug log

      // Ensure we're not setting undefined values
      const store = useDashboardStore.getState();
      if (data.riskAnalysis) store.setRiskAnalysis(data.riskAnalysis);
      if (data.alerts) store.setAlerts(data.alerts);
      if (data.portfolioAnalysis)
        store.setPortfolioAnalysis(data.portfolioAnalysis);
      if (data.historicalComparison)
        store.setHistoricalComparison(data.historicalComparison);

      setMarketData(data);
    } catch (error) {
      console.error("Failed to fetch market data:", error);
    } finally {
      setIsMarketDataLoading(false);
    }
  };

  // Add this debug log
  useEffect(() => {
    console.log("Current store state:", {
      riskAnalysis,
      portfolioAnalysis,
      historicalComparison,
    });
  }, [riskAnalysis, portfolioAnalysis, historicalComparison]);

  useEffect(() => {
    fetchInitialData();
    fetchMarketData();

    const intervalId = setInterval(fetchMarketData, 60000); // Refresh every minute

    // Setup WebSocket connection for real-time alerts
    const ws = new WebSocket(
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000"
    );

    ws.onmessage = (event) => {
      const newAlert = JSON.parse(event.data);
      useDashboardStore
        .getState()
        .setAlerts([newAlert, ...alerts].slice(0, 10));
    };

    return () => {
      clearInterval(intervalId);
      ws.close();
    };
  }, []);

  const handlePortfolioSubmit = async (holdings) => {
    // Call your API to analyze the portfolio
    // Update the store with the results
    const response = await fetch("/api/portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(holdings),
    });

    const data = await response.json();
    setPortfolioAnalysis(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
        {/* Left Panel - Alerts & Portfolio Input */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-black/40 backdrop-blur-md rounded-lg shadow-lg border border-white/10 p-6">
            <h2 className="text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              Active Alerts
            </h2>
            <div className="space-y-4">
              {alerts?.length > 0 ? (
                alerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))
              ) : (
                <p className="text-white/60">No active alerts</p>
              )}
            </div>
          </div>
          <PortfolioInput onSubmit={handlePortfolioSubmit} />
        </div>

        {/* Middle Panel - Risk Analysis & Portfolio Analysis */}
        <div className="lg:col-span-6 space-y-6">
          {riskAnalysis && (
            <>
              <RiskAnalysis analysis={riskAnalysis} />
              <div className="mt-4 mb-6 flex justify-end">
                <button
                  onClick={fetchMarketData}
                  disabled={isMarketDataLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 text-white rounded hover:bg-black/60 transition-colors"
                >
                  <MdRefresh
                    className={`${isMarketDataLoading ? "animate-spin" : ""}`}
                  />
                  {isMarketDataLoading
                    ? "Refreshing..."
                    : "Refresh Market Data"}
                </button>
              </div>
            </>
          )}
          {portfolioAnalysis && (
            <PortfolioAnalysis analysis={portfolioAnalysis} />
          )}
        </div>

        {/* Right Panel - Historical Comparison */}
        <div className="lg:col-span-3">
          {historicalComparison && (
            <HistoricalComparison comparison={historicalComparison} />
          )}
        </div>
      </div>
    </div>
  );
}
