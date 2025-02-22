"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboardStore";

// Alert Component
const AlertItem = ({ alert }: { alert: any }) => (
  <div
    className={`p-4 mb-3 rounded-lg border ${
      alert.severity === "high"
        ? "bg-red-50 border-red-200"
        : alert.severity === "medium"
        ? "bg-yellow-50 border-yellow-200"
        : "bg-blue-50 border-blue-200"
    }`}
  >
    <div className="flex items-center justify-between">
      <span
        className={`text-sm font-semibold ${
          alert.severity === "high"
            ? "text-red-700"
            : alert.severity === "medium"
            ? "text-yellow-700"
            : "text-blue-700"
        }`}
      >
        {alert.severity.toUpperCase()}
      </span>
      <span className="text-xs text-gray-500">{alert.timestamp}</span>
    </div>
    <p className="mt-2 text-sm text-gray-600">{alert.message}</p>
  </div>
);

// Risk Analysis Component
const RiskAnalysis = ({ analysis }: { analysis: any }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold">Risk Analysis</h2>
      <span className="text-sm text-gray-500">
        Updated: {analysis.lastUpdated}
      </span>
    </div>
    <div className="mb-6">
      <div className="inline-block px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
        Risk Level: {analysis.riskLevel}
      </div>
      <p className="mt-4 text-gray-600">{analysis.summary}</p>
    </div>
    <div>
      <h3 className="font-semibold mb-3">Recommended Actions:</h3>
      <ul className="space-y-2">
        {analysis.actionItems.map((item: string, index: number) => (
          <li key={index} className="flex items-start">
            <span className="mr-2">•</span>
            <span className="text-gray-600">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// Historical Comparison Component
const HistoricalComparison = ({ comparison }: { comparison: any }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-bold mb-6">Historical Comparison</h2>
    <h3 className="text-lg font-semibold mb-4">{comparison.period}</h3>

    <div className="mb-6">
      <h4 className="font-medium mb-2">Similarities</h4>
      <ul className="space-y-2">
        {comparison.similarities.map((item: string, index: number) => (
          <li key={index} className="text-sm text-gray-600">
            • {item}
          </li>
        ))}
      </ul>
    </div>

    <div className="mb-6">
      <h4 className="font-medium mb-2">Differences</h4>
      <ul className="space-y-2">
        {comparison.differences.map((item: string, index: number) => (
          <li key={index} className="text-sm text-gray-600">
            • {item}
          </li>
        ))}
      </ul>
    </div>

    <div>
      <h4 className="font-medium mb-2">Key Lessons</h4>
      <ul className="space-y-2">
        {comparison.lessons.map((item: string, index: number) => (
          <li key={index} className="text-sm text-gray-600">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default function Dashboard() {
  const {
    alerts,
    riskAnalysis,
    historicalComparison,
    isLoading,
    fetchInitialData,
  } = useDashboardStore();

  useEffect(() => {
    fetchInitialData();

    // Setup WebSocket connection for real-time alerts
    const ws = new WebSocket(
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000"
    );

    ws.onmessage = (event) => {
      const newAlert = JSON.parse(event.data);
      useDashboardStore
        .getState()
        .setAlerts([newAlert, ...alerts].slice(0, 10));
    };

    return () => ws.close();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
        {/* Left Panel - Alerts */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Active Alerts</h2>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        </div>

        {/* Middle Panel - Risk Analysis */}
        <div className="lg:col-span-6">
          {riskAnalysis && <RiskAnalysis analysis={riskAnalysis} />}
        </div>

        {/* Right Panel - Historical Comparison */}
        <div className="lg:col-span-3">
          {historicalComparison && (
            <HistoricalComparison comparison={historicalComparison} />
          )}
        </div>
      </div>
    </div>
  );
}
