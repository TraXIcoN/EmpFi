"use client";

import { useState, useEffect } from "react";
import { MdShare, MdBookmark, MdBookmarkBorder } from "react-icons/md";
import AnimatedText from "@/components/AnimatedText";
import Image from "next/image";

interface Article {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  pubDate: string;
  source: {
    title: string;
  };
  marketImpact?: {
    spChange: number;
    techSectorChange: number;
    keyStocks: Array<{ name: string; change: number }>;
  };
}

function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMarketImpact, setShowMarketImpact] = useState<boolean>(false);
  const defaultImage =
    "https://placehold.co/600x400/000000/ffffff?text=THE+FINANCIAL+GAZETTE&font=playfair-display&pattern=bank&pattern_foreground_color=ffffff1a&pattern_background_color=000000";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/news`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }

        const data = await response.json();
        const enhancedArticles = data.articles.map((article: Article) => ({
          ...article,
          marketImpact: generateMarketImpact(article.description),
        }));
        setArticles(enhancedArticles || []);
      } catch (error) {
        console.error("Error loading news:", error);
        setError("Failed to load news articles");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const generateMarketImpact = (description: string) => {
    const sentiment = analyzeSentiment(description);
    return {
      spChange:
        sentiment === "positive" ? 2.5 : sentiment === "negative" ? -2.5 : 0,
      techSectorChange:
        sentiment === "positive" ? 7.2 : sentiment === "negative" ? -3.2 : 1.0,
      keyStocks: [
        { name: "NVDA", change: sentiment === "positive" ? 12.7 : -5.2 },
        { name: "JPM", change: sentiment === "positive" ? 5.2 : -8.3 },
      ],
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading news...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black/40 backdrop-blur-sm py-6">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-8 border-b-2 border-gray-800 pb-4">
          <h1 className="font-serif text-5xl mb-2 text-white">
            The Financial Gazette
          </h1>
          <div className="text-sm font-sans text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-px border border-gray-800">
          {Array.isArray(articles) && articles.length > 0 ? (
            articles.map((article, index) => (
              <article
                key={index}
                className={`bg-black/60 backdrop-blur-sm p-4 border border-gray-800 ${
                  index === 0
                    ? "col-span-full md:col-span-4 row-span-2"
                    : index === 1
                    ? "col-span-full md:col-span-2 row-span-2"
                    : "col-span-full md:col-span-2"
                }`}
              >
                {(article.imageUrl || index === 0) &&
                  (index === 0 || index === 1) && (
                    <div className="relative w-full h-48 mb-4 overflow-hidden">
                      <Image
                        src={article.imageUrl || defaultImage}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                <div className="flex justify-between items-start mb-3">
                  <h2
                    className={`font-serif text-white ${
                      index === 0
                        ? "text-3xl leading-tight"
                        : "text-xl leading-snug"
                    }`}
                  >
                    <AnimatedText text={article.title} delay={40} />
                  </h2>
                  <div className="flex space-x-1">
                    <button className="p-1 hover:bg-gray-800 text-gray-400">
                      <MdBookmarkBorder size={16} />
                    </button>
                    <button className="p-1 hover:bg-gray-800 text-gray-400">
                      <MdShare size={16} />
                    </button>
                  </div>
                </div>

                <p
                  className={`font-garamond text-base mb-4 text-gray-300 ${
                    index === 0 ? "columns-2 gap-6" : ""
                  }`}
                >
                  <AnimatedText text={article.description} delay={20} />
                </p>

                {article.marketImpact && (
                  <div className="space-y-2 text-sm border-t border-gray-800 pt-3">
                    <h3 className="font-playfair italic text-gray-400 flex items-center justify-between">
                      Market Impact
                      <button
                        onClick={() => setShowMarketImpact(!showMarketImpact)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        {showMarketImpact ? "Hide Details" : "Show Details"}
                      </button>
                    </h3>
                    {showMarketImpact && (
                      <div className="space-y-2 mt-2">
                        <p className="flex justify-between">
                          <span>S&P 500:</span>
                          <span
                            className={
                              article.marketImpact.spChange > 0
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {article.marketImpact.spChange > 0 ? "+" : ""}
                            {article.marketImpact.spChange}%
                          </span>
                        </p>
                        {article.marketImpact.keyStocks.map((stock, i) => (
                          <p key={i} className="flex justify-between">
                            <span>{stock.name}:</span>
                            <span
                              className={
                                stock.change > 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }
                            >
                              {stock.change > 0 ? "+" : ""}
                              {stock.change}%
                            </span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 text-sm border-t border-gray-800 pt-3">
                  <h3 className="font-playfair italic text-gray-400">
                    Sector Impact:
                  </h3>
                  <p className="text-gray-300">
                    {generateImpact("finance", article.description)}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-4 text-xs border-t border-gray-800 pt-2">
                  <span className="italic text-gray-400">
                    {new Date(article.pubDate).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-0.5 border border-gray-800 text-gray-300">
                    {analyzeSentiment(article.description)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full p-4 text-center text-gray-400">
              No news articles available at the moment.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function generateImpact(sector: string, text: string): string {
  const keywords = {
    tech: ["technology", "digital", "software", "AI", "cyber"],
    finance: ["market", "investment", "stock", "economy", "financial"],
    retail: ["consumer", "sales", "store", "shopping", "retail"],
  };

  const sectorKeywords = keywords[sector as keyof typeof keywords];
  const words = text.toLowerCase().split(" ");
  const hasKeywords = sectorKeywords.some((keyword) =>
    words.includes(keyword.toLowerCase())
  );

  if (hasKeywords) {
    return `Significant impact expected in ${sector} sector based on market trends.`;
  }
  return `Limited impact expected in ${sector} sector.`;
}

function analyzeSentiment(text: string): "positive" | "negative" | "neutral" {
  const positiveWords = ["growth", "increase", "positive", "gain", "recovery"];
  const negativeWords = ["decline", "decrease", "negative", "loss", "crisis"];

  const words = text.toLowerCase().split(" ");
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach((word) => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

export default NewsPage;
