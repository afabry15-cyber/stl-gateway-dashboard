import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ZAxis, Cell } from "recharts";
import { sectorColor } from "../utils/formatters";

export default function QuadrantChart({ companies }) {
  const data = companies.map(c => ({
    name: c.ticker,
    x: c.revenueGrowthYoY * 100,
    y: c.ebitdaMargin * 100,
    z: Math.sqrt(c.marketCap) * 2,
    sector: c.sector,
  }));

  return (
    <div className="card" style={{ padding: "var(--sp-3)" }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "var(--sp-2)" }}>
        Strategic Quadrant — Revenue Growth vs. Profitability
      </div>
      <div style={{ position: "relative", height: 340 }}>
        {/* Quadrant labels */}
        <div style={{ position: "absolute", top: 8, left: 50, fontSize: 10, color: "var(--text-muted)", opacity: 0.6 }}>Cash Cows</div>
        <div style={{ position: "absolute", top: 8, right: 16, fontSize: 10, color: "var(--text-muted)", opacity: 0.6 }}>Stars</div>
        <div style={{ position: "absolute", bottom: 32, left: 50, fontSize: 10, color: "var(--text-muted)", opacity: 0.6 }}>Restructure</div>
        <div style={{ position: "absolute", bottom: 32, right: 16, fontSize: 10, color: "var(--text-muted)", opacity: 0.6 }}>Growers</div>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis dataKey="x" name="Rev Growth" unit="%" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
            <YAxis dataKey="y" name="EBITDA%" unit="%" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
            <ZAxis dataKey="z" range={[40, 600]} />
            <ReferenceLine x={0} stroke="var(--border-accent)" strokeDasharray="4 4" />
            <ReferenceLine y={15} stroke="var(--border-accent)" strokeDasharray="4 4" />
            <Tooltip
              cursor={false}
              contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              formatter={(val, name) => [`${val.toFixed(1)}%`, name]}
              labelFormatter={(_, payload) => payload[0]?.payload?.name || ""}
            />
            <Scatter data={data}>
              {data.map((d, i) => (
                <Cell key={i} fill={sectorColor(d.sector)} fillOpacity={0.8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
