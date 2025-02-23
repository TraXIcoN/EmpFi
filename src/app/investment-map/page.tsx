"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, GeoJSON, TileLayer, useMap } from "react-leaflet";
import statesData from "@/data/us-states.json";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CensusData {
  fips: string;
  county_name: string;
  state: string;
  year: number;
  value: number;
}

interface MetaData {
  metrics: string[];
  years: number[];
  states: string[];
}

const MapController = ({ selectedState, map }) => {
  useEffect(() => {
    if (!map) return;

    if (selectedState) {
      const layers = Object.values(map._layers);
      const selectedLayer = layers.find(
        (layer: any) => layer.feature?.properties?.name === selectedState
      );

      if (selectedLayer) {
        const bounds = selectedLayer.getBounds();
        map.fitBounds(bounds, {
          padding: [50, 50],
          duration: 1.5,
          animate: true,
          easeLinearity: 0.25,
          maxZoom: 6, // Adjusted for better state view
        });

        // Fade out neighboring states
        layers.forEach((layer: any) => {
          if (layer.feature) {
            if (layer.feature.properties.name === selectedState) {
              layer.setStyle({
                fillOpacity: 0.8,
                weight: 2,
                color: "#000",
              });
            } else {
              layer.setStyle({
                fillOpacity: 0.2,
                weight: 1,
                color: "#666",
              });
            }
          }
        });
      }
    } else {
      // Reset all states' appearance
      const layers = Object.values(map._layers);
      layers.forEach((layer: any) => {
        if (layer.feature) {
          layer.setStyle(getStateStyle(layer.feature));
        }
      });

      map.flyTo([39.8283, -98.5795], 4, {
        duration: 1.5,
        animate: true,
        easeLinearity: 0.25,
      });
    }
  }, [selectedState, map]);

  return null;
};

