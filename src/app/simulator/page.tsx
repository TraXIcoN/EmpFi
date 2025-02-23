"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaRobot,
  FaSearch,
} from "react-icons/fa";
import {
  MdTimeline,
  MdSpeed,
  MdNotifications,
  MdTrendingUp,
  MdCheck,
  MdLocationOn,
  MdCrisisAlert,
  MdLeaderboard,
  MdAutoGraph,
} from "react-icons/md";
import { useSwipeable } from "react-swipeable";
import TypewriterText from "@/components/TypewriterText";
import { useSimulatorStore } from "@/store/simulatorStore";

const AIAssistant = ({ isThinking }: { isThinking: boolean }) => (
  <motion.div
    className="fixed bottom-8 right-8 bg-black/50 backdrop-blur-md p-4 rounded-full border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
    animate={{
      scale: isThinking ? [1, 1.1, 1] : 1,
    }}
    transition={{
      duration: 1,
      repeat: isThinking ? Infinity : 0,
    }}
  >
    <FaRobot className="text-blue-400 w-8 h-8" />
  </motion.div>
);

const StrategyCard = ({
  strategy,
  isSelected,
  onSelect,
}: {
  strategy: {
    id: number;
    title: string;
    description: string;
    riskLevel: number;
    potentialReturn: number;
    confidence: number;
    impacts: { label: string; value: number }[];
  };
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
        isSelected
          ? "bg-blue-600/30 border-blue-400/50 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          : "bg-black/50 border-blue-500/20"
      } backdrop-blur-md border`}
    >
      <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
          initial={{ width: "0%" }}
          animate={{ width: `${strategy.confidence}%` }}
        />
      </div>

      <h3 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
        {strategy.title}
      </h3>

      <p className="text-blue-200/80 mb-4">{strategy.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-black/30 rounded-xl">
          <div className="text-sm text-blue-300 mb-1">Risk Level</div>
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-1 w-full rounded ${
                  i < strategy.riskLevel ? "bg-orange-500" : "bg-blue-500/20"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="p-3 bg-black/30 rounded-xl">
          <div className="text-sm text-blue-300 mb-1">Potential Return</div>
          <div className="text-xl font-bold text-green-400">
            {strategy.potentialReturn}%
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {strategy.impacts.map((impact, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-blue-200">{impact.label}</span>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${impact.value}%` }}
              className="h-1 bg-blue-400/50 rounded"
            />
          </div>
        ))}
      </div>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1"
        >
          <MdCheck className="text-white" />
        </motion.div>
      )}
    </motion.div>
  );
};

const Notification = ({
  message,
  type,
}: {
  message: string;
  type: "success" | "warning" | "info";
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: "-50%" }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    className={`fixed bottom-8 left-1/2 px-6 py-3 rounded-xl backdrop-blur-md border ${
      type === "success"
        ? "bg-green-500/20 border-green-400/50"
        : type === "warning"
        ? "bg-orange-500/20 border-orange-400/50"
        : "bg-blue-500/20 border-blue-400/50"
    }`}
  >
    <p className="text-white">{message}</p>
  </motion.div>
);

