import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.SEARCH_ENGINE_ID}&q=breaking market news alerts&num=5&sort=date`
    );

    const data = await response.json();

    const alerts =
      data.items?.map((item: any, index: number) => ({
        id: `alert-${Date.now()}-${index}`,
        type: determineAlertType(item.snippet),
        title: item.title,
        message: item.snippet,
        timestamp: new Date().toISOString(),
      })) || [];

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json({ alerts: [] }, { status: 500 });
  }
}

function determineAlertType(text: string): "info" | "warning" | "critical" {
  const textLower = text.toLowerCase();

  const criticalWords = ["crash", "crisis", "collapse", "plunge"];
  const warningWords = ["decline", "drop", "fall", "risk", "concern"];

  if (criticalWords.some((word) => textLower.includes(word))) return "critical";
  if (warningWords.some((word) => textLower.includes(word))) return "warning";
  return "info";
}
