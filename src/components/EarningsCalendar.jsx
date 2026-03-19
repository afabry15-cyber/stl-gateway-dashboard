import { daysUntil } from "../utils/formatters";

export default function EarningsCalendar({ companies }) {
  const items = companies.map(c => ({
    ...c,
    days: daysUntil(c.nextEarningsDate),
    lastSurprise: (c.epsHistory || [])[0]?.surprise ?? null,
  })).filter(c => c.days != null).sort((a, b) => a.days - b.days);

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: "var(--sp-3)" }}>Earnings Calendar</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--sp-2)" }}>
        {items.map(c => {
          const isPast = c.days < 0;
          const isSoon = c.days >= 0 && c.days <= 7;
          return (
            <div key={c.ticker} className="card" style={{
              padding: "var(--sp-3)",
              opacity: isPast ? 0.4 : 1,
              borderColor: isSoon ? "var(--amber)" : "var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-1)" }}>
                {/* Initials circle */}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "var(--bg-elevated)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "var(--text-secondary)",
                }}>
                  {c.ticker.slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{c.ticker}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{c.name}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 4 }}>
                {c.nextEarningsDate}
              </div>
              <div style={{
                fontSize: 12, fontWeight: 600,
                color: isPast ? "var(--text-muted)" : isSoon ? "var(--amber)" : "var(--text-secondary)",
              }}>
                {isPast ? "Reported" : c.days === 0 ? "TODAY" : `${c.days} days away`}
              </div>
              {c.lastSurprise != null && (
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  <span style={{ color: "var(--text-muted)" }}>Last surprise: </span>
                  <span style={{
                    fontWeight: 600,
                    color: c.lastSurprise > 0 ? "var(--teal)" : "var(--red)",
                  }}>
                    {c.lastSurprise > 0 ? "+" : ""}{c.lastSurprise.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
