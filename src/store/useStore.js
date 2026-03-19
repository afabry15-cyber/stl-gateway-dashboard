import { create } from "zustand";
import initialCompanies from "../data/companies.json";
import initialDeparted from "../data/departedCompanies.json";
import initialHistory from "../data/healthScoreHistory.json";
import { calculateHealthScore } from "../utils/healthScore";

// Attach computed health scores to seed data
const enrichCompanies = (companies) =>
  companies.map((c) => ({
    ...c,
    healthScore: calculateHealthScore(c).total,
    healthBreakdown: calculateHealthScore(c).breakdown,
  }));

const useStore = create((set, get) => ({
  companies: enrichCompanies(initialCompanies),
  departedCompanies: enrichCompanies(initialDeparted),
  healthHistory: initialHistory,
  sectorFilter: "All",
  sortField: "healthScore",
  sortDir: "desc",

  setSectorFilter: (sector) => set({ sectorFilter: sector }),
  setSort: (field) => {
    const { sortField, sortDir } = get();
    if (sortField === field) {
      set({ sortDir: sortDir === "desc" ? "asc" : "desc" });
    } else {
      set({ sortField: field, sortDir: "desc" });
    }
  },

  getFilteredCompanies: () => {
    const { companies, sectorFilter, sortField, sortDir } = get();
    let filtered = companies;
    if (sectorFilter !== "All") {
      filtered = filtered.filter((c) => c.sector === sectorFilter);
    }
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
    return filtered;
  },

  getFilteredDeparted: () => {
    const { departedCompanies, sortField, sortDir } = get();
    return [...departedCompanies].sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  },

  updateCompany: (ticker, updates) => {
    set((state) => {
      const companies = state.companies.map((c) => {
        if (c.ticker !== ticker) return c;
        const updated = { ...c, ...updates, lastUpdated: new Date().toISOString().split("T")[0] };
        const { total, breakdown } = calculateHealthScore(updated);
        return { ...updated, healthScore: total, healthBreakdown: breakdown };
      });
      return { companies };
    });
  },

  appendHealthHistory: (ticker, quarter) => {
    const company = get().companies.find((c) => c.ticker === ticker);
    if (!company) return;
    set((state) => ({
      healthHistory: [
        ...state.healthHistory,
        {
          ticker,
          quarter,
          date: new Date().toISOString().split("T")[0],
          score: company.healthScore,
        },
      ],
    }));
  },

  importCompanies: (newData) => {
    set({ companies: enrichCompanies(newData) });
  },

  getSectors: () => {
    const sectors = new Set(get().companies.map((c) => c.sector));
    return ["All", ...Array.from(sectors).sort()];
  },
}));

export default useStore;
