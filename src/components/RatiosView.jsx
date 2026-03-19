import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, ZAxis, Cell, ReferenceLine } from "recharts";
import { fmtB, sectorColor } from "../utils/formatters";

const CHART_TOOLTIP = {
  contentStyle: { background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 },
};
const AXIS_PROPS = { tick: { fill: "var(--text-secondary)", fontSize: 11 }, axisLine: { stroke: "var(--border)" }, tickLine: false };

const RATIO_COLS = [
  { key: "peRatio", label: "P/E", lower: true },
  { key: "evEbitda", label: "EV/EBITDA", lower: true },
  { key: "priceToSales", label: "P/S", lower: true },
  { key: "debtToEbitda", label: "Debt/EBITDA", lower: true },
];

export default function RatiosView({ companies }) {
  const [sortKey, setSortKey] = useState("evEbitda");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sorted = [...companies].sort((a, b) => {
    const av = a[sortKey] ?? 999, bv = b[sortKey] ?? 999;
    return sortAsc ? av - bv : bv - av;
  });

  // Quartile thresholds per column
  const quartiles = {};
  RATIO_COLS.forEach(col => {
    const vals = companies.map(c => c[col.key]).filter(v => v != null).sort((a, b) => a - b);
    if (vals.length >= 4) {
      quartiles[col.key] = { q1: vals[Math.floor(vals.length * 0.25)], q3: vals[Math.floor(vals.length * 0.75)] };
    }
  });

  function cellBg(key, val) {
    if (val == null || !quartiles[key]) return "transparent";
    const { q1, q3 } = quartiles[key];
    if (val <= q1) return "rgba(0,201,167,0.15)";
    if (val >= q3) return "rgba(232,64,64,0.15)";
    return "transparent";
  }

  // Sector medians
  const sectors = [...new Set(companies.map(c => c.sector))];
  const sectorMedians = {};
  sectors.forEach(s => {
    const cos = companies.filter(c => c.sector === s);
    sectorMedians[s] = {};
    RATIO_COLS.forEach(col => {
      const vals = cos.map(c => c[col.key]).filter(v => v != null).sort((a, b) => a - b);
      sectorMedians[s][col.key] = vals.length ? vals[Math.floor(vals.length / 2)] : null;
    });
  });

  // Revenue per employee
  const rpeData = [...companies].map(c => ({
    ticker: c.ticker,
    rpe: (c.revenueTTM * 1000000) / c.employees,
    sector: c.sector,
  })).sort((a, b) => b.rpe - a.rpe);
  const medianRpe = rpeData.map(d => d.rpe).sort((a, b) => a - b)[Math.floor(rpeData.length / 2)];

  // Dividend scatter
  const divData = companies.filter(c => c.dividendYield && c.dividendYield > 0).map(c => ({
    ticker: c.ticker,
    yield: c.dividendYield * 100,
    netMargin: c.netIncomeMargin * 100,
    marketCap: c.marketCap,
    sector: c.sector,
  }));

  const cell = { padding: "8px 10px", borderBottom: "1px solid var(--border)", textAlign: "right", fontSize: 13 };
  const th = { ...cell, position: "sticky", top: 0, background: "var(--bg-card)", cursor: "pointer", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", fontSize: 11 };

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: "var(--sp-3)" }}>Valuation & Ratios</h2>

      {/* Valuation matrix */}
      <div className="card" style={{ padding: "var(--sp-3)", marginBottom: "var(--sp-4)", overflowX: "auto" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "var(--sp-2)" }}>Valuation Matrix</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: "left", width: 160 }}>Company</th>
              <th style={{ ...th, width: 80 }}>Sector</th>
              {RATIO_COLS.map(col => (
                <th key={col.key} onClick={() => handleSort(col.key)} style={th}>
                  {col.label} {sortKey === col.key && (sortAsc ? "\u25B2" : "\u25BC")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => (
              <tr key={c.ticker} style={{ background: i % 2 ? "var(--bg-elevated)" : "transparent" }}>
                <td style={{ ...cell, textAlign: "left" }}>
                  <span style={{ fontWeight: 600, marginRight: 8 }}>{c.ticker}</span>
                  <span style={{ color: "var(--text-secondary)" }}>{c.name}</span>
                </td>
                <td style={cell}>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 10, background: sectorColor(c.sector) + "26", color: sectorColor(c.sector) }}>{c.sector}</span>
                </td>
                {RATIO_COLS.map(col => (
                  <td key={col.key} className="tabular" style={{ ...cell, background: cellBg(col.key, c[col.key]) }}>
                    {c[col.key] != null ? c[col.key].toFixed(1) + "x" : "—"}
                  </td>
                ))}
              </tr>
            ))}
            {/* Sector median rows */}
            {sectors.map(s => (
              <tr key={s} style={{ background: "var(--bg-base)", borderTop: "2px solid var(--border-accent)" }}>
                <td style={{ ...cell, textAlign: "left", fontStyle: "italic", color: "var(--text-muted)" }}>{s} Median</td>
                <td style={cell} />
                {RATIO_COLS.map(col => (
                  <td key={col.key} className="tabular" style={{ ...cell, color: "var(--text-muted)", fontStyle: "italic" }}>
                    {sectorMedians[s]?.[col.key] != null ? sectorMedians[s][col.key].toFixed(1) + "x" : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Revenue per employee */}
      <div className="card" style={{ padding: "var(--sp-3)", marginBottom: "var(--sp-4)", height: 420 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "var(--sp-2)" }}>Revenue Per Employee</div>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={rpeData} layout="vertical" margin={{ left: 50 }}>
            <CartesianGrid horizontal={false} vertical stroke="var(--border)" />
            <XAxis type="number" {...AXIS_PROPS} tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
            <YAxis dataKey="ticker" type="category" {...AXIS_PROPS} width={45} />
            <ReferenceLine x={medianRpe} stroke="var(--text-muted)" strokeDasharray="4 4" />
            <Tooltip {...CHART_TOOLTIP} formatter={v => `$${(v / 1000000).toFixed(2)}M per employee`} />
            <Bar dataKey="rpe" radius={[0, 4, 4, 0]} barSize={14}>
              {rpeData.map((d, i) => <Cell key={i} fill={sectorColor(d.sector)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dividend scatter */}
      {divData.length > 0 && (
        <div className="card" style={{ padding: "var(--sp-3)", height: 380 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "var(--sp-2)" }}>Dividend Yield vs. Sustainability</div>
          <div style={{ position: "relative", height: "88%" }}>
            <div style={{ position: "absolute", top: 8, right: 16, fontSize: 10, color: "var(--teal)", opacity: 0.5 }}>Sustainable Yield</div>
            <div style={{ position: "absolute", bottom: 32, right: 16, fontSize: 10, color: "var(--amber)", opacity: 0.5 }}>Yield Risk</div>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid horizontal vertical={false} stroke="var(--border)" />
                <XAxis dataKey="yield" name="Div Yield" unit="%" {...AXIS_PROPS} />
                <YAxis dataKey="netMargin" name="Net Margin" unit="%" {...AXIS_PROPS} />
                <ZAxis dataKey="marketCap" range={[40, 400]} />
                <ReferenceLine x={3} stroke="var(--border-accent)" strokeDasharray="4 4" />
                <ReferenceLine y={5} stroke="var(--border-accent)" strokeDasharray="4 4" />
                <Tooltip {...CHART_TOOLTIP} formatter={(v, name) => [`${v.toFixed(1)}%`, name]} labelFormatter={(_, p) => p[0]?.payload?.ticker || ""} />
                <Scatter data={divData}>
                  {divData.map((d, i) => <Cell key={i} fill={sectorColor(d.sector)} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
