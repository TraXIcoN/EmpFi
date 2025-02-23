"use client";

import ThreeView from "../three-view";
import { useEffect, useState } from "react";
import analysisData from "@/animations/analysis.json";

// Convert the coordinates to a more manageable scale
const normalizeCoordinates = (
  coords: [number, number]
): [number, number, number] => {
  // Get the center point to normalize around
  const centerX = 3965300;
  const centerY = -9376350;

  return [
    (coords[0] - centerX) / 100, // X coordinate
    0, // Y coordinate (height)
    (coords[1] - centerY) / 100, // Z coordinate
  ];
};

export default function ThreeDVisualization() {
  const [isLoading, setIsLoading] = useState(true);
  const [simulationData, setSimulationData] = useState<any>(null);

  useEffect(() => {
    // Process the analysis data
    const processedData = {
      buildings: [], // You can add buildings data here if needed
      roads: analysisData.traffic_data.map((route) => ({
        points: route.path.map((point) =>
          normalizeCoordinates([point[0], point[1]])
        ),
        width: 1,
        direction: route.direction,
        speed: route.speed,
      })),
      vehicles: analysisData.traffic_data.map((route) => ({
        position: normalizeCoordinates([route.path[0][0], route.path[0][1]]),
        direction: [
          route.path[1][0] - route.path[0][0],
          0,
          route.path[1][1] - route.path[0][1],
        ],
        type: route.type,
        speed: route.speed,
        path: route.path.map((point) =>
          normalizeCoordinates([point[0], point[1]])
        ),
      })),
      hotspots: [], // You can add hotspots data here if needed
    };

    setSimulationData(processedData);
    setIsLoading(false);
  }, []);

  if (!simulationData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-blue-400">Loading simulation data...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Back button */}
      <a
        href="/simulator"
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 
                   text-blue-400 rounded-lg border border-blue-500/30 transition-all"
      >
        ← Back to Simulator
      </a>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <div className="text-blue-400">Loading 3D View...</div>
        </div>
      )}

      {/* Three.js visualization */}
      <div className="absolute inset-0">
        <ThreeView simulationData={simulationData} />
      </div>

      {/* Controls help */}
      <div
        className="absolute bottom-4 right-4 z-10 p-4 bg-black/50 backdrop-blur-md rounded-lg
                    text-blue-400 text-sm border border-blue-500/30"
      >
        <h3 className="font-bold mb-2">Controls:</h3>
        <ul className="space-y-1">
          <li>• Left Click + Drag: Rotate camera</li>
          <li>• Right Click + Drag: Pan camera</li>
          <li>• Scroll: Zoom in/out</li>
        </ul>
      </div>
    </div>
  );
}
