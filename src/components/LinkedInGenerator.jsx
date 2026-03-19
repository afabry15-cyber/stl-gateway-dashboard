import { useState } from "react";
import useStore from "../store/useStore";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { getHealthColor } from "../utils/healthScore";

const ANGLES = [
  { id: "earnings_beat", label: "Earnings Beat" },
  { id: "health_score", label: "Health Score Change" },
  { id: "sector_comparison", label: "Sector Comparison" },
  { id: "employment_trends", label: "Employment Trends" },
  { id: "ytd_performance", label: "YTD Performance Recap" },
  { id: "dividend_spotlight", label: "Dividend Spotlight" },
];

function generatePost(companies, angle) {
  if (companies.length === 0) return "Select at least one company.";

  const c = companies[0];
  const multi = companies.length > 1;

  switch (angle) {
    case "earnings_beat": {
      const beats = companies.filter((co) => co.earningsSurprise > 0);
      if (beats.length === 0)
        return `No earnings beats among the selected companies this quarter. That tells a story too.\n\nSometimes the most important signal is what *didn't* happen.\n\nWhich STL company are you watching most closely heading into next quarter?`;
      const b = beats[0];
      return `${b.name} just posted a ${b.earningsSurprise.toFixed(1)}% earnings surprise.\n\nEPS came in at $${b.epsActual.toFixed(2)} vs. the $${b.epsEstimate.toFixed(2)} estimate. Revenue hit ${formatCurrency(b.revenueTTM)} TTM with ${formatPercent(b.revenueGrowthYoY)} YoY growth.\n\nHealth Score: ${b.healthScore}/100 (${getHealthColor(b.healthScore)})\n\nSt. Louis doesn't get enough credit for the public companies quietly executing here. ${b.ticker} is one to watch.\n\nWhat's your read on ${b.name}'s trajectory?`;
    }

    case "health_score": {
      const sorted = [...companies].sort((a, b) => b.healthScore - a.healthScore);
      const top = sorted[0];
      const bottom = sorted[sorted.length - 1];
      return `I track a Health Score (0-100) for every public company headquartered in St. Louis.\n\nTop performer: ${top.ticker} at ${top.healthScore}/100\n${multi && bottom !== top ? `Needs attention: ${bottom.ticker} at ${bottom.healthScore}/100\n` : ""}\nThe score weights revenue growth (25%), profitability (20%), EPS momentum (20%), stock performance (15%), employment (10%), and dividends (10%).\n\n${multi ? `Across ${companies.length} STL companies, the average health score is ${Math.round(companies.reduce((s, co) => s + co.healthScore, 0) / companies.length)}.` : `${top.name} is ${top.healthScore >= 66 ? "leading the pack" : top.healthScore >= 40 ? "in the middle of the pack" : "facing headwinds"}.`}\n\nSt. Louis corporate health matters for our entire regional economy. Which companies are you paying attention to?`;
    }

    case "sector_comparison": {
      const sectors = {};
      companies.forEach((co) => {
        if (!sectors[co.sector]) sectors[co.sector] = [];
        sectors[co.sector].push(co);
      });
      const lines = Object.entries(sectors).map(([sector, cos]) => {
        const avg = Math.round(cos.reduce((s, co) => s + co.healthScore, 0) / cos.length);
        return `${sector}: avg health score ${avg}/100 (${cos.length} ${cos.length === 1 ? "company" : "companies"})`;
      });
      return `Sector check across STL public companies:\n\n${lines.join("\n")}\n\nThe spread tells you where St. Louis is winning and where there's work to do.\n\nWe're more than beer and baseball — the corporate base here is diversified and worth tracking.\n\nWhat sector surprises you most?`;
    }

    case "employment_trends": {
      const total = companies.reduce((s, co) => s + co.employees, 0);
      const biggest = [...companies].sort((a, b) => b.employees - a.employees)[0];
      return `St. Louis public companies employ ${total.toLocaleString()} people${multi ? ` across ${companies.length} firms` : ""}.\n\nBiggest employer: ${biggest.name} with ${biggest.employees.toLocaleString()} employees\nMarket cap: ${formatCurrency(biggest.marketCap)}\nRevenue per employee: $${Math.round((biggest.revenueTTM * 1000000) / biggest.employees).toLocaleString()}\n\nThese aren't just ticker symbols — they're paychecks, benefits, and career paths for the metro.\n\nWhich STL company would you most want to work at right now?`;
    }

    case "ytd_performance": {
      const sorted = [...companies].sort((a, b) => b.ytdPerformance - a.ytdPerformance);
      const winner = sorted[0];
      const loser = sorted[sorted.length - 1];
      return `YTD stock performance for STL public companies:\n\n${sorted.slice(0, 5).map((co) => `${co.ticker}: ${formatPercent(co.ytdPerformance)}`).join("\n")}\n${sorted.length > 5 ? `...and ${sorted.length - 5} more\n` : ""}\nLeading: ${winner.ticker} at ${formatPercent(winner.ytdPerformance)}\n${multi && loser !== winner ? `Lagging: ${loser.ticker} at ${formatPercent(loser.ytdPerformance)}\n` : ""}\nThe market is telling us something about where St. Louis corporate momentum lives right now.\n\nAny of these surprise you?`;
    }

    case "dividend_spotlight": {
      const payers = companies.filter((co) => co.dividendYield && co.dividendYield > 0);
      if (payers.length === 0)
        return "None of the selected companies currently pay a dividend. Growth mode — or just not at that stage yet.\n\nSometimes no dividend IS the strategy.\n\nWhat do you look for in STL companies: income or appreciation?";
      const top = [...payers].sort((a, b) => b.dividendYield - a.dividendYield)[0];
      return `Dividend snapshot for STL public companies:\n\n${payers.map((co) => `${co.ticker}: ${(co.dividendYield * 100).toFixed(1)}% yield`).join("\n")}\n\nTop yield: ${top.ticker} at ${(top.dividendYield * 100).toFixed(1)}%\n\nFor income-focused investors watching STL, these are the names returning capital to shareholders.\n\nDo you factor local HQ into your investment decisions?`;
    }

    default:
      return "Select a content angle to generate a post.";
  }
}

export default function LinkedInGenerator() {
  const companies = useStore((s) => s.companies);
  const [selected, setSelected] = useState([]);
  const [angle, setAngle] = useState("earnings_beat");
  const [post, setPost] = useState("");
  const [copied, setCopied] = useState(false);

  const toggle = (ticker) => {
    setSelected((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  };

  const handleGenerate = () => {
    const selectedCos = companies.filter((c) => selected.includes(c.ticker));
    setPost(generatePost(selectedCos, angle));
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = post.length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Select Companies</h3>
        <div className="flex flex-wrap gap-2">
          {companies.map((c) => (
            <button
              key={c.ticker}
              onClick={() => toggle(c.ticker)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selected.includes(c.ticker)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
              }`}
            >
              {c.ticker}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Content Angle</h3>
        <div className="flex flex-wrap gap-2">
          {ANGLES.map((a) => (
            <button
              key={a.id}
              onClick={() => setAngle(a.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                angle === a.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={selected.length === 0}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Generate Post
      </button>

      {post && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
              {post}
            </pre>
          </div>
          <div className="flex items-center justify-between">
            <span
              className={`text-xs ${charCount > 1300 ? "text-red-600 font-medium" : "text-gray-500"}`}
            >
              {charCount} / 1,300 characters
              {charCount > 1300 && " — over optimal limit"}
            </span>
            <button
              onClick={handleCopy}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
