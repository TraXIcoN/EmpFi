import { NextResponse } from "next/server";

export async function GET() {
  // Mock investment insights data
  // In a real application, this would come from an AI model or database
  const insights = {
    "01": {
      stateCode: "01",
      stateName: "Alabama",
      riskScore: 45,
      opportunityScore: 65,
      sectors: {
        tech: 40,
        realEstate: 70,
        finance: 55,
        energy: 75,
      },
      strategy: "Focus on energy and real estate development opportunities",
      keyInsights: [
        "Growing manufacturing sector",
        "Affordable real estate market",
        "Emerging tech hub potential",
      ],
      economicIndicators: {
        gdpGrowth: 2.8,
        unemployment: 3.5,
        businessGrowth: 4.2,
      },
    },
    // Add more states...
  };

  return NextResponse.json(insights);
}
