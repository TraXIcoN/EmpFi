import { create } from "zustand";

interface SimulationParams {
  inflation: number;
  fedRate: number;
  gdpGrowth: number;
}

interface Scenario {
  id: string;
  riskLevel: "Low" | "Medium" | "High";
  projectedProfit: number;
  strategy: string;
  description: string;
}

interface SimulatorStore {
  params: SimulationParams;
  scenarios: Scenario[];
  isLoading: boolean;
  setParams: (params: Partial<SimulationParams>) => void;
  runSimulation: () => Promise<void>;
}

export const useSimulatorStore = create<SimulatorStore>((set, get) => ({
  params: {
    inflation: 2.0,
    fedRate: 5.0,
    gdpGrowth: 2.5,
  },
  scenarios: [],
  isLoading: false,
  setParams: (newParams) =>
    set((state) => ({ params: { ...state.params, ...newParams } })),
  runSimulation: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(get().params),
      });
      const scenarios = await response.json();
      set({ scenarios, isLoading: false });
    } catch (error) {
      console.error("Simulation failed:", error);
      set({ isLoading: false });
    }
  },
}));
