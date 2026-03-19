import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine, Legend } from "recharts";
import { sectorColor } from "../utils/formatters";

const COLORS = ["#4fa8ff", "#00c9a7", "#F0A500", "#e84040", "#9b8cff", "#ec4899", "#f97316", "#84cc16", "#06b6d4", "#e879f9", "#fb923c", "#38bdf8", "#a3e635", "#f472b6", "#818cf8"];

const CHART_TOOLTIP = {
  contentStyle: { background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 },
};
const AXIS_PROPS = { tick: { fill: "var(--text-secondary)", fontSize: 11 }, axisLine: { stroke: "var(--border)" }, tickLine: false };

const SUB_TABS = ["Health Scores Over Time", "Margin Compression / Expansion", "Revenue Momentum"];

export default function TrendsView({ companies }) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);
  const [selected, setSelected] = useState(new Set(companies.map(c => c.ticker)));

  const toggle = (t) => setSelected(prev => {
    const next = new Set(prev);
    next.has(t) ? next.delete(t) : next.add(t);
    return next;
  });

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: "var(--sp-2)" }}>Trends</h2>
      <div style={{ display: "flex", gap: 4, marginBottom: "var(--sp-3)" }}>
        {SUB_TABS.map(t => (
          <button key={t} onClick={() => setSubTab(t)} style={{
            padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12,
            background: subTab === t ? "var(--bg-elevated)" : "transparent",
            color: subTab === t ? "var(--text-primary)" : "var(--text-muted)",
          }}>{t}</button>
        ))}
      </div>

      {subTab === SUB_TABS[0] && <HealthTrends companies={companies} selected={selected} toggle={toggle} />}
      {subTab === SUB_TABS[1] && <MarginDelta companies={companies} />}
      {subTab === SUB_TABS[2] && <RevenueMomentum companies={companies} />}
    </div>
  );
}

function HealthTrends({ companies, selected, toggle }) {
  const quarters = companies[0]?.historicalSnapshots?.map(s => s.quarter) || [];
  const data = quarters.map((q, qi) => {
    const row = { quarter: q };
    companies.forEach(c => {
      if (c.historicalSnapshots?.[qi]) row[c.ticker] = c.historicalSnapshots[qi].healthScore;
    });
    return row;
  });

  // Find top improvers / decliners
  const deltas = companies.map(c => {
    const snaps = c.historicalSnapshots || [];
    const d = snaps.length >= 2 ? snaps[snaps.length - 1].healthScore - snaps[0].healthScore : 0;
    return { ticker: c.ticker, delta: d };
  }).sort((a, b) => b.delta - a.delta);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: "var(--sp-2)" }}>
        {companies.map(c => (
          <button key={c.ticker} onClick={() => toggle(c.ticker)} style={{
            padding: "3px 10px", borderRadius: 20, border: "1px solid",
            borderColor: selected.has(c.ticker) ? "var(--border-accent)" : "var(--border)",
            background: selected.has(c.ticker) ? "var(--bg-elevated)" : "transparent",
            color: selected.has(c.ticker) ? "var(--text-primary)" : "var(--text-muted)",
            cursor: "pointer", fontSize: 11,
          }}>{c.ticker}</button>
        ))}
      </div>
      <div className="card" style={{ padding: "var(--sp-3)", height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid horizontal vertical={false} stroke="var(--border)" />
            <XAxis dataKey="quarter" {...AXIS_PROPS} />
            <YAxis domain={[0, 100]} {...AXIS_PROPS} />
            <Tooltip {...CHART_TOOLTIP} />
            {companies.filter(c => selected.has(c.ticker)).map((c, i) => (
              <Line key={c.ticker} dataKey={c.ticker} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", gap: "var(--sp-4)", marginTop: "var(--sp-2)", fontSize: 12 }}>
        <div>
          <span style={{ color: "var(--text-muted)" }}>Top improvers: </span>
          {deltas.slice(0, 3).map(d => (
            <span key={d.ticker} style={{ color: "var(--teal)", marginRight: 8 }}>{d.ticker} +{d.delta}</span>
          ))}
        </div>
        <div>
          <span style={{ color: "var(--text-muted)" }}>Top decliners: </span>
          {deltas.slice(-3).reverse().map(d => (
            <span key={d.ticker} style={{ color: "var(--red)", marginRight: 8 }}>{d.ticker} {d.delta}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarginDelta({ companies }) {
  const data = companies.map(c => {
    const snaps = c.historicalSnapshots || [];
    const first = snaps[0]?.ebitdaMargin || 0;
    const last = snaps[snaps.length - 1]?.ebitdaMargin || 0;
    return { ticker: c.ticker, first: first * 100, last: last * 100, delta: (last - first) * 100 };
  }).sort((a, b) => b.delta - a.delta);

  return (
    <div className="card" style={{ padding: "var(--sp-3)", height: 420 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 50 }}>
          <CartesianGrid horizontal={false} vertical stroke="var(--border)" />
          <XAxis type="number" {...AXIS_PROPS} tickFormatter={v => `${v.toFixed(1)}%`} />
          <YAxis dataKey="ticker" type="category" {...AXIS_PROPS} width={45} />
          <Tooltip {...CHART_TOOLTIP} formatter={v => `${v.toFixed(1)}%`} />
          <Bar dataKey="first" name="Q2 2024" fill="var(--text-muted)" radius={[0, 2, 2, 0]} barSize={8} />
          <Bar dataKey="last" name="Current" radius={[0, 4, 4, 0]} barSize={8}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.delta >= 0 ? "var(--teal)" : "var(--red)"} />
            ))}
          </Bar>
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RevenueMomentum({ companies }) {
  const data = [...companies].sort((a, b) => b.revenueGrowthYoY - a.revenueGrowthYoY).map(c => ({
    ticker: c.ticker,
    growth: c.revenueGrowthYoY * 100,
  }));
  const spMedian = 5;

  return (
    <div className="card" style={{ padding: "var(--sp-3)", height: 420 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 50 }}>
          <CartesianGrid horizontal={false} vertical stroke="var(--border)" />
          <XAxis type="number" {...AXIS_PROPS} tickFormatter={v => `${v}%`} />
          <YAxis dataKey="ticker" type="category" {...AXIS_PROPS} width={45} />
          <Tooltip {...CHART_TOOLTIP} formatter={v => `${v.toFixed(1)}%`} />
          <ReferenceLine x={spMedian} stroke="var(--text-muted)" strokeDasharray="4 4" label={{ value: "S&P median", fill: "var(--text-muted)", fontSize: 10, position: "top" }} />
          <Bar dataKey="growth" name="Rev Growth" radius={[0, 4, 4, 0]} barSize={14}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.growth > 10 ? "var(--teal)" : d.growth >= 0 ? "var(--amber)" : "var(--red)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
