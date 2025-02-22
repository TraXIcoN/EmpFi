import { NextResponse } from "next/server";

export async function GET() {
  // Mock risk analysis data
  const data = {
    riskAnalysis: {
      riskLevel: "Moderate-High",
      summary:
        "Current market conditions show increased volatility with potential opportunities in defensive sectors.",
      actionItems: [
        "Rebalance portfolio to increase defensive positions",
        "Consider increasing cash reserves to 15%",
        "Monitor tech sector for entry points",
        "Review hedge positions",
      ],
      lastUpdated: new Date().toISOString(),
    },
    historicalComparison: {
      period: "2008 Financial Crisis vs. Present",
      similarities: [
        "Rising interest rates",
        "Banking sector stress",
        "Market volatility",
      ],
      differences: [
        "Stronger regulatory framework",
        "Better capitalized banks",
        "Different monetary policy tools",
      ],
      lessons: [
        "Maintain adequate liquidity",
        "Diversify across sectors",
        "Monitor systemic risks",
      ],
    },
  };

  return NextResponse.json(data);
}
