import { useState } from "react";
import HealthGauge from "./HealthGauge";
import { fmtB, fmtPct, fmtRatio, daysUntil, sectorColor } from "../utils/formatters";

const COLUMNS = [
  { key: "rank", label: "#", w: 36 },
  { key: "ticker", label: "Ticker", w: 70 },
  { key: "name", label: "Company", w: 180 },
  { key: "sector", label: "Sector", w: 120 },
  { key: "healthScore", label: "Health", w: 72 },
  { key: "marketCap", label: "Mkt Cap", w: 90 },
  { key: "revenueTTM", label: "Revenue", w: 90 },
  { key: "ebitdaMargin", label: "EBITDA%", w: 80 },
  { key: "ytdPerformance", label: "YTD%", w: 72 },
  { key: "peRatio", label: "P/E", w: 60 },
  { key: "evEbitda", label: "EV/EBITDA", w: 80 },
  { key: "nextEarningsDate", label: "Earnings", w: 80 },
];

export default function CompanyTable({ companies, onSelect }) {
  const [sortKey, setSortKey] = useState("healthScore");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sorted = [...companies].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (sortKey === "nextEarningsDate") { av = daysUntil(av) ?? 999; bv = daysUntil(bv) ?? 999; }
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "string") return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortAsc ? av - bv : bv - av;
  });

  const cellStyle = { padding: "10px 8px", borderBottom: "1px solid var(--border)" };
  const headerStyle = {
    ...cellStyle,
    position: "sticky", top: 56, zIndex: 10,
    background: "var(--bg-card)", cursor: "pointer",
    fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
    textTransform: "uppercase", letterSpacing: 0.3, userSelect: "none",
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {COLUMNS.map(col => (
              <th key={col.key} onClick={() => handleSort(col.key)}
                style={{ ...headerStyle, width: col.w, textAlign: col.key === "name" ? "left" : "right" }}>
                {col.label}
                {sortKey === col.key && <span style={{ marginLeft: 4 }}>{sortAsc ? "\u25B2" : "\u25BC"}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => {
            const bg = i % 2 === 0 ? "var(--bg-card)" : "var(--bg-elevated)";
            const days = daysUntil(c.nextEarningsDate);
            return (
              <tr key={c.ticker} onClick={() => onSelect(c)} style={{ background: bg, cursor: "pointer", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--border)"}
                onMouseLeave={e => e.currentTarget.style.background = bg}>
                <td style={{ ...cellStyle, textAlign: "right", color: "var(--text-muted)" }}>{i + 1}</td>
                <td style={{ ...cellStyle, textAlign: "right", fontWeight: 700 }}>{c.ticker}</td>
                <td className="truncate" style={{ ...cellStyle, textAlign: "left", maxWidth: 180 }}>{c.name}</td>
                <td style={{ ...cellStyle, textAlign: "right" }}>
                  <span style={{
                    background: sectorColor(c.sector) + "26",
                    color: sectorColor(c.sector),
                    padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500,
                  }}>{c.sector}</span>
                </td>
                <td style={{ ...cellStyle, textAlign: "right" }}>
                  <HealthGauge score={c.healthScore} size={40} strokeWidth={3} />
                </td>
                <td className="tabular" style={{ ...cellStyle, textAlign: "right" }}>{fmtB(c.marketCap)}</td>
                <td className="tabular" style={{ ...cellStyle, textAlign: "right" }}>{fmtB(c.revenueTTM)}</td>
                <td className="tabular" style={{ ...cellStyle, textAlign: "right" }}>{fmtPct(c.ebitdaMargin)}</td>
                <td className="tabular" style={{ ...cellStyle, textAlign: "right", color: c.ytdPerformance >= 0 ? "var(--teal)" : "var(--red)" }}>
                  {c.ytdPerformance >= 0 ? "+" : ""}{(c.ytdPerformance * 100).toFixed(1)}%
                </td>
                <td className="tabular" style={{ ...cellStyle, textAlign: "right" }}>{c.peRatio ? c.peRatio.toFixed(1) : "—"}</td>
                <td className="tabular" style={{ ...cellStyle, textAlign: "right" }}>{c.evEbitda ? fmtRatio(c.evEbitda) : "—"}</td>
                <td className="tabular" style={{ ...cellStyle, textAlign: "right", color: days != null && days <= 7 ? "var(--amber)" : "var(--text-secondary)", fontSize: 12 }}>
                  {days != null ? (days === 0 ? "Today" : `${days}d`) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
