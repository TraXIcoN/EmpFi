import { NextResponse } from "next/server";

export async function GET() {
  // Mock alerts data
  const alerts = [
    {
      id: "1",
      severity: "high",
      message: "Unusual market volatility detected in tech sector",
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      severity: "medium",
      message: "Federal Reserve meeting outcomes may impact markets",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "3",
      severity: "low",
      message: "Minor fluctuations in commodity prices",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  return NextResponse.json(alerts);
}
