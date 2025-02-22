"use client";

import { useState } from "react";
import { useSimulatorStore } from "@/store/simulatorStore";
import { FaSearch, FaMicrophone } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { IoClose } from "react-icons/io5";

export default function Simulator() {
  const { params, scenarios, isLoading, setParams, runSimulation } =
    useSimulatorStore();
  const [showSimulator, setShowSimulator] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSimulator(true);
    }
  };

  if (!showSimulator) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto pt-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Explore Future Scenarios
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Learn about Market Trends, Investment Opportunities, and Economic
            Forecasts
          </p>
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Find Scenarios, Markets, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 pr-36 text-lg border rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaSearch size={20} />
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-4">
              <MdLocationOn
                size={24}
                className="text-gray-400 cursor-pointer"
              />
              <FaMicrophone
                size={20}
                className="text-gray-400 cursor-pointer"
              />
              <button
                onClick={() => setShowSimulator(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </div>
          <div className="text-gray-600 text-center">
            <p className="mb-4">Try searching for</p>
            <div className="space-x-2">
              <button
                onClick={() => setShowSimulator(true)}
                className="text-blue-600 hover:underline"
              >
                market trends
              </button>
              <span>in</span>
              <button
                onClick={() => setShowSimulator(true)}
                className="text-blue-600 hover:underline"
              >
                tech sector
              </button>
              <span>for</span>
              <button
                onClick={() => setShowSimulator(true)}
                className="text-blue-600 hover:underline"
              >
                2024
              </button>
            </div>
          </div>
          <div className="flex justify-center space-x-6 mt-8 text-sm text-gray-500">
            <button className="hover:text-gray-700">Help</button>
            <button className="hover:text-gray-700">Feedback</button>
            <button className="hover:text-gray-700">Advanced Search</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="py-4 flex items-center space-x-4">
            <div className="relative flex-1 max-w-3xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-2 border rounded-md"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <IoClose size={20} />
                </button>
              )}
            </div>
            <button className="text-blue-600 hover:underline">
              Advanced Search
            </button>
          </div>
          <div className="flex space-x-8">
            {["All", "Tables", "Maps", "Charts", "Profiles", "Pages"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 -mb-px ${
                    activeTab === tab
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>
      </div>
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="w-72 flex-shrink-0">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">2 Filters</h2>
                <button className="text-blue-600 hover:underline text-sm">
                  Clear search
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-white rounded border">
                  <div className="flex items-center space-x-2">
                    <MdLocationOn className="text-gray-400" />
                    <span className="text-sm">All Markets</span>
                  </div>
                </div>
                <div className="p-3 bg-white rounded border">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Data</h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">View:</span>
                <div className="flex space-x-2">
                  {[10, 25, 50].map((num) => (
                    <button
                      key={num}
                      className="px-3 py-1 rounded border hover:bg-gray-50"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="bg-white rounded-lg shadow p-6"
                  >
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
                      <h4 className="font-medium mb-2">
                        Recommended Strategy:
                      </h4>
                      <p className="text-gray-700">{scenario.strategy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t mt-8">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex justify-between text-sm text-gray-600">
            <div className="flex space-x-4">
              <button className="hover:underline">Accessibility</button>
              <button className="hover:underline">Information Quality</button>
              <button className="hover:underline">FOIA</button>
              <button className="hover:underline">
                Data Protection and Privacy Policy
              </button>
            </div>
            <button className="bg-blue-600 text-white px-4 py-1 rounded">
              Help improve our search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
