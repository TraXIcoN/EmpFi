import { create } from "zustand";

interface Alert {
  id: string;
  severity: "low" | "medium" | "high";
  message: string;
  timestamp: string;
}

interface RiskAnalysis {
  riskLevel: string;
  summary: string;
  actionItems: string[];
  lastUpdated: string;
}

interface HistoricalComparison {
  period: string;
  similarities: string[];
  differences: string[];
  lessons: string[];
}

interface DashboardStore {
  alerts: Alert[];
  riskAnalysis: RiskAnalysis | null;
  historicalComparison: HistoricalComparison | null;
  isLoading: boolean;
  setAlerts: (alerts: Alert[]) => void;
  setRiskAnalysis: (analysis: RiskAnalysis) => void;
  setHistoricalComparison: (comparison: HistoricalComparison) => void;
  fetchInitialData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  alerts: [],
  riskAnalysis: null,
  historicalComparison: null,
  isLoading: false,
  setAlerts: (alerts) => set({ alerts }),
  setRiskAnalysis: (analysis) => set({ riskAnalysis: analysis }),
  setHistoricalComparison: (comparison) =>
    set({ historicalComparison: comparison }),
  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [alertsRes, analysisRes] = await Promise.all([
        fetch("/api/alerts"),
        fetch("/api/risk-analysis"),
      ]);
      const [alerts, { riskAnalysis, historicalComparison }] =
        await Promise.all([alertsRes.json(), analysisRes.json()]);
      set({ alerts, riskAnalysis, historicalComparison, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      set({ isLoading: false });
    }
  },
}));
