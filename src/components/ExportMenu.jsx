import { useState, useRef, useEffect } from "react";
import { fmtB } from "../utils/formatters";

export default function ExportMenu({ companies }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const downloadCsv = (filename, rows) => {
    const header = Object.keys(rows[0]).join(",");
    const body = rows.map(r => Object.values(r).map(v => typeof v === "string" && v.includes(",") ? `"${v}"` : v).join(",")).join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const exportHealthScores = () => {
    const rows = companies.map(c => ({
      Ticker: c.ticker, Company: c.name, Sector: c.sector,
      HealthScore: c.healthScore,
      RevGrowth: c.healthBreakdown?.revenueGrowth ?? "",
      Profitability: c.healthBreakdown?.profitability ?? "",
      EPSMomentum: c.healthBreakdown?.epsMomentum ?? "",
      StockPerf: c.healthBreakdown?.stockPerformance ?? "",
      Dividend: c.healthBreakdown?.dividend ?? "",
      DataAsOf: "Q3 2025",
    }));
    downloadCsv(`stl_health_scores_${new Date().toISOString().split("T")[0]}.csv`, rows);
  };

  const exportFull = () => {
    const rows = companies.map(c => ({
      Ticker: c.ticker, Company: c.name, Sector: c.sector, Industry: c.industry,
      Employees: c.employees, RevenueTTM: c.revenueTTM, RevenueGrowth: c.revenueGrowthYoY,
      GrossMargin: c.grossMargin, EBITDAMargin: c.ebitdaMargin, NetMargin: c.netIncomeMargin,
      EPS: c.epsActual, EPSEstimate: c.epsEstimate, EarningsSurprise: c.earningsSurprise,
      StockPrice: c.stockPrice, MarketCap: c.marketCap, YTD: c.ytdPerformance,
      DivYield: c.dividendYield, PE: c.peRatio, EVEbitda: c.evEbitda,
      PS: c.priceToSales, DebtEbitda: c.debtToEbitda,
      HealthScore: c.healthScore, AnalystRating: c.analystRating || "",
    }));
    downloadCsv(`stl_companies_${new Date().toISOString().split("T")[0]}.csv`, rows);
  };

  const copySummary = () => {
    const avg = Math.round(companies.reduce((s, c) => s + c.healthScore, 0) / companies.length);
    const sorted = [...companies].sort((a, b) => b.healthScore - a.healthScore);
    const top5 = sorted.slice(0, 5).map(c => `  ${c.ticker} (${c.healthScore}) — ${fmtB(c.marketCap)} mkt cap, ${(c.revenueGrowthYoY * 100).toFixed(1)}% rev growth`).join("\n");
    const bottom3 = sorted.slice(-3).map(c => `  ${c.ticker} (${c.healthScore}) — ${fmtB(c.marketCap)} mkt cap, ${(c.revenueGrowthYoY * 100).toFixed(1)}% rev growth`).join("\n");

    const text = `STL Gateway Companies — ${new Date().toLocaleDateString()}
Avg Health Score: ${avg}/100
${companies.length} companies tracked | ${fmtB(companies.reduce((s, c) => s + c.marketCap, 0))} total market cap

TOP 5:
${top5}

BOTTOM 3:
${bottom3}

Data is illustrative — refresh with actual earnings each quarter.`;
    navigator.clipboard.writeText(text);
    setOpen(false);
  };

  const itemStyle = {
    display: "block", width: "100%", textAlign: "left",
    padding: "8px 12px", border: "none", background: "transparent",
    color: "var(--text-secondary)", fontSize: 12, cursor: "pointer",
    fontFamily: "var(--font-sans)",
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        background: "var(--bg-elevated)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "6px 12px", cursor: "pointer",
        color: "var(--text-secondary)", fontSize: 12, fontFamily: "var(--font-sans)",
      }}>Export</button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", right: 0, marginTop: 4,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 8, minWidth: 200, overflow: "hidden", zIndex: 60,
        }}>
          <button onClick={exportHealthScores} style={itemStyle}
            onMouseEnter={e => e.target.style.background = "var(--bg-elevated)"}
            onMouseLeave={e => e.target.style.background = "transparent"}>
            Health Scores CSV
          </button>
          <button onClick={exportFull} style={itemStyle}
            onMouseEnter={e => e.target.style.background = "var(--bg-elevated)"}
            onMouseLeave={e => e.target.style.background = "transparent"}>
            Full Dataset CSV
          </button>
          <button onClick={copySummary} style={itemStyle}
            onMouseEnter={e => e.target.style.background = "var(--bg-elevated)"}
            onMouseLeave={e => e.target.style.background = "transparent"}>
            Copy Summary (text)
          </button>
        </div>
      )}
    </div>
  );
}
