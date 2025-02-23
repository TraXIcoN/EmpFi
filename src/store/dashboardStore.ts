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

interface DashboardState {
  alerts: any[];
  riskAnalysis: any;
  portfolioAnalysis: any;
  historicalComparison: any;
  isLoading: boolean;
  setAlerts: (alerts: any[]) => void;
  setRiskAnalysis: (analysis: any) => void;
  setPortfolioAnalysis: (analysis: any) => void;
  setHistoricalComparison: (comparison: any) => void;
  setIsLoading: (loading: boolean) => void;
  fetchInitialData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  alerts: [],
  riskAnalysis: null,
  portfolioAnalysis: null,
  historicalComparison: null,
  isLoading: true,
  setAlerts: (alerts) => set({ alerts }),
  setRiskAnalysis: (analysis) => set({ riskAnalysis: analysis }),
  setPortfolioAnalysis: (analysis) => set({ portfolioAnalysis: analysis }),
  setHistoricalComparison: (comparison) =>
    set({ historicalComparison: comparison }),
  setIsLoading: (loading) => set({ isLoading: loading }),
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
