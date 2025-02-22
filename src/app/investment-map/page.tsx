"use client";

import { useEffect, useState } from "react";
import { MapContainer, GeoJSON, TileLayer, Tooltip } from "react-leaflet";
import { useInvestmentMapStore } from "@/store/investmentMapStore";
import statesData from "@/data/us-states.json";
import "leaflet/dist/leaflet.css";

// Sector filter options
const SECTORS = ["All", "Tech", "Real Estate", "Finance", "Energy"];

const InvestmentMap = () => {
  const {
    insights,
    selectedSector,
    isLoading,
    fetchInsights,
    setSelectedSector,
  } = useInvestmentMapStore();
  const [map, setMap] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  // Style function for GeoJSON features
  const getStateStyle = (feature: any) => {
    const stateCode = feature.id;
    const stateInsight = insights[stateCode];

    if (!stateInsight)
      return {
        fillColor: "#cccccc",
        weight: 1,
        opacity: 1,
        color: "white",
        fillOpacity: 0.7,
      };

    // Calculate color based on opportunity score and selected sector
    let score = stateInsight.opportunityScore;
    if (selectedSector && selectedSector !== "All") {
      score =
        stateInsight.sectors[selectedSector.toLowerCase().replace(" ", "")] ||
        0;
    }

    // Color scale from red (high risk) to green (high opportunity)
    const getColor = (score: number) => {
      return score > 80
        ? "#2ecc71"
        : score > 60
        ? "#27ae60"
        : score > 40
        ? "#f1c40f"
        : score > 20
        ? "#e67e22"
        : "#e74c3c";
    };

    return {
      fillColor: getColor(score),
      weight: 1,
      opacity: 1,
      color: "white",
      fillOpacity: 0.7,
    };
  };

  // Tooltip content for each state
  const onEachFeature = (feature: any, layer: any) => {
    const stateCode = feature.id;
    const stateInsight = insights[stateCode];

    if (stateInsight) {
      layer.bindTooltip(
        () => {
          return `
          <div class="bg-white p-2 rounded shadow">
            <h3 class="font-bold">${stateInsight.stateName}</h3>
            <p class="text-sm">Risk Score: ${stateInsight.riskScore}</p>
            <p class="text-sm">Opportunity Score: ${stateInsight.opportunityScore}</p>
            <p class="text-sm mt-1">${stateInsight.strategy}</p>
          </div>
        `;
        },
        { sticky: true }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading investment insights...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Sector Filter Bar */}
      <div className="bg-white shadow p-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <span className="text-gray-700">Filter by Sector:</span>
          <div className="flex space-x-2">
            {SECTORS.map((sector) => (
              <button
                key={sector}
                onClick={() =>
                  setSelectedSector(sector === "All" ? null : sector)
                }
                className={`px-4 py-2 rounded ${
                  (sector === "All" && !selectedSector) ||
                  sector === selectedSector
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1">
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={4}
          style={{ height: "100%", width: "100%" }}
          whenCreated={setMap as any}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <GeoJSON
            data={statesData as any}
            style={getStateStyle}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default InvestmentMap;
