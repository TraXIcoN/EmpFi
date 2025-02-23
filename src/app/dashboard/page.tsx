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
      className="bg-white rounded-lg shadow p-6 text-black"
    >
      <h3 className="text-xl font-bold mb-4">Portfolio Analysis</h3>
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
              className="flex-1 min-w-[150px] p-2 border rounded"
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
              className="w-32 p-2 border rounded"
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
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            Add Asset
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-xl font-bold mb-6">Portfolio Health</h3>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {["Risk Score", "Diversification", "Growth Potential"].map((metric) => (
        <div key={metric} className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">{metric}</div>
          <div className="text-2xl font-bold">
            {analysis[metric.toLowerCase().replace(" ", "_")]}%
          </div>
        </div>
      ))}
    </div>

    <div className="mb-6">
      <h4 className="font-semibold mb-3">Asset Allocation</h4>
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
      <h4 className="font-semibold mb-3">Recommended Reallocation</h4>
      <div className="space-y-2">
        {analysis.recommendations.map((rec, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm">{rec.asset}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">{rec.current}%</span>
              <span className="text-gray-400">→</span>
              <span
                className={`text-sm ${
                  rec.target > rec.current ? "text-green-600" : "text-red-600"
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
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold">Risk Analysis</h2>
      <span className="text-sm text-gray-500">
        Updated: {analysis.lastUpdated}
      </span>
    </div>

    <div className="mb-6">
      <div className="inline-block px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
        Risk Level: {analysis.riskLevel}
      </div>
      <p className="mt-4 text-gray-600">{analysis.summary}</p>
    </div>

    <div className="mb-6">
      <h3 className="font-semibold mb-3">Market Trends</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={analysis.marketTrends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>

    <div>
      <h3 className="font-semibold mb-3">Recommended Actions:</h3>
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
            <span className="text-gray-600">{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  </div>
);

// Alert Component
const AlertItem = ({ alert }: { alert: any }) => (
  <div
    className={`p-4 mb-3 rounded-lg border ${
      alert.severity === "high"
        ? "bg-red-50 border-red-200"
        : alert.severity === "medium"
        ? "bg-yellow-50 border-yellow-200"
        : "bg-blue-50 border-blue-200"
    }`}
  >
    <div className="flex items-center justify-between">
      <span
        className={`text-sm font-semibold ${
          alert.severity === "high"
            ? "text-red-700"
            : alert.severity === "medium"
            ? "text-yellow-700"
            : "text-blue-700"
        }`}
      >
        {alert.severity.toUpperCase()}
      </span>
      <span className="text-xs text-gray-500">{alert.timestamp}</span>
    </div>
    <p className="mt-2 text-sm text-gray-600">{alert.message}</p>
  </div>
);

// Historical Comparison Component
const HistoricalComparison = ({ comparison }: { comparison: any }) => (
  <div className="bg-white rounded-lg shadow p-6 text-black">
    <h2 className="text-xl font-bold mb-6">Historical Comparison</h2>
    <h3 className="text-lg font-semibold mb-4">{comparison.period}</h3>

    <div className="mb-6">
      <h4 className="font-medium mb-2">Similarities</h4>
      <ul className="space-y-2">
        {comparison.similarities.map((item: string, index: number) => (
          <li key={index} className="text-sm text-gray-600">
            • {item}
          </li>
        ))}
      </ul>
    </div>

    <div className="mb-6">
      <h4 className="font-medium mb-2">Differences</h4>
      <ul className="space-y-2">
        {comparison.differences.map((item: string, index: number) => (
          <li key={index} className="text-sm text-gray-600">
            • {item}
          </li>
        ))}
      </ul>
    </div>

    <div>
      <h4 className="font-medium mb-2">Key Lessons</h4>
      <ul className="space-y-2">
        {comparison.lessons.map((item: string, index: number) => (
          <li key={index} className="text-sm text-gray-600">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default function Dashboard() {
  const {
    alerts,
    riskAnalysis,
    historicalComparison,
    isLoading,
    fetchInitialData,
    portfolioAnalysis,
    setPortfolioAnalysis,
  } = useDashboardStore();

  useEffect(() => {
    fetchInitialData();

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

    return () => ws.close();
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
        {/* Left Panel - Alerts & Portfolio Input */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6 text-black">Active Alerts</h2>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
          <PortfolioInput onSubmit={handlePortfolioSubmit} />
        </div>

        {/* Middle Panel - Risk Analysis & Portfolio Analysis */}
        <div className="lg:col-span-6 space-y-6 text-black">
          {riskAnalysis && <RiskAnalysis analysis={riskAnalysis} />}
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
