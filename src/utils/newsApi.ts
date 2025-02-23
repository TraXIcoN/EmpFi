const GOOGLE_NEWS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_NEWS_API_KEY;
const GOOGLE_SEARCH_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY;
const SEARCH_ENGINE_ID = process.env.NEXT_PUBLIC_SEARCH_ENGINE_ID;
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

interface NewsArticle {
  title: string;
  link: string;
  description: string;
  imageUrl?: string;
  pubDate: string;
  source: {
    title: string;
  };
}

interface SimulatedNewsArticle {
  title: string;
  description: string;
  pubDate: string;
  source: {
    title: string;
  };
}

export async function fetchNewsArticles(topic: string = "finance news") {
  try {
    if (!GOOGLE_SEARCH_API_KEY || !SEARCH_ENGINE_ID) {
      console.error("Search API key or Engine ID is missing");
      return getMockNews();
    }

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?` +
        `key=${GOOGLE_SEARCH_API_KEY}` +
        `&cx=${SEARCH_ENGINE_ID}` +
        `&q=${encodeURIComponent(topic)}` +
        `&num=10` + // Number of results
        `&dateRestrict=d1` + // Last 24 hours
        `&sort=date` // Sort by date
    );

    if (!response.ok) {
      console.error(
        `Search API error: ${response.status} - ${response.statusText}`
      );
      return getMockNews();
    }

    const data = await response.json();

    // Transform Google Search results into our news format
    const articles: NewsArticle[] =
      data.items?.map((item: any) => ({
        title: item.title,
        link: item.link,
        description: item.snippet,
        imageUrl:
          item.pagemap?.cse_image?.[0]?.src ||
          item.pagemap?.imageobject?.[0]?.url,
        pubDate:
          item.pagemap?.newsarticle?.[0]?.datepublished ||
          new Date().toISOString(),
        source: {
          title: item.displayLink || "News Source",
        },
      })) || [];

    return articles;
  } catch (error) {
    console.error("Error fetching news:", error);
    return getMockNews();
  }
}

function getMockNews(): NewsArticle[] {
  return [
    {
      title: "Global Markets Show Strong Recovery",
      description:
        "Major indices across the world demonstrate resilience as tech sector leads the rally. Investors remain optimistic about economic outlook despite challenges.",
      link: "#",
      pubDate: new Date().toISOString(),
      source: {
        title: "Market Insights",
      },
    },
    {
      title: "Tech Innovation Drives Market Growth",
      description:
        "Emerging technologies and AI developments continue to shape market trends. Leading companies announce breakthrough developments.",
      link: "#",
      pubDate: new Date().toISOString(),
      source: {
        title: "Tech Review",
      },
    },
    {
      title: "Sustainable Investments Gain Momentum",
      description:
        "ESG-focused investments see record inflows as investors prioritize sustainable business practices and green energy initiatives.",
      link: "#",
      pubDate: new Date().toISOString(),
      source: {
        title: "Green Finance",
      },
    },
    {
      title: "Central Banks Signal Policy Shift",
      description:
        "Global monetary policies adapt to changing economic conditions. Markets respond to new interest rate projections.",
      link: "#",
      pubDate: new Date().toISOString(),
      source: {
        title: "Economic Times",
      },
    },
    {
      title: "Retail Sector Shows Resilience",
      description:
        "Consumer spending patterns indicate strong economic recovery. Major retailers report better-than-expected earnings.",
      link: "#",
      pubDate: new Date().toISOString(),
      source: {
        title: "Business Daily",
      },
    },
    {
      title: "Emerging Markets Present Opportunities",
      description:
        "Developing economies show promising growth potential. Investors look for diversification in international markets.",
      link: "#",
      pubDate: new Date().toISOString(),
      source: {
        title: "Global Markets",
      },
    },
  ];
}

export async function fetchArticleImage(query: string) {
  try {
    if (!GOOGLE_SEARCH_API_KEY || !SEARCH_ENGINE_ID) {
      return null;
    }

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?` +
        `key=${GOOGLE_SEARCH_API_KEY}` +
        `&cx=${SEARCH_ENGINE_ID}` +
        `&q=${encodeURIComponent(query)}` +
        `&searchType=image` +
        `&num=1`
    );

    const data = await response.json();
    return data.items?.[0]?.link;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

async function generateNewsWithGemini(marketContext: any) {
  try {
    if (!marketContext || typeof marketContext !== "object") {
      console.error("Invalid market context provided:", marketContext);
      return null;
    }

    const prompt = `Generate a realistic financial news article based on the following market context:
      - Current Portfolio Performance: ${
        marketContext.portfolioValue || "Unknown"
      }
      - Market Trend: ${marketContext.marketTrend || "Neutral"}
      - Risk Level: ${marketContext.riskLevel || "Medium"}
      - Key Events: ${
        Array.isArray(marketContext.events)
          ? marketContext.events.join(", ")
          : "None"
      }
      
      Format the response as a JSON object with the following structure:
      {
        "title": "News headline here",
        "description": "Detailed news article here",
        "source": {
          "title": "Financial News Source Name"
        }
      }`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ text: prompt }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response format from Gemini API");
    }

    const generatedContent = JSON.parse(
      data.candidates[0].content.parts[0].text
    );

    return {
      ...generatedContent,
      pubDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error generating news with Gemini:", error);
    return {
      title: "Market Update",
      description: "Markets continue to move based on global economic factors.",
      pubDate: new Date().toISOString(),
      source: {
        title: "Market Simulator News",
      },
    };
  }
}

export async function simulateNewsStream(
  marketContext: any,
  interval: number = 60000
) {
  let isActive = true;

  const stopStream = () => {
    isActive = false;
  };

  const generateNews = async () => {
    while (isActive) {
      const article = await generateNewsWithGemini(marketContext);
      if (article) {
        // Emit the article to the client (you'll need to implement this based on your frontend setup)
        // Could use WebSocket, Server-Sent Events, or polling
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  };

  generateNews();
  return stopStream;
}
