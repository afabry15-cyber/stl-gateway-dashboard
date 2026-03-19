import { useState, useMemo } from "react";
import { fmtB, fmtDelta, fmtPct } from "../utils/formatters";
import { healthColor } from "../utils/healthScore";

const ANGLES = [
  { id: "earnings_beat", label: "Earnings Beat" },
  { id: "health_score", label: "Health Score Change" },
  { id: "sector_comparison", label: "Sector Comparison" },
  { id: "employment_trends", label: "Employment Trends" },
  { id: "ytd_performance", label: "YTD Performance" },
  { id: "dividend_spotlight", label: "Dividend Spotlight" },
];

const TONES = ["Analytical", "Provocative", "Optimistic", "Cautionary"];
const FORMATS = ["Standard Post", "Thread Opener", "Short Take", "Data Callout"];

function generatePost(cos, angle, tone, format) {
  if (cos.length === 0) return "Select at least one company.";
  const c = cos[0];
  const multi = cos.length > 1;

  const tonePrefix = {
    Analytical: "Looking at the numbers objectively",
    Provocative: "Here's something people aren't talking about",
    Optimistic: "St. Louis keeps surprising the skeptics",
    Cautionary: "A data point worth watching closely",
  };
  const opener = tonePrefix[tone] || "";

  let body = "";

  switch (angle) {
    case "earnings_beat": {
      const beats = cos.filter(co => co.earningsSurprise > 0);
      const b = beats[0] || c;
      body = `${b.name} (${b.ticker}) just posted a ${b.earningsSurprise > 0 ? "+" : ""}${b.earningsSurprise.toFixed(1)}% earnings surprise.\n\nEPS: $${b.epsActual.toFixed(2)} vs. $${b.epsEstimate.toFixed(2)} estimate\nRevenue TTM: ${fmtB(b.revenueTTM)}\nGrowth: ${fmtDelta(b.revenueGrowthYoY)} YoY\n\nHealth Score: ${b.healthScore}/100\n\n${b.ticker} is ${b.healthScore >= 66 ? "executing" : "showing signs of life"} right here in St. Louis.\n\nWhat's your read?`;
      break;
    }
    case "health_score": {
      const sorted = [...cos].sort((a, b) => b.healthScore - a.healthScore);
      const avg = Math.round(cos.reduce((s, co) => s + co.healthScore, 0) / cos.length);
      body = `I track Health Scores (0-100) for every STL public company.\n\nTop: ${sorted[0].ticker} at ${sorted[0].healthScore}/100\n${multi ? `Bottom: ${sorted[sorted.length - 1].ticker} at ${sorted[sorted.length - 1].healthScore}/100\n` : ""}Average across ${cos.length} companies: ${avg}\n\nWeighted formula: revenue growth (25%), profitability (20%), EPS momentum (20%), stock performance (15%), employment (10%), dividends (10%).\n\nSt. Louis corporate health is a leading indicator for the whole region.`;
      break;
    }
    case "sector_comparison": {
      const sectors = {};
      cos.forEach(co => { if (!sectors[co.sector]) sectors[co.sector] = []; sectors[co.sector].push(co); });
      const lines = Object.entries(sectors).map(([s, arr]) => {
        const avg = Math.round(arr.reduce((sum, co) => sum + co.healthScore, 0) / arr.length);
        return `${s}: avg score ${avg}/100 (${arr.length} co${arr.length > 1 ? "s" : ""})`;
      });
      body = `Sector check across STL public companies:\n\n${lines.join("\n")}\n\nThe spread tells you where St. Louis is winning and where there's work to do.\n\nWhat sector surprises you?`;
      break;
    }
    case "employment_trends": {
      const total = cos.reduce((s, co) => s + co.employees, 0);
      const biggest = [...cos].sort((a, b) => b.employees - a.employees)[0];
      body = `STL public companies employ ${total.toLocaleString()} people.\n\nBiggest: ${biggest.name} — ${biggest.employees.toLocaleString()} employees\nRevenue per employee: $${Math.round((biggest.revenueTTM * 1000000) / biggest.employees).toLocaleString()}\n\nThese aren't just tickers — they're paychecks and career paths for the metro.\n\nWhich STL company would you most want to work at?`;
      break;
    }
    case "ytd_performance": {
      const sorted = [...cos].sort((a, b) => b.ytdPerformance - a.ytdPerformance);
      body = `YTD stock performance for STL public companies:\n\n${sorted.slice(0, 5).map(co => `${co.ticker}: ${fmtDelta(co.ytdPerformance)}`).join("\n")}\n\nLeading: ${sorted[0].ticker} at ${fmtDelta(sorted[0].ytdPerformance)}\n\nThe market is telling us something about where STL momentum lives.\n\nAny surprises?`;
      break;
    }
    case "dividend_spotlight": {
      const payers = cos.filter(co => co.dividendYield && co.dividendYield > 0);
      if (payers.length === 0) { body = "None of the selected companies currently pay a dividend.\n\nSometimes no dividend IS the strategy.\n\nIncome or appreciation — what do you look for?"; break; }
      const top = [...payers].sort((a, b) => b.dividendYield - a.dividendYield)[0];
      body = `Dividend snapshot — STL public companies:\n\n${payers.map(co => `${co.ticker}: ${fmtPct(co.dividendYield)} yield`).join("\n")}\n\nTop yield: ${top.ticker} at ${fmtPct(top.dividendYield)}\n\nFor income investors watching STL.\n\nDo you factor local HQ into your investment thesis?`;
      break;
    }
    default: body = "Select a content angle.";
  }

  if (format === "Short Take") {
    const lines = body.split("\n").filter(l => l.trim());
    body = lines.slice(0, 3).join("\n");
  } else if (format === "Data Callout") {
    body = `\u{1F4CA} DATA CALLOUT\n\n${body}`;
  } else if (format === "Thread Opener") {
    body = `${opener}:\n\n${body}\n\n(Thread \u{1F9F5})`;
  } else {
    body = `${opener}.\n\n${body}`;
  }

  return body;
}

