import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const state = searchParams.get("state");
    const metric = searchParams.get("metric") || "total_population";

    // Construct the query URL
    let queryUrl = `${API_BASE_URL}/census/counties?metric=${metric}`;
    if (year) queryUrl += `&year=${year}`;
    if (state) queryUrl += `&state=${state}`;

    const response = await fetch(queryUrl);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch census data" },
      { status: 500 }
    );
  }
}

// Get available metrics
export async function POST(request: Request) {
  try {
    const response = await fetch(`${API_BASE_URL}/census/metrics`);
    const metricsData = await response.json();

    const yearsResponse = await fetch(`${API_BASE_URL}/census/years`);
    const yearsData = await yearsResponse.json();

    const statesResponse = await fetch(`${API_BASE_URL}/census/states`);
    const statesData = await statesResponse.json();

    return NextResponse.json({
      metrics: metricsData.metrics,
      years: yearsData.years,
      states: statesData.states,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}
