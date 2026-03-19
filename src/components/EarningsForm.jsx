import { useState } from "react";
import useStore from "../store/useStore";

const FIELDS = [
  { key: "revenueTTM", label: "Revenue TTM ($M)", type: "number" },
  { key: "revenueQuarterly", label: "Revenue Quarterly ($M)", type: "number" },
  { key: "revenueGrowthYoY", label: "Revenue Growth YoY (decimal)", type: "number", step: "0.01" },
  { key: "grossMargin", label: "Gross Margin (decimal)", type: "number", step: "0.001" },
  { key: "ebitdaMargin", label: "EBITDA Margin (decimal)", type: "number", step: "0.001" },
  { key: "netIncomeMargin", label: "Net Income Margin (decimal)", type: "number", step: "0.001" },
  { key: "epsActual", label: "EPS Actual", type: "number", step: "0.01" },
  { key: "epsEstimate", label: "EPS Estimate", type: "number", step: "0.01" },
  { key: "stockPrice", label: "Stock Price", type: "number", step: "0.01" },
  { key: "marketCap", label: "Market Cap ($M)", type: "number" },
  { key: "ytdPerformance", label: "YTD Performance (decimal)", type: "number", step: "0.001" },
  { key: "employees", label: "Employees", type: "number" },
  { key: "dividendYield", label: "Dividend Yield (decimal)", type: "number", step: "0.001" },
  { key: "earningsDate", label: "Earnings Date", type: "date" },
];

export default function EarningsForm({ company, onClose }) {
  const updateCompany = useStore((s) => s.updateCompany);
  const appendHealthHistory = useStore((s) => s.appendHealthHistory);

  const [form, setForm] = useState(
    FIELDS.reduce((acc, f) => {
      acc[f.key] = company[f.key] ?? "";
      return acc;
    }, {})
  );
  const [quarter, setQuarter] = useState("Q1 2026");

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = {};
    for (const f of FIELDS) {
      const val = form[f.key];
      if (val === "" || val == null) continue;
      parsed[f.key] = f.type === "number" ? parseFloat(val) : val;
    }
    // Update EPS history
    if (parsed.epsActual != null && parsed.epsEstimate != null) {
      const beat = parsed.epsActual >= parsed.epsEstimate;
      parsed.earningsSurprise =
        ((parsed.epsActual - parsed.epsEstimate) / Math.abs(parsed.epsEstimate)) * 100;
      parsed.epsHistory = [...(company.epsHistory || []).slice(1), beat];
    }
    updateCompany(company.ticker, parsed);
    appendHealthHistory(company.ticker, quarter);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold mb-4">
        Update Earnings — {company.ticker} ({company.name})
      </h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Quarter</label>
        <select
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
        >
          {["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"].map((q) => (
            <option key={q}>{q}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
            <input
              type={f.type}
              step={f.step}
              value={form[f.key]}
              onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Save & Recalculate
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