export default function ContentStudio({ companies }) {
  const [selected, setSelected] = useState([]);
  const [angle, setAngle] = useState("earnings_beat");
  const [tone, setTone] = useState("Analytical");
  const [format, setFormat] = useState("Standard Post");
  const [post, setPost] = useState("");
  const [copied, setCopied] = useState(false);

  const toggle = (t) => setSelected(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const selectedCos = useMemo(() => companies.filter(c => selected.includes(c.ticker)), [companies, selected]);

  const handleGenerate = () => {
    setPost(generatePost(selectedCos, angle, tone, format));
    setCopied(false);
  };

  const handleCopy = () => { navigator.clipboard.writeText(post); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleCopyOpen = () => { navigator.clipboard.writeText(post); window.open("https://www.linkedin.com/feed/", "_blank"); };

  const charCount = post.length;
  const charColor = charCount === 0 ? "var(--text-muted)" : charCount < 900 ? "var(--text-secondary)" : charCount <= 1200 ? "var(--teal)" : charCount <= 1300 ? "var(--amber)" : "var(--red)";

  const pill = (active, color) => ({
    padding: "4px 12px", borderRadius: 20, border: "1px solid",
    borderColor: active ? (color || "var(--border-accent)") : "var(--border)",
    background: active ? "var(--bg-elevated)" : "transparent",
    color: active ? "var(--text-primary)" : "var(--text-muted)",
    cursor: "pointer", fontSize: 12, fontFamily: "var(--font-sans)",
  });

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: "var(--sp-3)" }}>Content Studio</h2>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: "var(--sp-3)" }}>
        Generate data-driven LinkedIn posts about St. Louis public companies.
      </p>

      {/* Company selection */}
      <div style={{ marginBottom: "var(--sp-3)" }}>
        <Label>Companies</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {companies.map(c => (
            <button key={c.ticker} onClick={() => toggle(c.ticker)} style={pill(selected.includes(c.ticker))}>{c.ticker}</button>
          ))}
        </div>
      </div>

      {/* Angle */}
      <div style={{ marginBottom: "var(--sp-3)" }}>
        <Label>Content Angle</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ANGLES.map(a => <button key={a.id} onClick={() => setAngle(a.id)} style={pill(angle === a.id)}>{a.label}</button>)}
        </div>
      </div>

      {/* Tone & Format */}
      <div style={{ display: "flex", gap: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
        <div>
          <Label>Tone</Label>
          <div style={{ display: "flex", gap: 6 }}>
            {TONES.map(t => <button key={t} onClick={() => setTone(t)} style={pill(tone === t)}>{t}</button>)}
          </div>
        </div>
        <div>
          <Label>Format</Label>
          <div style={{ display: "flex", gap: 6 }}>
            {FORMATS.map(f => <button key={f} onClick={() => setFormat(f)} style={pill(format === f)}>{f}</button>)}
          </div>
        </div>
      </div>

      {/* Data preview */}
      {selectedCos.length > 0 && (
        <div className="card-elevated" style={{ padding: "var(--sp-2) var(--sp-3)", marginBottom: "var(--sp-3)", fontSize: 12 }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Data Preview — metrics feeding into post</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "var(--sp-2)" }}>
            {selectedCos.map(c => (
              <div key={c.ticker}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{c.ticker}</div>
                <div style={{ color: "var(--text-secondary)" }}>
                  Revenue: {fmtB(c.revenueTTM)} | Growth: {fmtDelta(c.revenueGrowthYoY)} | EBITDA: {fmtPct(c.ebitdaMargin)} | Health: {c.healthScore} | YTD: {fmtDelta(c.ytdPerformance)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleGenerate} disabled={selected.length === 0} style={{
        padding: "10px 24px", borderRadius: 8, border: "none", cursor: selected.length ? "pointer" : "not-allowed",
        background: selected.length ? "var(--teal)" : "var(--border)", color: selected.length ? "#070810" : "var(--text-muted)",
        fontSize: 13, fontWeight: 600, fontFamily: "var(--font-sans)",
      }}>Generate Post</button>

      {post && (
        <div style={{ marginTop: "var(--sp-3)" }}>
          <div className="card" style={{ padding: "var(--sp-3)" }}>
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6, color: "var(--text-primary)" }}>
              {post}
            </pre>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--sp-1)" }}>
            <div style={{ fontSize: 12, color: charColor }} className="tabular">
              {charCount} chars
              {charCount >= 900 && charCount <= 1200 && " — optimal range"}
              {charCount > 1300 && " — over limit"}
            </div>
            <div style={{ display: "flex", gap: "var(--sp-1)" }}>
              <button onClick={handleGenerate} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: 12 }}>
                Regenerate
              </button>
              <button onClick={handleCopy} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: 12 }}>
                {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={handleCopyOpen} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "var(--blue)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                Copy + Open LinkedIn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{children}</div>;
}
