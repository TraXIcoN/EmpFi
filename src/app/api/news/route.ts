import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://your-api-url";

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/market-news/latest`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch news" },
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
