"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement,
} from "chart.js";
import { Line, Pie, Bar } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement
);

interface PortfolioData {
  labels: string[];
  values: number[];
  allocation: {
    labels: string[];
    data: number[];
  };
  performance: {
    labels: string[];
    data: number[];
  };
}

type ChartType = "line" | "pie" | "bar";

export function PortfolioChart() {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    labels: [],
    values: [],
    allocation: { labels: [], data: [] },
    performance: { labels: [], data: [] },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateData = () => {
      setIsLoading(true);

      // Generate timeline data
      const labels = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        return date.toLocaleDateString("en-US", { month: "short" });
      });

      const baseValue = 100000;
      const values = labels.map((_, i) => {
        const randomFactor = 1 + (Math.random() - 0.5) * 0.1;
        return Math.round(baseValue * (1 + i * 0.02) * randomFactor);
      });

      // Generate allocation data
      const sectors = [
        "Technology",
        "Healthcare",
        "Finance",
        "Consumer",
        "Energy",
        "Others",
      ];
      const allocationData = sectors.map(() => Math.random());
      const sum = allocationData.reduce((a, b) => a + b, 0);
      const normalizedAllocation = allocationData.map((v) =>
        Math.round((v / sum) * 100)
      );

      // Generate performance data
      const performanceLabels = ["1D", "1W", "1M", "3M", "6M", "1Y"];
      const performanceData = performanceLabels.map(
        () => (Math.random() - 0.5) * 20
      );

      setPortfolioData({
        labels,
        values,
        allocation: {
          labels: sectors,
          data: normalizedAllocation,
        },
        performance: {
          labels: performanceLabels,
          data: performanceData,
        },
      });

      setIsLoading(false);
    };

    generateData();
    const interval = setInterval(generateData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const lineChartData = {
    labels: portfolioData.labels,
    datasets: [
      {
        label: "Portfolio Value",
        data: portfolioData.values,
        fill: true,
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const pieChartData = {
    labels: portfolioData.allocation.labels,
    datasets: [
      {
        data: portfolioData.allocation.data,
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(107, 114, 128, 0.8)",
        ],
      },
    ],
  };

  const barChartData = {
    labels: portfolioData.performance.labels,
    datasets: [
      {
        label: "Performance",
        data: portfolioData.performance.data,
        backgroundColor: portfolioData.performance.data.map((value) =>
          value >= 0 ? "rgba(16, 185, 129, 0.8)" : "rgba(239, 68, 68, 0.8)"
        ),
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: chartType === "pie",
        position: "bottom" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "rgba(255, 255, 255, 1)",
        bodyColor: "rgba(255, 255, 255, 0.8)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function (context: any) {
            if (chartType === "line")
              return `$${context.parsed.y.toLocaleString()}`;
            if (chartType === "pie")
              return `${context.label}: ${context.parsed}%`;
            if (chartType === "bar") return `${context.parsed.y.toFixed(2)}%`;
            return context.formattedValue;
          },
        },
      },
    },
    scales:
      chartType !== "pie"
        ? {
            x: {
              grid: {
                display: false,
                drawBorder: false,
              },
              ticks: {
                color: "rgba(255, 255, 255, 0.5)",
              },
            },
            y: {
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
                drawBorder: false,
              },
              ticks: {
                color: "rgba(255, 255, 255, 0.5)",
                callback: (value: any) =>
                  chartType === "line"
                    ? `$${value.toLocaleString()}`
                    : `${value}%`,
              },
            },
          }
        : undefined,
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChartType("line")}
          className={`px-4 py-2 rounded ${
            chartType === "line" ? "bg-blue-500" : "bg-gray-700"
          }`}
        >
          Value
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChartType("pie")}
          className={`px-4 py-2 rounded ${
            chartType === "pie" ? "bg-blue-500" : "bg-gray-700"
          }`}
        >
          Allocation
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChartType("bar")}
          className={`px-4 py-2 rounded ${
            chartType === "bar" ? "bg-blue-500" : "bg-gray-700"
          }`}
        >
          Performance
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[300px] w-full flex items-center justify-center"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </motion.div>
        ) : (
          <motion.div
            key={chartType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-[300px] w-full"
          >
            {chartType === "line" && (
              <Line data={lineChartData} options={commonOptions} />
            )}
            {chartType === "pie" && (
              <Pie data={pieChartData} options={commonOptions} />
            )}
            {chartType === "bar" && (
              <Bar data={barChartData} options={commonOptions} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
