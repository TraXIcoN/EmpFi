import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;

async function fetchMarketConditions() {
  try {
    // Fetch current market indicators
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=current market conditions S&P500 Dow NASDAQ&num=5`
    );
    const data = await response.json();

    // Extract key market indicators from search results
    const marketConditions = {
      summary: data.items?.[0]?.snippet || "",
      indicators: {
        marketTrend: extractMarketTrend(data.items || []),
        volatility: calculateVolatility(data.items || []),
        sentiment: analyzeSentiment(data.items || []),
      },
    };

    return marketConditions;
  } catch (error) {
    console.error("Error fetching market conditions:", error);
    return null;
  }
}

function calculateSimilarity(historical: any, current: any) {
  if (!current) return 0;

  let score = 0;
  const weights = {
    marketTrend: 0.4,
    volatility: 0.3,
    sentiment: 0.3,
  };

  // Compare market trends
  if (historical.trend === current.indicators.marketTrend) {
    score += weights.marketTrend;
  }

  // Compare volatility
  if (Math.abs(historical.volatility - current.indicators.volatility) < 0.2) {
    score += weights.volatility;
  }

  // Compare sentiment
  if (historical.sentiment === current.indicators.sentiment) {
    score += weights.sentiment;
  }

  return Math.round(score * 100);
}

export async function POST(request: Request) {
  try {
    const currentConditions = await fetchMarketConditions();

    const historicalScenarios = [
      {
        period: "2008 Financial Crisis",
        description:
          "Global financial crisis triggered by the housing market collapse",
        trend: "bearish",
        volatility: 0.8,
        sentiment: "negative",
        keyEvents: [
          "Banking sector collapse",
          "Housing market crash",
          "Global market selloff",
        ],
      },
      {
        period: "2020 COVID-19 Crash",
        description: "Market volatility due to global pandemic uncertainty",
        trend: "volatile",
        volatility: 0.9,
        sentiment: "negative",
        keyEvents: [
          "Global lockdowns",
          "Economic shutdown",
          "Rapid policy response",
        ],
      },
      {
        period: "2000 Dot-com Bubble",
        description: "Tech stock bubble burst following internet boom",
        trend: "bearish",
        volatility: 0.7,
        sentiment: "negative",
        keyEvents: [
          "Tech valuations collapse",
          "Internet company failures",
          "Growth stock selloff",
        ],
      },
      {
        period: "2022 Tech Selloff",
        description: "Major correction in technology stocks amid rising rates",
        trend: "bearish",
        volatility: 0.6,
        sentiment: "negative",
        keyEvents: [
          "Interest rate hikes",
          "Tech sector correction",
          "Growth to value rotation",
        ],
      },
    ];

    // Calculate similarity scores
    const scenariosWithSimilarity = historicalScenarios.map((scenario) => ({
      ...scenario,
      similarity: calculateSimilarity(scenario, currentConditions),
    }));

    // Sort by similarity
    const sortedScenarios = scenariosWithSimilarity.sort(
      (a, b) => b.similarity - a.similarity
    );

    return NextResponse.json({
      scenarios: sortedScenarios,
      currentConditions,
    });
  } catch (error) {
    console.error("Error generating scenarios:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function extractMarketTrend(items: any[]): string {
  const text = items
    .map((item) => item.snippet)
    .join(" ")
    .toLowerCase();
  if (text.includes("bull") || text.includes("rally") || text.includes("gains"))
    return "bullish";
  if (
    text.includes("bear") ||
    text.includes("decline") ||
    text.includes("losses")
  )
    return "bearish";
  return "neutral";
}

function calculateVolatility(items: any[]): number {
  const text = items
    .map((item) => item.snippet)
    .join(" ")
    .toLowerCase();
  if (text.includes("high volatility") || text.includes("sharp moves"))
    return 0.8;
  if (text.includes("volatile") || text.includes("uncertainty")) return 0.6;
  return 0.3;
}

function analyzeSentiment(items: any[]): string {
  const text = items
    .map((item) => item.snippet)
    .join(" ")
    .toLowerCase();

  const positiveWords = [
    "growth",
    "gain",
    "positive",
    "up",
    "rise",
    "surge",
    "boost",
  ];
  const negativeWords = [
    "drop",
    "fall",
    "decline",
    "negative",
    "down",
    "loss",
    "crash",
  ];

  let positiveCount = positiveWords.filter((word) =>
    text.includes(word)
  ).length;
  let negativeCount = negativeWords.filter((word) =>
    text.includes(word)
  ).length;

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}
