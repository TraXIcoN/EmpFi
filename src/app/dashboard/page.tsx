"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertsPanel } from "@/components/AlertsPanel";
import { HistoricalComparison } from "@/components/HistoricalComparison";
import { PortfolioChart } from "@/components/PortfolioChart";
import { MarketOverview } from "@/components/MarketOverview";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Loader } from "@/components/Loader";

interface MarketData {
  marketNews: any[];
  economicNews: any[];
  techNews: any[];
  timestamp: string;
}

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsRefreshing(true);
        const response = await fetch("/api/market-data");
        const data = await response.json();
        console.log("Fetched market data:", data); // Debug log
        setMarketData(data.current); // Access the current property from the response
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (isLoading || !marketData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Combine all news into one array with proper formatting
  const allNews = [
    ...(marketData.marketNews || []).map((news) => ({
      ...news,
      category: "market",
    })),
    ...(marketData.economicNews || []).map((news) => ({
      ...news,
      category: "economic",
    })),
    ...(marketData.techNews || []).map((news) => ({
      ...news,
      category: "tech",
    })),
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 ml-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">
          Welcome,{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            {user?.name || "Investor"}
          </span>
        </h1>
        <p className="text-gray-400">
          Last updated: {new Date(marketData.timestamp).toLocaleString()}
        </p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-md rounded-lg shadow-lg border border-white/10 p-6"
        >
          <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            Portfolio Analysis
          </h3>
          <PortfolioChart />
        </motion.div>

        {/* Market Overview */}
        <MarketOverview news={allNews} />

        {/* Custom Alerts */}
        <AlertsPanel />

        {/* Historical Comparison */}
        <HistoricalComparison />
      </div>
    </div>
  );
}
