"use client";

import { useState, useEffect } from "react";
import { MdShare, MdBookmark, MdBookmarkBorder } from "react-icons/md";
import AnimatedText from "@/components/AnimatedText";
import { fetchNewsArticles, fetchArticleImage } from "@/utils/newsApi";
import Image from "next/image";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  image?: string;
  impact: {
    tech: string;
    finance: string;
    retail: string;
  };
  sentiment: "positive" | "negative" | "neutral";
  timestamp: string;
  saved?: boolean;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/news?sector=${selectedSector}`);
        const newsData = await response.json();

        if (!response.ok) throw new Error("Failed to fetch news");

        setArticles(newsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching news:", error);
        setIsLoading(false);
      }
    }

    fetchNews();
  }, [selectedSector]);

  const toggleSave = (articleId: string) => {
    setArticles(
      articles.map((article) =>
        article.id === articleId
          ? { ...article, saved: !article.saved }
          : article
      )
    );
  };

  const shareArticle = (article: NewsArticle) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 text-black ml-20">
      <div className="border-b border-black py-2 mb-6">
        <p className="text-sm uppercase tracking-wider">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <h1 className="text-center font-playfair text-6xl md:text-7xl mb-8 border-b-2 border-black pb-4">
        Financial Intelligence
      </h1>

      <div className="flex justify-center space-x-2 mb-8 border-y border-black py-2">
        {["All", "Tech", "Finance", "Retail"].map((sector) => (
          <button
            key={sector}
            onClick={() => setSelectedSector(sector.toLowerCase())}
            className={`px-4 py-1 text-sm border border-black
              ${
                selectedSector === sector.toLowerCase()
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
          >
            {sector}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-px border border-black">
          {articles.map((article, index) => (
            <article
              key={article.id}
              className={`bg-white p-4 border border-black
                ${index === 0 ? "md:col-span-4 md:row-span-2" : "md:col-span-2"}
              `}
            >
              {article.image && (index === 0 || index === 5) && (
                <div className="relative w-full h-48 mb-4 overflow-hidden rounded">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex justify-between items-start mb-3">
                <h2
                  className={`font-playfair ${
                    index === 0
                      ? "text-3xl leading-tight"
                      : "text-xl leading-snug"
                  }`}
                >
                  <AnimatedText text={article.title} delay={40} />
                </h2>
                <div className="flex space-x-1">
                  <button
                    onClick={() => toggleSave(article.id)}
                    className="p-1 hover:bg-gray-100"
                  >
                    {article.saved ? (
                      <MdBookmark size={16} />
                    ) : (
                      <MdBookmarkBorder size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => shareArticle(article)}
                    className="p-1 hover:bg-gray-100"
                  >
                    <MdShare size={16} />
                  </button>
                </div>
              </div>

              <p
                className={`font-garamond text-base mb-4 ${
                  index === 0 ? "columns-2 gap-6" : ""
                }`}
              >
                <AnimatedText text={article.summary} delay={20} />
              </p>

              <div className="space-y-2 text-sm border-t border-black pt-3">
                <h3 className="font-playfair italic">Sector Impact:</h3>
                {Object.entries(article.impact).map(([sector, impact]) => (
                  <div key={sector} className="grid grid-cols-[80px,1fr] gap-2">
                    <span className="font-medium">{sector}:</span>
                    <span>{impact}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4 text-xs border-t border-black pt-2">
                <span className="italic">
                  {new Date(article.timestamp).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span
                  className={`px-2 py-0.5 border border-black ${
                    article.sentiment === "negative"
                      ? "bg-black text-white"
                      : "bg-white"
                  }`}
                >
                  {article.sentiment}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
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
