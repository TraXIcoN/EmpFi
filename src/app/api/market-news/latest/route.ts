import { NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;

export async function GET() {
  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=stock market news financial markets&num=6&sort=date`
    );

    const data = await response.json();

    // Transform Google search results into our format
    const insights = data.items.map((item: any) => ({
      title: item.title,
      summary: item.snippet,
      sentiment: determineSentiment(item.snippet), // Simple sentiment analysis
      link: item.link,
    }));

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Error fetching market news:", error);
    return NextResponse.json({ insights: [] }, { status: 500 });
  }
}

function determineSentiment(text: string): string {
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

  const textLower = text.toLowerCase();
  let positiveCount = positiveWords.filter((word) =>
    textLower.includes(word)
  ).length;
  let negativeCount = negativeWords.filter((word) =>
    textLower.includes(word)
  ).length;

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}
