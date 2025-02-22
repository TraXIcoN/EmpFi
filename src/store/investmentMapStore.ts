import { create } from "zustand";

interface StateInvestmentInsight {
  stateCode: string;
  stateName: string;
  riskScore: number; // 0-100
  opportunityScore: number; // 0-100
  sectors: {
    tech: number;
    realEstate: number;
    finance: number;
    energy: number;
  };
  strategy: string;
  keyInsights: string[];
  economicIndicators: {
    gdpGrowth: number;
    unemployment: number;
    businessGrowth: number;
  };
}

interface InvestmentMapStore {
  insights: Record<string, StateInvestmentInsight>;
  selectedSector: string | null;
  isLoading: boolean;
  error: string | null;
  setSelectedSector: (sector: string | null) => void;
  fetchInsights: () => Promise<void>;
}

export const useInvestmentMapStore = create<InvestmentMapStore>((set) => ({
  insights: {},
  selectedSector: null,
  isLoading: false,
  error: null,
  setSelectedSector: (sector: string | null) =>
    set(() => ({ selectedSector: sector })),
  fetchInsights: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/investment-zones");
      const data = await response.json();
      set({ insights: data, isLoading: false });
    } catch (error) {
      set({ error: "Failed to fetch investment insights", isLoading: false });
    }
  },
}));
