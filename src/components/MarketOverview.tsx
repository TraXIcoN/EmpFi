"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NewsItem {
  title: string;
  snippet: string;
  link: string;
  source: string;
  publishedTime?: string | null;
  sentiment: string;
  category: string;
}

interface MarketOverviewProps {
  news: NewsItem[];
}

export function MarketOverview({ news }: MarketOverviewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [displayedNews, setDisplayedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Updated placeholder news with real sources
  const placeholderNews = [
    {
      title: "Market Rally Continues as Tech Stocks Lead Gains",
      snippet:
        "Major indices show strong performance with technology sector leading the way. AI-related stocks continue to attract investor attention.",
      link: "https://www.bloomberg.com/markets",
      source: "Bloomberg",
      publishedTime: new Date().toISOString(),
      sentiment: "positive",
      category: "market",
    },
    {
      title: "Federal Reserve Signals Rate Decision Impact",
      snippet:
        "Central bank's latest policy meeting suggests a cautious approach to future rate adjustments as inflation data remains key focus.",
      link: "https://www.wsj.com/news/markets",
      source: "Wall Street Journal",
      publishedTime: new Date().toISOString(),
      sentiment: "neutral",
      category: "economic",
    },
    {
      title: "Tech Innovation Drives Market Momentum",
      snippet:
        "Breakthrough developments in quantum computing and AI applications continue to shape market trends.",
      link: "#",
      source: "TechCrunch",
      publishedTime: new Date().toISOString(),
      sentiment: "positive",
      category: "tech",
    },
  ];

  useEffect(() => {
    console.log("MarketOverview mounted");
    console.log("Initial news prop:", news);
    console.log("Initial loading state:", loading);

    try {
      // Use placeholder data if no news is provided
      const newsToUse = news?.length > 0 ? news : placeholderNews;

      setDisplayedNews(
        selectedCategory === "all"
          ? newsToUse
          : newsToUse.filter((item) => item.category === selectedCategory)
      );
      setLoading(false);
    } catch (error) {
      console.error("Error in MarketOverview effect:", error);
    }
  }, [selectedCategory, news]);

  const categories = ["all", "market", "economic", "tech"];

  // Always show debug info in development
  const showDebugInfo = process.env.NODE_ENV === "development" || loading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-md rounded-lg shadow-lg border border-white/10 p-6"
    >
      <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
        Market Overview
      </h3>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              console.log("Category selected:", category);
              setSelectedCategory(category);
            }}
            className={`px-4 py-2 rounded-md capitalize whitespace-nowrap ${
              selectedCategory === category
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {category}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-700/50 rounded animate-pulse"
              ></div>
            ))}
          </motion.div>
        ) : displayedNews.length > 0 ? (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {displayedNews.map((item, index) => (
              <motion.div
                key={`${item.title}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-black/20 rounded-md hover:bg-black/30 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold mb-2 flex-1">{item.title}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded ml-2 ${
                      item.category === "market"
                        ? "bg-blue-500/20 text-blue-300"
                        : item.category === "economic"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-purple-500/20 text-purple-300"
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{item.snippet}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span
                      className={`text-sm ${
                        item.sentiment === "positive"
                          ? "text-green-400"
                          : item.sentiment === "negative"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {item.sentiment}
                    </span>
                    <span className="text-sm text-gray-500">{item.source}</span>
                    {item.publishedTime && (
                      <span className="text-sm text-gray-500">
                        {new Date(item.publishedTime).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <span>Read more</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No news available for this category.
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
