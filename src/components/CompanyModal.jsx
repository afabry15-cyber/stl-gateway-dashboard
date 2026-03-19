import { useState } from "react";
import { createPortal } from "react-dom";
import HealthGauge from "./HealthGauge";
import { fmtB, fmtPct, fmtDelta, fmtUsd, fmtNum, fmtRatio, sectorColor, daysUntil } from "../utils/formatters";
import { healthColor } from "../utils/healthScore";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, Area, AreaChart,
} from "recharts";

const CHART_TOOLTIP = {
  contentStyle: { background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 },
};
const AXIS_PROPS = {
  tick: { fill: "var(--text-secondary)", fontSize: 11 },
  axisLine: { stroke: "var(--border)" },
  tickLine: false,
};

const TABS = ["Revenue", "EBITDA%", "EPS", "Price", "Health Score"];

const BREAKDOWN_ITEMS = [
  { key: "revenueGrowth", label: "Revenue Growth", weight: "25%" },
  { key: "profitability", label: "Profitability", weight: "20%" },
  { key: "epsMomentum", label: "EPS Momentum", weight: "20%" },
  { key: "stockPerformance", label: "Stock vs S&P", weight: "15%" },
  { key: "dividend", label: "Dividend", weight: "10%" },
];

export default function CompanyModal({ company, onClose }) {
  const [chartTab, setChartTab] = useState("Revenue");
  if (!company) return null;
  const c = company;
  const snaps = c.historicalSnapshots || [];
  const bd = c.healthBreakdown || {};

  const sectorMedians = { peRatio: 15, evEbitda: 10, priceToSales: 1.5, debtToEbitda: 2.5 };

  const modal = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: "var(--sp-4)" }}>
        {/* Close */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 20, cursor: "pointer" }}>&times;</button>
        </div>

        {/* Header */}
        <div style={{ display: "flex", gap: "var(--sp-4)", marginBottom: "var(--sp-4)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-serif)" }}>{c.ticker}</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: sectorColor(c.sector) + "26", color: sectorColor(c.sector) }}>{c.sector}</span>
              {c.analystRating && <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, border: "1px solid var(--text-muted)", color: c.analystRating === "Buy" ? "var(--teal)" : c.analystRating === "Sell" ? "var(--red)" : "var(--amber)" }}>{c.analystRating}</span>}
            </div>
            <div style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 8 }}>{c.name}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: "var(--sp-2)", lineHeight: 1.5 }}>{c.description}</div>
            <div style={{ display: "flex", gap: "var(--sp-3)", flexWrap: "wrap", fontSize: 12 }}>
              <StatChip label="Price" value={fmtUsd(c.stockPrice)} />
              <StatChip label="Mkt Cap" value={fmtB(c.marketCap)} />
              <StatChip label="Employees" value={fmtNum(c.employees)} />
              <StatChip label="52w Range" value={`${fmtUsd(c.week52Low)} — ${fmtUsd(c.week52High)}`} />
              <StatChip label="Div Yield" value={c.dividendYield ? fmtPct(c.dividendYield) : "—"} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <HealthGauge score={c.healthScore} size={100} strokeWidth={7} />
          </div>
        </div>

        {/* Health breakdown */}
        <div className="card-elevated" style={{ padding: "var(--sp-2) var(--sp-3)", marginBottom: "var(--sp-3)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "var(--sp-1)" }}>Health Score Breakdown</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {BREAKDOWN_ITEMS.map(item => (
              <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 120, fontSize: 11, color: "var(--text-secondary)" }}>{item.label} ({item.weight})</div>
                <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${bd[item.key] || 0}%`, height: "100%", background: healthColor(c.healthScore), borderRadius: 3, transition: "width 0.4s ease" }} />
                </div>
                <div className="tabular" style={{ width: 28, fontSize: 11, textAlign: "right", color: "var(--text-secondary)" }}>{bd[item.key] || 0}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend charts */}
        <div style={{ marginBottom: "var(--sp-3)" }}>
          <div style={{ display: "flex", gap: 4, marginBottom: "var(--sp-2)" }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setChartTab(t)} style={{
                padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12,
                background: chartTab === t ? "var(--bg-elevated)" : "transparent",
                color: chartTab === t ? "var(--text-primary)" : "var(--text-muted)",
              }}>{t}</button>
            ))}
          </div>
          <div className="card-elevated" style={{ padding: "var(--sp-2)", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart(chartTab, snaps)}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Valuation ratios */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
          {[
            { label: "P/E", value: c.peRatio, med: sectorMedians.peRatio },
            { label: "EV/EBITDA", value: c.evEbitda, med: sectorMedians.evEbitda },
            { label: "P/S", value: c.priceToSales, med: sectorMedians.priceToSales },
            { label: "Debt/EBITDA", value: c.debtToEbitda, med: sectorMedians.debtToEbitda },
          ].map(r => (
            <div key={r.label} className="card-elevated" style={{ padding: "var(--sp-2)", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>{r.label}</div>
              <div className="font-serif tabular" style={{ fontSize: 22, margin: "4px 0" }}>{r.value != null ? r.value.toFixed(1) + "x" : "—"}</div>
              {r.value != null && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                  <div style={{ width: 60, height: 4, background: "var(--border)", borderRadius: 2, position: "relative" }}>
                    <div style={{ position: "absolute", left: `${Math.min((r.value / (r.med * 2)) * 100, 100)}%`, top: -2, width: 8, height: 8, borderRadius: "50%", background: r.value <= r.med ? "var(--teal)" : "var(--red)", transform: "translateX(-50%)" }} />
                  </div>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>med {r.med}x</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Earnings history */}
        <div className="card-elevated" style={{ padding: "var(--sp-2) var(--sp-3)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "var(--sp-1)" }}>Earnings History</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Quarter", "EPS Est", "EPS Actual", "Surprise", ""].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "right", color: "var(--text-muted)", fontWeight: 500, borderBottom: "1px solid var(--border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(c.epsHistory || []).map((e, i) => (
                <tr key={i} style={{ background: i % 2 ? "var(--bg-card)" : "transparent" }}>
                  <td style={{ padding: "6px 8px", textAlign: "right" }}>{e.quarter}</td>
                  <td className="tabular" style={{ padding: "6px 8px", textAlign: "right", color: "var(--text-secondary)" }}>{fmtUsd(e.epsEst)}</td>
                  <td className="tabular" style={{ padding: "6px 8px", textAlign: "right" }}>{fmtUsd(e.epsActual)}</td>
                  <td className="tabular" style={{ padding: "6px 8px", textAlign: "right", color: e.surprise > 0 ? "var(--teal)" : "var(--red)" }}>
                    {e.surprise > 0 ? "+" : ""}{e.surprise.toFixed(1)}%
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "right" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: e.surprise > 0 ? "rgba(0,201,167,0.15)" : "rgba(232,64,64,0.15)", color: e.surprise > 0 ? "var(--teal)" : "var(--red)" }}>
                      {e.surprise > 0 ? "Beat" : "Miss"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function StatChip({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{label}</div>
      <div className="tabular" style={{ fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function renderChart(tab, snaps) {
  const quarters = snaps.map(s => s.quarter);
  switch (tab) {
    case "Revenue":
      return (
        <BarChart data={snaps}>
          <CartesianGrid horizontal vertical={false} stroke="var(--border)" />
          <XAxis dataKey="quarter" {...AXIS_PROPS} />
          <YAxis {...AXIS_PROPS} />
          <Tooltip {...CHART_TOOLTIP} />
          <Bar dataKey="revenue" fill="var(--blue)" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    case "EBITDA%":
      return (
        <AreaChart data={snaps}>
          <CartesianGrid horizontal vertical={false} stroke="var(--border)" />
          <XAxis dataKey="quarter" {...AXIS_PROPS} />
          <YAxis tickFormatter={v => `${(v * 100).toFixed(0)}%`} {...AXIS_PROPS} />
          <Tooltip {...CHART_TOOLTIP} formatter={v => `${(v * 100).toFixed(1)}%`} />
          <Area dataKey="ebitdaMargin" stroke="var(--teal)" fill="var(--teal)" fillOpacity={0.15} />
        </AreaChart>
      );
    case "EPS":
      return (
        <BarChart data={snaps}>
          <CartesianGrid horizontal vertical={false} stroke="var(--border)" />
          <XAxis dataKey="quarter" {...AXIS_PROPS} />
          <YAxis {...AXIS_PROPS} />
          <Tooltip {...CHART_TOOLTIP} />
          <Bar dataKey="epsEst" fill="var(--text-muted)" radius={[2, 2, 0, 0]} name="Estimate" />
          <Bar dataKey="eps" fill="var(--blue)" radius={[2, 2, 0, 0]} name="Actual" />
        </BarChart>
      );
    case "Price":
      return (
        <LineChart data={snaps}>
          <CartesianGrid horizontal vertical={false} stroke="var(--border)" />
          <XAxis dataKey="quarter" {...AXIS_PROPS} />
          <YAxis {...AXIS_PROPS} tickFormatter={v => `$${v}`} />
          <Tooltip {...CHART_TOOLTIP} formatter={v => `$${v.toFixed(2)}`} />
          <Line dataKey="price" stroke="var(--purple)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      );
    case "Health Score":
      return (
        <AreaChart data={snaps}>
          <CartesianGrid horizontal vertical={false} stroke="var(--border)" />
          <XAxis dataKey="quarter" {...AXIS_PROPS} />
          <YAxis domain={[0, 100]} {...AXIS_PROPS} />
          <Tooltip {...CHART_TOOLTIP} />
          <Area dataKey="healthScore" stroke="var(--teal)" fill="var(--teal)" fillOpacity={0.12} strokeWidth={2} />
        </AreaChart>
      );
    default:
      return <div />;
  }
}