const ParamSlider = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  icon: Icon,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  icon: any;
}) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ scale: [1, 1.05, 1] });
  }, [value]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative p-4 bg-black/30 rounded-xl border border-blue-500/30"
    >
      <div className="flex items-center mb-2">
        <Icon className="text-blue-400 mr-2" />
        <label className="text-sm font-medium text-blue-300">{label}</label>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-blue-500/20 rounded-lg appearance-none cursor-pointer"
        />
        <motion.div
          animate={controls}
          className="absolute top-[-30px] left-[calc(var(--value-percent)*100%)] transform -translate-x-1/2"
          style={{ "--value-percent": (value - min) / (max - min) } as any}
        >
          <div className="bg-blue-500 px-2 py-1 rounded text-sm">{value}</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const TimelineControl = ({
  isPlaying,
  onPlayPause,
  onStepForward,
  onStepBack,
  currentTime,
  totalTime,
}: {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  currentTime: number;
  totalTime: number;
}) => (
  <div className="bg-black/30 p-4 rounded-xl border border-blue-500/30">
    <div className="flex items-center justify-between mb-4">
      <div className="flex space-x-2">
        <button
          onClick={onStepBack}
          className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30"
        >
          <FaStepBackward className="text-blue-400" />
        </button>
        <button
          onClick={onPlayPause}
          className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30"
        >
          {isPlaying ? (
            <FaPause className="text-blue-400" />
          ) : (
            <FaPlay className="text-blue-400" />
          )}
        </button>
        <button
          onClick={onStepForward}
          className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30"
        >
          <FaStepForward className="text-blue-400" />
        </button>
      </div>
      <div className="text-blue-300 text-sm">
        {currentTime} / {totalTime} months
      </div>
    </div>
    <div className="relative h-2 bg-blue-500/20 rounded-lg">
      <motion.div
        className="absolute h-full bg-blue-500 rounded-lg"
        style={{ width: `${(currentTime / totalTime) * 100}%` }}
      />
    </div>
  </div>
);

