import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;

async function fetchGoogleNews(query: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${query}&num=5&sort=date`
    );

    if (!response.ok) {
      throw new Error(`Google API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return (
      data.items?.map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link,
        source: item.displayLink || new URL(item.link).hostname,
        publishedTime:
          item.pagemap?.metatags?.[0]?.["article:published_time"] || null,
        sentiment: analyzeSentiment(item.title + " " + item.snippet),
      })) || []
    );
  } catch (error) {
    console.error(`Error fetching news for query "${query}":`, error);
    // Return placeholder data with real news sources
    return [
      {
        title: `Latest ${query} Updates`,
        snippet: "Unable to fetch latest news. Please try again later.",
        link: "https://www.reuters.com/markets/",
        source: "Reuters",
        publishedTime: new Date().toISOString(),
        sentiment: "neutral",
      },
    ];
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("market_data");

    // Fetch different types of news
    const [marketNews, economicNews, techNews] = await Promise.all([
      fetchGoogleNews("stock market news financial markets"),
      fetchGoogleNews("economic news inflation interest rates"),
      fetchGoogleNews("technology sector market news"),
    ]);

    const timestamp = new Date().toISOString();

    // Process and structure the data
    const marketData = {
      timestamp,
      marketNews: formatNewsResults(marketNews, "market"),
      economicNews: formatNewsResults(economicNews, "economic"),
      techNews: formatNewsResults(techNews, "tech"),
    };

    // Store in MongoDB
    await db.collection("market_updates").insertOne(marketData);

    // Get latest data for different time periods
    const latestUpdates = await db
      .collection("market_updates")
      .find({})
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    const historicalData = await db
      .collection("market_updates")
      .find({
        timestamp: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      })
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json({
      current: {
        marketNews: formatNewsResults(marketNews, "market"),
        economicNews: formatNewsResults(economicNews, "economic"),
        techNews: formatNewsResults(techNews, "tech"),
        timestamp,
      },
      historical: historicalData,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function formatNewsResults(data: any, category: string) {
  return (
    data.map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      source: item.source,
      publishedTime: item.publishedTime,
      sentiment: item.sentiment,
      category,
    })) || []
  );
}

function analyzeSentiment(text: string): string {
  const textLower = text.toLowerCase();

  const positiveWords = [
    "growth",
    "gain",
    "positive",
    "up",
    "rise",
    "surge",
    "boost",
    "recovery",
  ];
  const negativeWords = [
    "drop",
    "fall",
    "decline",
    "negative",
    "down",
    "loss",
    "crash",
    "crisis",
  ];

  let positiveScore = positiveWords.filter((word) =>
    textLower.includes(word)
  ).length;
  let negativeScore = negativeWords.filter((word) =>
    textLower.includes(word)
  ).length;

  if (positiveScore > negativeScore) return "positive";
  if (negativeScore > positiveScore) return "negative";
  return "neutral";
}
