import { useState } from "react";
import { calculateHealthScore } from "../utils/healthScore";

const FIELDS = [
  { key: "quarter", label: "Quarter", type: "text", placeholder: "Q4 2025" },
  { key: "revenueTTM", label: "Revenue TTM ($M)", type: "number" },
  { key: "revenueQuarterly", label: "Revenue Quarterly ($M)", type: "number" },
  { key: "grossMargin", label: "Gross Margin %", type: "number", step: "0.1", pct: true },
  { key: "ebitdaMargin", label: "EBITDA Margin %", type: "number", step: "0.1", pct: true },
  { key: "netIncomeMargin", label: "Net Margin %", type: "number", step: "0.1", pct: true },
  { key: "epsActual", label: "EPS Actual", type: "number", step: "0.01" },
  { key: "epsEstimate", label: "EPS Estimate", type: "number", step: "0.01" },
  { key: "stockPrice", label: "Stock Price", type: "number", step: "0.01" },
  { key: "employees", label: "Employee Count", type: "number" },
];

export default function EarningsRefreshPanel({ companies, setCompanies, onClose }) {
  const [ticker, setTicker] = useState(companies[0]?.ticker || "");
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updates = {};
    for (const f of FIELDS) {
      if (f.key === "quarter") { updates._quarter = form[f.key]; continue; }
      const val = form[f.key];
      if (val === "" || val == null) continue;
      const num = parseFloat(val);
      updates[f.key] = f.pct ? num / 100 : num;
    }

    setCompanies(prev => prev.map(c => {
      if (c.ticker !== ticker) return c;
      const updated = { ...c, ...updates, lastUpdated: new Date().toISOString().split("T")[0] };
      if (updates.epsActual != null && updates.epsEstimate != null) {
        updated.earningsSurprise = ((updates.epsActual - updates.epsEstimate) / Math.abs(updates.epsEstimate)) * 100;
      }
      const { total, breakdown } = calculateHealthScore(updated);
      updated.healthScore = total;
      updated.healthBreakdown = breakdown;

      // Append snapshot
      if (updates._quarter) {
        const snap = {
          quarter: updates._quarter,
          revenue: updates.revenueQuarterly || c.revenueQuarterly,
          ebitdaMargin: updates.ebitdaMargin ?? c.ebitdaMargin,
          netMargin: updates.netIncomeMargin ?? c.netIncomeMargin,
          eps: updates.epsActual ?? c.epsActual,
          epsEst: updates.epsEstimate ?? c.epsEstimate,
          price: updates.stockPrice ?? c.stockPrice,
          employees: updates.employees ?? c.employees,
          healthScore: total,
        };
        updated.historicalSnapshots = [...(c.historicalSnapshots || []), snap];
      }

      setToast(`${ticker} updated — Health Score: ${total}`);
      setTimeout(() => { setToast(null); onClose(); }, 2500);
      return updated;
    }));

    // Persist to localStorage
    try {
      const overrides = JSON.parse(localStorage.getItem("stl-dashboard-overrides") || "{}");
      overrides[ticker] = { ...overrides[ticker], ...updates, _healthScore: undefined };
      localStorage.setItem("stl-dashboard-overrides", JSON.stringify(overrides));
    } catch {}
  };

  const inputStyle = {
    width: "100%", padding: "8px 10px", borderRadius: 6,
    border: "1px solid var(--border)", background: "var(--bg-elevated)",
    color: "var(--text-primary)", fontSize: 13, fontFamily: "var(--font-sans)",
  };

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="panel-slide" style={{ padding: "var(--sp-3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-3)" }}>
          <h3 style={{ fontSize: 18 }}>Refresh Earnings</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 20, cursor: "pointer" }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "var(--sp-2)" }}>
            <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Company</label>
            <select value={ticker} onChange={e => setTicker(e.target.value)} style={inputStyle}>
              {companies.map(c => <option key={c.ticker} value={c.ticker}>{c.ticker} — {c.name}</option>)}
            </select>
          </div>

          {FIELDS.map(f => (
            <div key={f.key} style={{ marginBottom: "var(--sp-1)" }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>{f.label}</label>
              <input
                type={f.type}
                step={f.step}
                placeholder={f.placeholder}
                value={form[f.key] || ""}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={inputStyle}
              />
            </div>
          ))}

          <button type="submit" style={{
            width: "100%", padding: "10px", borderRadius: 8, border: "none", marginTop: "var(--sp-2)",
            background: "var(--teal)", color: "#070810", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            Update & Recalculate
          </button>
        </form>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