const EventCard = ({
  event,
  onRespond,
}: {
  event: {
    id: string;
    title: string;
    description: string;
    choices: { id: string; text: string; impact: string }[];
  };
  onRespond: (choiceId: string) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-black/50 backdrop-blur-md rounded-2xl border border-red-500/30 p-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
  >
    <h3 className="text-xl font-bold mb-2 text-red-400">{event.title}</h3>
    <p className="text-blue-200/80 mb-4">{event.description}</p>
    <div className="space-y-2">
      {event.choices.map((choice) => (
        <motion.button
          key={choice.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onRespond(choice.id)}
          className="w-full p-3 bg-black/30 rounded-xl border border-blue-500/30 text-left hover:border-blue-400/50 transition-colors"
        >
          <p className="text-blue-300">{choice.text}</p>
          <p className="text-sm text-blue-400/60">{choice.impact}</p>
        </motion.button>
      ))}
    </div>
  </motion.div>
);

const MarketTicker = ({ updates }: { updates: string[] }) => (
  <div className="bg-black/30 border-t border-b border-blue-500/30 overflow-hidden whitespace-nowrap">
    <motion.div
      animate={{ x: "-100%" }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
      className="inline-block"
    >
      {updates.map((update, i) => (
        <span key={i} className="inline-block mx-8 text-blue-400">
          {update}
        </span>
      ))}
    </motion.div>
  </div>
);

const ScoreIndicator = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className="bg-black/30 rounded-xl p-4 border border-blue-500/30">
    <div className="text-sm text-blue-300 mb-2">{label}</div>
    <div className="relative h-2 bg-blue-500/20 rounded-full overflow-hidden">
      <motion.div
        className={`absolute h-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1 }}
      />
    </div>
    <div className="text-right text-sm mt-1 text-blue-400">{value}%</div>
  </div>
);

interface Portfolio {
  initialValue: number;
  currentValue: number;
  holdings: { [key: string]: number };
}

interface MarketEvent {
  id: string;
  title: string;
  description: string;
  choices: {
    id: string;
    text: string;
    impact: string;
    effects: {
      portfolio: number;
      inflation: number;
      gdpGrowth: number;
      marketStability: number;
    };
  }[];
}

export default function Simulator() {
  const { params, scenarios, isLoading, setParams, runSimulation } =
    useSimulatorStore();
  const [showSimulator, setShowSimulator] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [notifications, setNotifications] = useState<
    Array<{ id: number; message: string; type: "success" | "warning" | "info" }>
  >([]);
  const timelineInterval = useRef<NodeJS.Timeout>();
  const [isInSimulation, setIsInSimulation] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [marketUpdates, setMarketUpdates] = useState<string[]>([]);
  const [scores, setScores] = useState({
    wealth: 50,
    stability: 75,
    innovation: 60,
  });
  const [portfolio, setPortfolio] = useState<Portfolio>({
    initialValue: 1000000, // Start with $1M
    currentValue: 1000000,
    holdings: {},
  });

  const [gameLength] = useState(120); // 2 minutes in seconds
  const [timeRemaining, setTimeRemaining] = useState(gameLength);

  const addNotification = (
    message: string,
    type: "success" | "warning" | "info"
  ) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  useEffect(() => {
    if (isPlaying) {
      timelineInterval.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 12) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timelineInterval.current);
  }, [isPlaying]);

  useEffect(() => {
    if (isInSimulation && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);

        // Random market fluctuations every 10 seconds
        if (timeRemaining % 10 === 0) {
          const marketShift = (Math.random() - 0.5) * 2; // -1 to 1
          setParams((prev) => ({
            ...prev,
            inflation: Math.max(0, Math.min(10, prev.inflation + marketShift)),
            gdpGrowth: Math.max(0, Math.min(10, prev.gdpGrowth + marketShift)),
            fedRate: Math.max(
              0,
              Math.min(10, prev.fedRate + marketShift * 0.5)
            ),
          }));

          // Update portfolio value based on market conditions
          setPortfolio((prev) => ({
            ...prev,
            currentValue: prev.currentValue * (1 + marketShift / 100),
          }));
        }

        // Generate random events every 20 seconds
        if (timeRemaining % 20 === 0 && !currentEvent) {
          generateRandomEvent();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isInSimulation, timeRemaining]);

  const generateRandomEvent = async () => {
    try {
      const response = await fetch("/api/generate-event");
      console.log(response);
      const marketData = await response.json();

      // Use market data to generate relevant event
      const event: MarketEvent = {
        id: `event-${Date.now()}`,
        title: "Market Disruption",
        description: `Major shifts detected in ${marketData.topIndex}`,
        choices: [
          {
            id: "aggressive",
            text: "Take aggressive position",
            impact: "High risk, high reward",
            effects: {
              portfolio: 15,
              inflation: 0.5,
              gdpGrowth: 1,
              marketStability: -10,
            },
          },
          {
            id: "conservative",
            text: "Maintain conservative stance",
            impact: "Low risk, stable returns",
            effects: {
              portfolio: 5,
              inflation: -0.2,
              gdpGrowth: 0.3,
              marketStability: 5,
            },
          },
        ],
      };

      setCurrentEvent(event);
    } catch (error) {
      console.error("Failed to generate event:", error);
    }
  };

  const handleEventResponse = (choiceId: string) => {
    if (!currentEvent) return;

    const choice = currentEvent.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    // Apply effects
    setPortfolio((prev) => ({
      ...prev,
      currentValue: prev.currentValue * (1 + choice.effects.portfolio / 100),
    }));

    setParams((prev) => ({
      inflation: Math.max(
        0,
        Math.min(10, prev.inflation + choice.effects.inflation)
      ),
      gdpGrowth: Math.max(
        0,
        Math.min(10, prev.gdpGrowth + choice.effects.gdpGrowth)
      ),
      fedRate: prev.fedRate,
    }));

    setScores((prev) => ({
      ...prev,
      stability: Math.max(
        0,
        Math.min(100, prev.stability + choice.effects.marketStability)
      ),
    }));

    setCurrentEvent(null);
    addNotification("Decision implemented!", "success");
  };

  const suggestions = [
    "What if Tesla partners with Apple on autonomous vehicles?",
    "What if Amazon acquires a major bank?",
    "What if China becomes carbon neutral by 2025?",
    "What if SpaceX successfully colonizes Mars?",
  ];

  const aiStrategies = [
    {
      id: 1,
      title: "Aggressive Growth",
      description:
        "High-risk, high-reward strategy focusing on emerging tech sectors",
      riskLevel: 4,
      potentialReturn: 25,
      confidence: 85,
      impacts: [
        { label: "Market Share", value: 75 },
        { label: "Innovation", value: 90 },
        { label: "Sustainability", value: 60 },
      ],
    },
    {
      id: 2,
      title: "Balanced Growth",
      description:
        "Moderate-risk, moderate-reward strategy focusing on stable sectors",
      riskLevel: 3,
      potentialReturn: 15,
      confidence: 70,
      impacts: [
        { label: "Market Share", value: 60 },
        { label: "Innovation", value: 75 },
        { label: "Sustainability", value: 50 },
      ],
    },
    {
      id: 3,
      title: "Conservative Growth",
      description:
        "Low-risk, low-reward strategy focusing on traditional sectors",
      riskLevel: 2,
      potentialReturn: 5,
      confidence: 50,
      impacts: [
        { label: "Market Share", value: 40 },
        { label: "Innovation", value: 50 },
        { label: "Sustainability", value: 30 },
      ],
    },
    {
      id: 4,
      title: "Innovative Growth",
      description:
        "High-risk, high-reward strategy focusing on cutting-edge technologies",
      riskLevel: 5,
      potentialReturn: 30,
      confidence: 90,
      impacts: [
        { label: "Market Share", value: 80 },
        { label: "Innovation", value: 100 },
        { label: "Sustainability", value: 70 },
      ],
    },
    {
      id: 5,
      title: "Sustainable Growth",
      description:
        "Low-risk, high-reward strategy focusing on environmentally friendly sectors",
      riskLevel: 1,
      potentialReturn: 10,
      confidence: 60,
      impacts: [
        { label: "Market Share", value: 30 },
        { label: "Innovation", value: 60 },
        { label: "Sustainability", value: 80 },
      ],
    },
  ];

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsAiThinking(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsAiThinking(false);
      setShowSimulator(true);
    }
  };

  const enterSimulation = () => {
    setIsInSimulation(true);
    setTimeRemaining(gameLength);
    setPortfolio({
      initialValue: 1000000,
      currentValue: 1000000,
      holdings: {},
    });
    setMarketUpdates([
      "TECH: AI stocks surge 15% 📈",
      "POLICY: Fed announces new crypto regulations 📊",
      "MARKET: Global trade volumes hit record high 🌍",
      "ALERT: Major tech merger announced 🤝",
    ]);
    setTimeout(() => {
      setCurrentEvent({
        id: "event1",
        title: "Tech Disruption",
        description:
          "A breakthrough in quantum computing threatens traditional cybersecurity. How do you respond?",
        choices: [
          {
            id: "invest",
            text: "Invest heavily in quantum-safe security",
            impact: "High cost, but ensures future stability",
          },
          {
            id: "wait",
            text: "Wait for market standards to develop",
            impact: "Saves resources but increases vulnerability",
          },
          {
            id: "partner",
            text: "Form strategic partnerships",
            impact: "Balanced approach with moderate costs",
          },
        ],
      });
    }, 2000);
  };

  useEffect(() => {
    if (timeRemaining === 0) {
      const performancePercent =
        ((portfolio.currentValue - portfolio.initialValue) /
          portfolio.initialValue) *
        100;
      addNotification(
        `Simulation complete! Portfolio ${
          performancePercent >= 0 ? "gained" : "lost"
        } ${Math.abs(performancePercent).toFixed(2)}%`,
        performancePercent >= 0 ? "success" : "warning"
      );
      setIsInSimulation(false);
    }
  }, [timeRemaining]);

  if (!showSimulator) {
    return (
      <div className="min-h-screen bg-black text-white p-6 ml-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto pt-16"
        >
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
            <h1 className="relative text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              What If?
            </h1>
            <p className="relative text-xl text-blue-200/80">
              Explore the financial ripples of future possibilities
            </p>
          </div>

          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Enter your scenario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full p-6 pl-12 pr-36 text-lg bg-black/50 backdrop-blur-md border border-blue-500/30 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-blue-300/50"
            />
            <motion.button
              onClick={handleSearch}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600/80 backdrop-blur-sm text-white px-6 py-2 rounded-xl hover:bg-blue-700/80 transition-colors border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              Simulate
            </motion.button>
          </div>

          <div className="relative text-center mb-12">
            <p className="text-blue-300/80 mb-4">Try these scenarios:</p>
            <TypewriterText
              sentences={suggestions}
              typingSpeed={40}
              deletingSpeed={20}
              delayBetween={3000}
            />
          </div>

          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-blue-400/50 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </motion.div>
        <AIAssistant isThinking={isAiThinking} />
      </div>
    );
  }

  const handleStrategySelect = (strategyId: number) => {
    setSelectedStrategy(strategyId);
    addNotification(
      `Strategy "${
        aiStrategies.find((s) => s.id === strategyId)?.title
      }" selected!`,
      "success"
    );
    enterSimulation();
  };

  return (
    <div className="min-h-screen bg-black text-white ml-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border-b border-blue-500/20"
      >
        <div className="max-w-[calc(100vw-5rem)] mx-auto px-4">
          <div className="py-4 flex items-center space-x-4">
            <div className="relative flex-1 max-w-3xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-2 bg-black/50 border border-blue-500/30 rounded-xl text-white"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[calc(100vw-5rem)] mx-auto px-4 py-6"
      >
        {!isInSimulation ? (
          <>
            <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Choose Your Strategy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {aiStrategies.map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  isSelected={selectedStrategy === strategy.id}
                  onSelect={() => handleStrategySelect(strategy.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="grid gap-6">
            <MarketTicker updates={marketUpdates} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ScoreIndicator
                label="Economic Health"
                value={scores.wealth}
                color="bg-green-500"
              />
              <ScoreIndicator
                label="Market Stability"
                value={scores.stability}
                color="bg-blue-500"
              />
              <ScoreIndicator
                label="Innovation Index"
                value={scores.innovation}
                color="bg-purple-500"
              />
            </div>

            <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)] p-6">
              <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Market Parameters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ParamSlider
                  label="Inflation Rate (%)"
                  value={params.inflation}
                  onChange={(value) => {
                    setParams({ inflation: value });
                    setScores((prev) => ({
                      ...prev,
                      stability: Math.max(
                        0,
                        prev.stability + (value < 5 ? 2 : -2)
                      ),
                    }));
                  }}
                  min={0}
                  max={10}
                  step={0.1}
                  icon={MdTrendingUp}
                />
                <ParamSlider
                  label="Fed Rate (%)"
                  value={params.fedRate}
                  onChange={(value) => setParams({ fedRate: value })}
                  min={0}
                  max={10}
                  step={0.25}
                  icon={MdTimeline}
                />
                <ParamSlider
                  label="GDP Growth (%)"
                  value={params.gdpGrowth}
                  onChange={(value) => setParams({ gdpGrowth: value })}
                  min={0}
                  max={10}
                  step={0.1}
                  icon={MdSpeed}
                />
              </div>
            </div>

            <TimelineControl
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onStepForward={() => {
                setCurrentTime((prev) => Math.min(prev + 1, 12));
                if (Math.random() > 0.7) {
                  // Add new random event
                }
              }}
              onStepBack={() => setCurrentTime((prev) => Math.max(prev - 1, 0))}
              currentTime={currentTime}
              totalTime={12}
            />

            <AnimatePresence>
              {currentEvent && (
                <EventCard
                  event={currentEvent}
                  onRespond={(choiceId) => {
                    setCurrentEvent(null);
                    handleEventResponse(choiceId);
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              message={notification.message}
              type={notification.type}
            />
          ))}
        </AnimatePresence>
      </motion.div>
      <AIAssistant isThinking={isLoading} />
      {isInSimulation && (
        <div className="fixed top-4 right-4 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-blue-500/30">
          <div className="text-blue-400 mb-2">
            Time Remaining: {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </div>
          <div className="text-green-400">
            Portfolio: $
            {portfolio.currentValue.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>
      )}
    </div>
  );
}
