"use client";

import { useState } from "react";
import { useSimulatorStore } from "@/store/simulatorStore";

export default function Simulator() {
  const { params, scenarios, isLoading, setParams, runSimulation } =
    useSimulatorStore();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Future Scenarios Simulator</h1>

      {/* Input Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inflation Rate (%)
            </label>
            <input
              type="number"
              value={params.inflation}
              onChange={(e) =>
                setParams({ inflation: parseFloat(e.target.value) })
              }
              className="w-full p-2 border rounded"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fed Rate (%)
            </label>
            <input
              type="number"
              value={params.fedRate}
              onChange={(e) =>
                setParams({ fedRate: parseFloat(e.target.value) })
              }
              className="w-full p-2 border rounded"
              step="0.25"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GDP Growth (%)
            </label>
            <input
              type="number"
              value={params.gdpGrowth}
              onChange={(e) =>
                setParams({ gdpGrowth: parseFloat(e.target.value) })
              }
              className="w-full p-2 border rounded"
              step="0.1"
            />
          </div>
        </div>
        <button
          onClick={() => runSimulation()}
          disabled={isLoading}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? "Simulating..." : "Run Simulation"}
        </button>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="bg-white rounded-lg shadow p-6">
            <div
              className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${
                scenario.riskLevel === "Low"
                  ? "bg-green-100 text-green-800"
                  : scenario.riskLevel === "Medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {scenario.riskLevel} Risk
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Projected Profit: {scenario.projectedProfit.toFixed(2)}%
            </h3>
            <p className="text-gray-600 mb-4">{scenario.description}</p>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Recommended Strategy:</h4>
              <p className="text-gray-700">{scenario.strategy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
