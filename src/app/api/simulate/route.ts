import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const params = await request.json();

  // Mock scenarios - Replace with actual AI logic
  const scenarios = [
    {
      id: "1",
      riskLevel: "Low",
      projectedProfit: 5.2,
      strategy: "Focus on defensive stocks and government bonds",
      description:
        "Conservative scenario with stable returns under current conditions.",
    },
    {
      id: "2",
      riskLevel: "Medium",
      projectedProfit: 8.7,
      strategy:
        "Balanced portfolio with tech growth stocks and corporate bonds",
      description: "Moderate growth scenario with calculated risks.",
    },
    {
      id: "3",
      riskLevel: "High",
      projectedProfit: 15.3,
      strategy: "Aggressive growth stocks and emerging markets",
      description: "High-growth scenario targeting maximum returns.",
    },
  ];

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json(scenarios);
}
