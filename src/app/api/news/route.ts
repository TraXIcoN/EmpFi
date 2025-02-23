import { NextResponse } from "next/server";
import dbConnect from "@/utils/mongodb";
import NewsArticle from "@/models/NewsArticle";
import { fetchNewsArticles, fetchArticleImage } from "@/utils/newsApi";
const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(request: Request) {
  try {
    // Get the sector from URL params
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get("sector") || "all";

    // Fetch news articles
    const newsData = await fetchNewsArticles(sector);

    // Check if newsData exists and is an array
    if (!Array.isArray(newsData)) {
      console.error("Invalid news data received:", newsData);
      return NextResponse.json({ articles: [] }, { status: 200 });
    }

    const processedArticles = await Promise.all(
      newsData.slice(0, 6).map(async (article: any, index: number) => {
        // Fetch images for first and sixth articles
        const imageUrl =
          index === 0 || index === 5
            ? await fetchArticleImage(article.title)
            : null;

        return {
          ...article,
          imageUrl,
        };
      })
    );

    return NextResponse.json({ articles: processedArticles }, { status: 200 });
  } catch (error) {
    console.error("Error processing news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news articles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { keywords } = await request.json();
    const response = await fetch(`${API_BASE_URL}/market-news`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords }),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
