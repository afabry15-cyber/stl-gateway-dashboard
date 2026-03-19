import { fmtDelta } from "../utils/formatters";

export default function TickerStrip({ companies }) {
  return (
    <div style={{
      display: "flex", gap: "var(--sp-3)", overflowX: "auto",
      padding: "var(--sp-1) 0", borderBottom: "1px solid var(--border)",
    }}>
      {companies.map(c => (
        <div key={c.ticker} style={{
          display: "flex", alignItems: "center", gap: 6,
          whiteSpace: "nowrap", fontSize: 12,
        }}>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.ticker}</span>
          <span style={{
            color: c.ytdPerformance >= 0 ? "var(--teal)" : "var(--red)",
            fontWeight: 500,
          }}>
            {c.ytdPerformance >= 0 ? "\u25B2" : "\u25BC"} {fmtDelta(c.ytdPerformance)}
          </span>
        </div>
      ))}
    </div>
  );
}