const StateVisualizations = ({ stateData, selectedState }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute left-4 bottom-4 right-[400px] bg-black/40 backdrop-blur-md rounded-lg p-6 border border-white/10 z-20"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Population Trend */}
        <div className="col-span-1">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">
            Population Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stateData.populationTrend}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis dataKey="year" stroke="#a78bfa" />
              <YAxis stroke="#a78bfa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#colorGradient)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Demographics Pie Chart */}
        <div className="col-span-1">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">
            Demographics
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stateData.demographics}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                label
              >
                {stateData.demographics.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`hsl(${index * 45}, 70%, 50%)`}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Economic Indicators */}
        <div className="col-span-1">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">
            Economic Indicators
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stateData.economicIndicators}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis dataKey="name" stroke="#a78bfa" />
              <YAxis stroke="#a78bfa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <Bar dataKey="value" fill="url(#barGradient)" />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

const StateDetailsSidebar = ({
  selectedState,
  onClose,
  censusData,
  selectedMetric,
}) => {
  const [activeTab, setActiveTab] = useState("past");
  const [selectedCounty, setSelectedCounty] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2023");

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed right-0 top-0 h-screen w-96 bg-black/40 backdrop-blur-md shadow-xl overflow-hidden border-l border-white/10 z-[9999]"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              {selectedState}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mt-4 space-x-4">
            <button
              onClick={() => setActiveTab("past")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === "past"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Past Data
            </button>
            <button
              onClick={() => setActiveTab("future")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === "future"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Future Insights
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "past" ? (
            <div className="space-y-6">
              {/* Filters */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-purple-300">County</label>
                  <select
                    value={selectedCounty}
                    onChange={(e) => setSelectedCounty(e.target.value)}
                    className="w-full mt-1 bg-black/20 border border-purple-500/20 rounded-lg p-2 text-purple-200"
                  >
                    <option value="all">All Counties</option>
                    {censusData
                      .filter((d) => d.state === selectedState)
                      .map((county) => (
                        <option key={county.fips} value={county.county_name}>
                          {county.county_name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-purple-300">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full mt-1 bg-black/20 border border-purple-500/20 rounded-lg p-2 text-purple-200"
                  >
                    <option value="all">All Categories</option>
                    <option value="economics">Economics</option>
                    <option value="housing">Housing</option>
                    <option value="demographics">Demographics</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-purple-300">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full mt-1 bg-black/20 border border-purple-500/20 rounded-lg p-2 text-purple-200"
                  >
                    {[2023, 2022, 2021, 2020].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data Display */}
              <div className="space-y-4">
                {censusData
                  .filter((d) => d.state === selectedState)
                  .filter(
                    (d) =>
                      selectedCounty === "all" ||
                      d.county_name === selectedCounty
                  )
                  .map((county) => (
                    <div
                      key={county.fips}
                      className="border-b border-white/10 pb-2"
                    >
                      <h3 className="font-medium text-purple-300">
                        {county.county_name}
                      </h3>
                      <p className="text-sm text-purple-200">
                        {selectedMetric}: {county.value}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* AI Insights */}
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-medium text-purple-300 mb-2">
                  Growth Prediction
                </h3>
                <p className="text-purple-200">
                  Based on historical trends and current indicators,{" "}
                  {selectedState} is projected to see significant growth in the
                  technology sector over the next 5 years.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-medium text-purple-300 mb-2">
                  Risk Analysis
                </h3>
                <p className="text-purple-200">
                  Current market conditions suggest moderate risk levels with
                  potential for high returns in specific sectors.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-medium text-purple-300 mb-2">
                  Investment Opportunities
                </h3>
                <ul className="space-y-2 text-purple-200">
                  <li>• Real Estate Development</li>
                  <li>• Technology Startups</li>
                  <li>• Green Energy Projects</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const InvestmentMap = () => {
  const [censusData, setCensusData] = useState<CensusData[]>([]);
  const [metadata, setMetadata] = useState<MetaData | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMetric, setSelectedMetric] = useState("total_population");
  const [isLoading, setIsLoading] = useState(true);
  const [map, setMap] = useState(null);

  // Fetch metadata (metrics, years, states)
  const fetchMetadata = async () => {
    try {
      const response = await fetch("/api/census-data", {
        method: "POST",
      });
      const data = await response.json();
      setMetadata(data);

      // Set initial year to most recent
      if (data.years?.length) {
        setSelectedYear(Math.max(...data.years));
      }
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
    }
  };

  // Fetch census data
  const fetchCensusData = async () => {
    try {
      setIsLoading(true);
      let url = `/api/census-data?metric=${selectedMetric}`;
      if (selectedYear) url += `&year=${selectedYear}`;
      if (selectedState) url += `&state=${selectedState}`;

      const response = await fetch(url);
      const data = await response.json();
      setCensusData(data);
    } catch (error) {
      console.error("Failed to fetch census data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (selectedMetric && selectedYear) {
      fetchCensusData();
    }
  }, [selectedMetric, selectedYear, selectedState]);

  const getStateStyle = useCallback(
    (feature) => {
      const stateData = censusData.filter(
        (d) => d.state === feature.properties.name
      );
      if (!stateData.length)
        return {
          fillColor: "#cccccc",
          weight: 1,
          opacity: 1,
          color: "white",
          fillOpacity: 0.7,
        };

      // Calculate average value for the state
      const avgValue =
        stateData.reduce((acc, curr) => acc + curr.value, 0) / stateData.length;

      // Color scale based on value
      const getColor = (value: number) => {
        // Adjust these thresholds based on your data
        return value > 80
          ? "#2ecc71"
          : value > 60
          ? "#27ae60"
          : value > 40
          ? "#f1c40f"
          : value > 20
          ? "#e67e22"
          : "#e74c3c";
      };

      return {
        fillColor: getColor(avgValue),
        weight: selectedState === feature.properties.name ? 2 : 1,
        opacity: 1,
        color: selectedState === feature.properties.name ? "#000" : "white",
        fillOpacity: selectedState
          ? selectedState === feature.properties.name
            ? 0.8
            : 0.3
          : 0.7,
      };
    },
    [censusData, selectedState]
  );

  const getStateData = (stateName: string) => {
    if (!Array.isArray(censusData))
      return {
        populationTrend: [],
        demographics: [],
        economicIndicators: [],
      };

    const stateData = censusData.filter((d) => d.state === stateName);

    return {
      populationTrend: stateData.map((d) => ({
        year: d.year,
        value: d.value,
      })),
      demographics: [
        { name: "Urban", value: 60 },
        { name: "Rural", value: 40 },
      ],
      economicIndicators: [
        { name: "GDP Growth", value: 3.2 },
        { name: "Employment", value: 4.5 },
        { name: "Investment", value: 2.8 },
      ],
    };
  };

  if (isLoading || !metadata) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Filter Bar */}
      <div className="absolute top-4 right-[400px] z-20 flex gap-4">
        <select
          value={selectedYear || ""}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-black/30 transition-colors"
        >
          {metadata.years.map((year) => (
            <option key={year} value={year} className="bg-black text-white">
              {year}
            </option>
          ))}
        </select>

        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="px-4 py-2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-black/30 transition-colors"
        >
          {metadata.metrics.map((metric) => (
            <option key={metric} value={metric} className="bg-black text-white">
              {metric.replace(/\./g, " ").replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative z-0">
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={4}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          whenCreated={setMap}
        >
          <MapController selectedState={selectedState} map={map} />
          <GeoJSON
            data={statesData as any}
            style={getStateStyle}
            onEachFeature={(feature, layer) => {
              layer.on({
                click: () => {
                  setSelectedState(
                    selectedState === feature.properties.name
                      ? null
                      : feature.properties.name
                  );
                },
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
                  if (selectedState !== feature.properties.name) {
                    layer.setStyle(getStateStyle(feature));
                  }
                },
              });
            }}
          />
        </MapContainer>

        {/* Add overlay when state is selected */}
        <AnimatePresence>
          {selectedState && (
            <StateVisualizations
              stateData={getStateData(selectedState)}
              selectedState={selectedState}
            />
          )}
        </AnimatePresence>

        {/* State Details Panel */}
        <AnimatePresence>
          {selectedState && (
            <StateDetailsSidebar
              selectedState={selectedState}
              onClose={() => setSelectedState(null)}
              censusData={censusData}
              selectedMetric={selectedMetric}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InvestmentMap;
