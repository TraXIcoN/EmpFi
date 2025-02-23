"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, GeoJSON, TileLayer, useMap } from "react-leaflet";
import { useInvestmentMapStore } from "@/store/investmentMapStore";
import statesData from "@/data/us-states.json";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";

// Sector filter options
const SECTORS = ["All", "Tech", "Real Estate", "Finance", "Energy"];

// Component to handle map interactions
const MapController = ({ selectedState, onStateSelect }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedState) {
      const bounds = selectedState.target.getBounds();
      map.flyToBounds(bounds, {
        padding: [50, 50],
        duration: 1,
      });
    } else {
      // Reset to US view
      map.flyTo([39.8283, -98.5795], 4, {
        duration: 1,
      });
    }
  }, [selectedState, map]);

  return null;
};

// State Details Panel
const StateDetailsPanel = ({ stateInsight, onClose }) => {
  if (!stateInsight) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed right-0 top-0 h-screen w-96 bg-white shadow-xl p-6 overflow-y-auto text-black z-[1000]"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        ×
      </button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold mb-4">{stateInsight.stateName}</h2>

        {/* Scores */}
        <div className="space-y-4 mb-6">
          <div className="relative pt-1">
            <div className="text-sm font-semibold mb-1">Risk Score</div>
            <motion.div
              className="h-2 bg-red-200 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stateInsight.riskScore}%` }}
              transition={{ duration: 1 }}
            >
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${stateInsight.riskScore}%` }}
              />
            </motion.div>
          </div>

          <div className="relative pt-1">
            <div className="text-sm font-semibold mb-1">Opportunity Score</div>
            <motion.div
              className="h-2 bg-green-200 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stateInsight.opportunityScore}%` }}
              transition={{ duration: 1 }}
            >
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${stateInsight.opportunityScore}%` }}
              />
            </motion.div>
          </div>
        </div>

        {/* Sector Analysis */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Sector Performance</h3>
          {Object.entries(stateInsight.sectors).map(([sector, score]) => (
            <motion.div
              key={sector}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="mb-2"
            >
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize">{sector}</span>
                <span>{score}%</span>
              </div>
              <div className="h-1 bg-gray-200 rounded">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  className="h-full bg-blue-500 rounded"
                  transition={{ duration: 0.8 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Strategy & Insights */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Strategy</h3>
            <p className="text-gray-700">{stateInsight.strategy}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Key Insights</h3>
            <ul className="list-disc list-inside space-y-2">
              {stateInsight.keyInsights.map((insight, index) => (
                <motion.li
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-gray-700"
                >
                  {insight}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sources Section */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">Sources</h3>
          <div className="space-y-2">
            {stateInsight.sources?.map((source, index) => (
              <motion.a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {source.title}
                <span className="text-gray-500 text-xs ml-2">
                  ({new Date(source.date).toLocaleDateString()})
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const InvestmentMap = () => {
  const {
    insights,
    selectedSector,
    isLoading,
    fetchInsights,
    setSelectedSector,
  } = useInvestmentMapStore();
  const [selectedState, setSelectedState] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const getStateStyle = useCallback(
    (feature) => {
      const stateCode = feature.id;
      const stateInsight = insights[stateCode];
      const isSelected = selectedState?.target.feature.id === stateCode;

      if (!stateInsight)
        return {
          fillColor: "#cccccc",
          weight: isSelected ? 2 : 1,
          opacity: 1,
          color: isSelected ? "#000" : "white",
          fillOpacity: isSelected ? 0.8 : 0.7,
        };

      let score = stateInsight.opportunityScore;
      if (selectedSector && selectedSector !== "All") {
        score =
          stateInsight.sectors[selectedSector.toLowerCase().replace(" ", "")] ||
          0;
      }

      const getColor = (score) => {
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
        weight: isSelected ? 2 : 1,
        opacity: 1,
        color: isSelected ? "#000" : "white",
        fillOpacity: selectedState ? (isSelected ? 0.8 : 0.3) : 0.7,
      };
    },
    [insights, selectedState, selectedSector]
  );

  const onEachFeature = (feature, layer) => {
    const stateCode = feature.id;
    const stateInsight = insights[stateCode];

    if (stateInsight) {
      layer.on({
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle({
            weight: 2,
            color: "#000",
            fillOpacity: 0.8,
          });
        },
        mouseout: (e) => {
          const layer = e.target;
          if (selectedState?.target !== layer) {
            layer.setStyle(getStateStyle(feature));
          }
        },
        click: (e) => {
          setSelectedState(selectedState?.target === e.target ? null : e);
        },
      });
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
      <div className="bg-white shadow-sm border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Filter by Sector:
            </span>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map((sector) => (
                <motion.button
                  key={sector}
                  onClick={() =>
                    setSelectedSector(sector === "All" ? null : sector)
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    px-4 py-1.5 text-sm font-medium rounded-md
                    transition-all duration-200 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      (sector === "All" && !selectedSector) ||
                      sector === selectedSector
                        ? "bg-blue-600 text-white shadow-sm focus:ring-blue-500"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 focus:ring-gray-500"
                    }
                  `}
                >
                  {sector}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <MapContainer
            center={[39.8283, -98.5795]}
            zoom={4}
            style={{ height: "100%", width: "100%" }}
            whenCreated={setMap}
            zoomControl={false}
          >
            <MapController
              selectedState={selectedState}
              onStateSelect={setSelectedState}
            />
            <GeoJSON
              data={statesData as any}
              style={getStateStyle}
              onEachFeature={onEachFeature}
            />
          </MapContainer>
        </div>

        {/* Overlay */}
        <AnimatePresence>
          {selectedState && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-30"
            />
          )}
        </AnimatePresence>

        {/* State Details Panel */}
        <AnimatePresence>
          {selectedState && (
            <StateDetailsPanel
              stateInsight={insights[selectedState.target.feature.id]}
              onClose={() => setSelectedState(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InvestmentMap;
