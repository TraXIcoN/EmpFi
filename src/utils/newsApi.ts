const GOOGLE_NEWS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_NEWS_API_KEY;
const GOOGLE_SEARCH_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY;
const SEARCH_ENGINE_ID = process.env.NEXT_PUBLIC_SEARCH_ENGINE_ID;

interface GoogleNewsArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: {
    title: string;
  };
}

export async function fetchNewsArticles(topic: string = "finance") {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${topic}&language=en&sortBy=publishedAt&apiKey=${GOOGLE_NEWS_API_KEY}`
    );
    const data = await response.json();
    return data.articles;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export async function fetchArticleImage(query: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${query}&searchType=image&num=1`
    );
    const data = await response.json();
    return data.items?.[0]?.link;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}
