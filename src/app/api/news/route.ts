import { NextResponse } from "next/server";
import dbConnect from "@/utils/mongodb";
import NewsArticle from "@/models/NewsArticle";
import { fetchNewsArticles, fetchArticleImage } from "@/utils/newsApi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get("sector") || "all";

  try {
    await dbConnect();

    // Try to get cached articles from MongoDB first
    let articles = await NewsArticle.find({
      sector:
        sector === "all" ? { $in: ["tech", "finance", "retail"] } : sector,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    })
      .sort({ createdAt: -1 })
      .limit(6);

    // If no recent articles found, fetch new ones
    if (articles.length < 6) {
      const newsData = await fetchNewsArticles(
        sector === "all" ? "finance" : sector
      );

      const processedArticles = await Promise.all(
        newsData.slice(0, 6).map(async (article: any, index: number) => {
          // Fetch images for first and sixth articles
          const imageUrl =
            index === 0 || index === 5
              ? await fetchArticleImage(article.title)
              : null;

          const newsArticle = new NewsArticle({
            title: article.title,
            summary: article.description,
            image: imageUrl,
            sector: sector,
            impact: {
              tech: generateImpact("tech", article.description),
              finance: generateImpact("finance", article.description),
              retail: generateImpact("retail", article.description),
            },
            sentiment: analyzeSentiment(article.description),
            timestamp: article.publishedAt || new Date(),
          });

          await newsArticle.save();
          return newsArticle;
        })
      );

      articles = processedArticles;
    }

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error processing news:", error);
    return NextResponse.json(
      { error: "Error processing news" },
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
