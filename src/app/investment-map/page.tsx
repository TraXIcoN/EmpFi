// @ts-nocheck

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
import dynamic from "next/dynamic";

const MapContainerDynamic = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayerDynamic = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const DynamicLineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);

const DynamicBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);

const DynamicPieChart = dynamic(
  () => import("recharts").then((mod) => mod.PieChart),
  { ssr: false }
);

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
      ) as L.GeoJSON;

      if (selectedLayer) {
        const bounds = selectedLayer.getBounds();
        map.fitBounds(bounds, {
          padding: [50, 50],
          duration: 1.5,
          animate: true,
          easeLinearity: 0.25,
          maxZoom: 6,
        });

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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-3 gap-6 z-40"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="col-span-1 z-40"
      >
        <h3 className="text-lg font-semibold text-purple-300 mb-4">
          Population Trend
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <DynamicLineChart data={stateData.populationTrend}>
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
          </DynamicLineChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="col-span-1"
      >
        <h3 className="text-lg font-semibold text-purple-300 mb-4">
          Demographics
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <DynamicPieChart>
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
          </DynamicPieChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="col-span-1"
      >
        <h3 className="text-lg font-semibold text-purple-300 mb-4">
          Economic Indicators
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <DynamicBarChart data={stateData.economicIndicators}>
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
          </DynamicBarChart>
        </ResponsiveContainer>
      </motion.div>
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
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed right-0 top-0 h-screen w-[400px] bg-gray-900/95 shadow-2xl overflow-hidden border-l border-purple-500/20 z-[9999]"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full flex flex-col"
      >
        <div className="p-6 border-b border-purple-500/20">
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex-1 overflow-y-auto p-6"
        >
          {activeTab === "past" ? (
            <div className="space-y-6">
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
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const StateSelectionPrompt = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed right-0 top-0 h-screen w-[400px] bg-gray-900/95 shadow-2xl overflow-hidden border-l border-purple-500/20 flex flex-col items-center justify-center text-center px-8"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="w-24 h-24 mx-auto mb-6">
          <svg
            className="w-full h-full text-purple-400 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Select a State
        </h3>
        <p className="text-purple-200 text-lg">
          Click on any state to view detailed information about population
          trends, demographics, and economic indicators.
        </p>
        <div className="pt-6 text-purple-300/60">
          <p className="text-sm">
            Tip: You can also hover over states to preview their data
          </p>
        </div>
      </motion.div>
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

  const fetchMetadata = async () => {
    try {
      const response = await fetch("/api/census-data", {
        method: "POST",
      });
      const data = await response.json();
      setMetadata(data);

      if (data.years?.length) {
        setSelectedYear(Math.max(...data.years));
      }
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
    }
  };

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

      const avgValue =
        stateData.reduce((acc, curr) => acc + curr.value, 0) / stateData.length;

      const getColor = (value: number) => {
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
    <div className="h-screen flex flex-col ml-20">
      <div className="fixed top-4 right-[420px] z-20 flex gap-4">
        <motion.select
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          value={selectedYear || ""}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 rounded-lg bg-gray-900/95 backdrop-blur-sm border border-purple-500/20 text-white hover:bg-gray-800/95 transition-all duration-300 shadow-lg"
        >
          {metadata.years.map((year) => (
            <option key={year} value={year} className="bg-black text-white">
              {year}
            </option>
          ))}
        </motion.select>

        <motion.select
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-900/95 backdrop-blur-sm border border-purple-500/20 text-white hover:bg-gray-800/95 transition-all duration-300 shadow-lg"
        >
          {metadata.metrics.map((metric) => (
            <option key={metric} value={metric} className="bg-black text-white">
              {metric.replace(/\./g, " ").replace(/_/g, " ")}
            </option>
          ))}
        </motion.select>
      </div>

      <div className="flex-1 relative z-0 mt-16 mr-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`h-full w-full ${
            selectedState ? "h-2/3" : "h-full"
          } transition-all duration-500 ease-in-out`}
        >
          <MapContainerDynamic
            center={[39.8283, -98.5795]}
            zoom={4}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
            zoomControl={false}
            whenCreated={setMap}
            className="rounded-lg shadow-2xl z-1"
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
          </MapContainerDynamic>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedState && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4 bg-gray-900/95 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 shadow-2xl"
            >
              <StateVisualizations
                stateData={getStateData(selectedState)}
                selectedState={selectedState}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {selectedState ? (
            <StateDetailsSidebar
              selectedState={selectedState}
              onClose={() => setSelectedState(null)}
              censusData={censusData}
              selectedMetric={selectedMetric}
            />
          ) : (
            <StateSelectionPrompt />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InvestmentMap;
