import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;

async function fetchGoogleNews(query: string) {
  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${query}&num=5&sort=date`
  );
  return await response.json();
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
    data.items?.map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      sentiment: analyzeSentiment(item.title + " " + item.snippet),
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
