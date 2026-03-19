import { fmtB, fmtNum, daysUntil } from "../utils/formatters";

function KpiCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: "var(--sp-2) var(--sp-3)", flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
        {label}
      </div>
      <div className="font-serif tabular" style={{ fontSize: 28, color: color || "var(--text-primary)", lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function KpiBar({ companies }) {
  const scores = companies.map(c => c.healthScore);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Previous quarter avg
  const prevScores = companies.map(c => {
    const snaps = c.historicalSnapshots || [];
    return snaps.length >= 2 ? snaps[snaps.length - 2].healthScore : c.healthScore;
  });
  const prevAvg = Math.round(prevScores.reduce((a, b) => a + b, 0) / prevScores.length);
  const scoreDelta = avgScore - prevAvg;
  const scoreArrow = scoreDelta > 0 ? "\u25B2" : scoreDelta < 0 ? "\u25BC" : "\u25B6";
  const scoreColor = scoreDelta > 0 ? "var(--teal)" : scoreDelta < 0 ? "var(--red)" : "var(--text-secondary)";

  const totalMktCap = companies.reduce((s, c) => s + c.marketCap, 0);
  const positiveYtd = companies.filter(c => c.ytdPerformance > 0).length;
  const pctPositive = Math.round((positiveYtd / companies.length) * 100);
  const totalEmployees = companies.reduce((s, c) => s + c.employees, 0);

  // Next earnings
  const upcoming = companies
    .map(c => ({ ticker: c.ticker, days: daysUntil(c.nextEarningsDate), date: c.nextEarningsDate }))
    .filter(e => e.days != null && e.days >= 0)
    .sort((a, b) => a.days - b.days);
  const next = upcoming[0];

  return (
    <div style={{ display: "flex", gap: "var(--sp-2)", overflowX: "auto" }}>
      <KpiCard
        label="Avg Health Score"
        value={avgScore}
        sub={<span style={{ color: scoreColor }}>{scoreArrow} {Math.abs(scoreDelta)} vs last Q</span>}
      />
      <KpiCard label="Total Mkt Cap" value={fmtB(totalMktCap)} />
      <KpiCard
        label="% Positive YTD"
        value={`${pctPositive}%`}
        sub={`${positiveYtd} of ${companies.length} companies`}
      />
      <KpiCard
        label="Total Employees"
        value={fmtNum(totalEmployees)}
        sub="Regional economic impact"
      />
      <KpiCard
        label="Next Earnings"
        value={next ? `${next.days}d` : "—"}
        sub={next ? `${next.ticker} — ${next.date}` : ""}
        color="var(--amber)"
      />
    </div>
  );
}
