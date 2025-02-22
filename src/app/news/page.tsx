"use client";

import { useState, useEffect } from "react";
import { MdShare, MdBookmark, MdBookmarkBorder } from "react-icons/md";
import AnimatedText from "@/components/AnimatedText";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
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
    const mockArticles: NewsArticle[] = [
      {
        id: "1",
        title: "Early Signs of Stagflation Emerge in US Economy",
        summary:
          "Recent economic indicators suggest the US economy might be heading towards stagflation, a period characterized by high inflation and stagnant growth.",
        impact: {
          tech: "Tech companies might face reduced consumer spending and higher operational costs.",
          finance:
            "Financial institutions should prepare for potential interest rate volatility.",
          retail:
            "Retail sector may experience decreased consumer confidence and spending.",
        },
        sentiment: "negative",
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        title: "AI Startup Funding Reaches Record Heights",
        summary:
          "Venture capital investments in AI startups have hit an all-time high this quarter, with particular focus on generative AI applications.",
        impact: {
          tech: "Increased competition and innovation in the AI sector expected.",
          finance: "VCs shifting portfolios towards AI-focused investments.",
          retail:
            "More AI-powered customer service solutions becoming available.",
        },
        sentiment: "positive",
        timestamp: new Date().toISOString(),
      },
      {
        id: "3",
        title: "Global Supply Chain Shows Signs of Recovery",
        summary:
          "Major shipping routes report decreased delays and normalized container prices, indicating potential improvements in global trade efficiency.",
        impact: {
          tech: "Hardware manufacturers can expect more predictable delivery times.",
          finance: "Reduced logistics costs may improve corporate profits.",
          retail: "Better inventory management and reduced stockout risks.",
        },
        sentiment: "positive",
        timestamp: new Date().toISOString(),
      },
      {
        id: "4",
        title: "Central Banks Signal Shift in Monetary Policy",
        summary:
          "Multiple central banks hint at potential policy changes in response to evolving economic conditions and inflation metrics.",
        impact: {
          tech: "Startup funding environment may become more challenging.",
          finance: "Bond markets likely to see increased volatility.",
          retail: "Consumer lending rates may be affected.",
        },
        sentiment: "neutral",
        timestamp: new Date().toISOString(),
      },
      {
        id: "5",
        title: "E-commerce Giants Face New Regulatory Challenges",
        summary:
          "Lawmakers propose stricter oversight of online marketplaces, focusing on consumer protection and fair competition.",
        impact: {
          tech: "Platform companies may need to modify their business models.",
          finance: "Investment strategies in tech sector require reassessment.",
          retail: "Smaller retailers might gain competitive advantages.",
        },
        sentiment: "negative",
        timestamp: new Date().toISOString(),
      },
    ];

    setArticles(mockArticles);
    setIsLoading(false);
  }, []);

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
    <div className="min-h-screen bg-white p-4 text-black">
      {/* Date Header */}
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

      {/* Masthead */}
      <h1 className="text-center font-playfair text-6xl md:text-7xl mb-8 border-b-2 border-black pb-4">
        Financial Intelligence
      </h1>

      {/* Section Navigation */}
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

      {/* News Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-px border border-black">
          {articles.map((article, index) => (
            <article
              key={article.id}
              className={`bg-white p-4 border border-black
                ${index === 0 ? "md:col-span-4 md:row-span-2" : "md:col-span-2"}
              `}
            >
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
