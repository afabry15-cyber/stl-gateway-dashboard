import HealthGauge from "./HealthGauge";
import Sparkline from "./Sparkline";
import { fmtB, fmtDelta, fmtRatio, daysUntil, sectorColor } from "../utils/formatters";

export default function CompanyCard({ company, onClick }) {
  const c = company;
  const revenueData = (c.historicalSnapshots || []).map(s => s.revenue);
  const days = daysUntil(c.nextEarningsDate);

  const ratingColors = { Buy: "var(--teal)", Hold: "var(--amber)", Sell: "var(--red)" };

  return (
    <div className="card" onClick={onClick} style={{
      padding: "var(--sp-3)", cursor: "pointer",
      transition: "border-color 0.15s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-accent)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--sp-2)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{c.ticker}</span>
            {c.analystRating && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4,
                color: ratingColors[c.analystRating] || "var(--text-muted)",
                border: `1px solid ${ratingColors[c.analystRating] || "var(--text-muted)"}`,
              }}>{c.analystRating}</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{c.name}</div>
          <span style={{
            display: "inline-block", marginTop: 6,
            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
            background: sectorColor(c.sector) + "26", color: sectorColor(c.sector),
          }}>{c.sector}</span>
        </div>
        <HealthGauge score={c.healthScore} size={64} strokeWidth={4} />
      </div>

      {/* Sparkline */}
      {revenueData.length > 1 && (
        <div style={{ marginBottom: "var(--sp-2)" }}>
          <Sparkline data={revenueData} width={180} height={24} />
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Revenue trend (6Q)</div>
        </div>
      )}

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 12 }}>
        <MetricRow label="Mkt Cap" value={fmtB(c.marketCap)} />
        <MetricRow label="Revenue" value={fmtB(c.revenueTTM)} />
        <MetricRow label="YTD" value={fmtDelta(c.ytdPerformance)} color={c.ytdPerformance >= 0 ? "var(--teal)" : "var(--red)"} />
        <MetricRow label="Rev Growth" value={fmtDelta(c.revenueGrowthYoY)} color={c.revenueGrowthYoY >= 0 ? "var(--teal)" : "var(--red)"} />
        <MetricRow label="P/E" value={c.peRatio ? c.peRatio.toFixed(1) : "—"} />
        <MetricRow label="EV/EBITDA" value={c.evEbitda ? fmtRatio(c.evEbitda) : "—"} />
      </div>

      {/* Earnings countdown */}
      {days != null && (
        <div style={{
          marginTop: "var(--sp-2)", padding: "4px 8px", borderRadius: 6,
          background: days <= 7 ? "rgba(240,165,0,0.12)" : "var(--bg-elevated)",
          fontSize: 11, color: days <= 7 ? "var(--amber)" : "var(--text-secondary)",
        }}>
          Earnings in {days}d — {c.nextEarningsDate}
        </div>
      )}
    </div>
  );
}

function MetricRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="tabular" style={{ fontWeight: 500, color: color || "var(--text-primary)" }}>{value}</span>
    </div>
  );
}
