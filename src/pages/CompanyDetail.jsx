import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import useStore from "../store/useStore";
import HealthScoreGauge from "../components/HealthScoreGauge";
import EarningsForm from "../components/EarningsForm";
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  formatEps,
  formatDate,
  sectorBadgeColor,
} from "../utils/formatters";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function CompanyDetail() {
  const { ticker } = useParams();
  const companies = useStore((s) => s.companies);
  const healthHistory = useStore((s) => s.healthHistory);
  const [editing, setEditing] = useState(false);

  const company = companies.find((c) => c.ticker === ticker);
  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Company not found.</p>
        <Link to="/" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const history = healthHistory
    .filter((h) => h.ticker === ticker)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const metrics = [
    { label: "Stock Price", value: `$${company.stockPrice.toFixed(2)}` },
    { label: "Market Cap", value: formatCurrency(company.marketCap) },
    { label: "52-Wk High", value: `$${company.week52High.toFixed(2)}` },
    { label: "52-Wk Low", value: `$${company.week52Low.toFixed(2)}` },
    { label: "YTD Performance", value: formatPercent(company.ytdPerformance), highlight: true },
    { label: "Revenue TTM", value: formatCurrency(company.revenueTTM) },
    { label: "Revenue (Qtr)", value: formatCurrency(company.revenueQuarterly) },
    { label: "Revenue Growth YoY", value: formatPercent(company.revenueGrowthYoY) },
    { label: "Gross Margin", value: formatPercent(company.grossMargin, 1).replace("+", "") },
    { label: "EBITDA Margin", value: formatPercent(company.ebitdaMargin, 1).replace("+", "") },
    { label: "Net Income Margin", value: formatPercent(company.netIncomeMargin, 1).replace("+", "") },
    { label: "EPS", value: formatEps(company.epsActual, company.epsEstimate) },
    { label: "Earnings Surprise", value: `${company.earningsSurprise > 0 ? "+" : ""}${company.earningsSurprise.toFixed(1)}%` },
    { label: "Employees", value: formatNumber(company.employees) },
    { label: "Dividend Yield", value: company.dividendYield ? `${(company.dividendYield * 100).toFixed(2)}%` : "—" },
    { label: "Last Updated", value: formatDate(company.lastUpdated) },
    { label: "Earnings Date", value: formatDate(company.earningsDate) },
  ];

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm text-blue-600 hover:underline">
        &larr; Back to dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{company.ticker}</h1>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${sectorBadgeColor(company.sector)}`}>
              {company.sector}
            </span>
            {!company.hqConfirmed && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                HQ approx.
              </span>
            )}
          </div>
          <p className="text-lg text-gray-600">{company.name}</p>
          <p className="text-sm text-gray-400 mt-1">{company.industry}</p>
        </div>
        <HealthScoreGauge
          score={company.healthScore}
          breakdown={company.healthBreakdown}
          size="lg"
        />
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div
              className={`text-sm font-semibold mt-0.5 ${
                m.highlight
                  ? company.ytdPerformance >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* EPS History */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">EPS Beat/Miss (Last 4 Quarters)</h3>
        <div className="flex gap-2">
          {(company.epsHistory || []).map((beat, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                beat ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              }`}
            >
              {beat ? "B" : "M"}
            </div>
          ))}
        </div>
      </div>

      {/* Health score trend — full history */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Health Score Trend ({history[0]?.quarter} — {history[history.length - 1]?.quarter})
            </h3>
            <div className="flex gap-3 text-xs text-gray-500">
              <span>Low: <span className="font-semibold text-gray-800">{Math.min(...history.map(h => h.score))}</span></span>
              <span>High: <span className="font-semibold text-gray-800">{Math.max(...history.map(h => h.score))}</span></span>
              <span>Current: <span className="font-semibold text-gray-800">{history[history.length - 1]?.score}</span></span>
            </div>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="quarter"
                  tick={{ fontSize: 10 }}
                  interval={3}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(val) => [`${val}/100`, "Health Score"]}
                />
                {/* Color zones */}
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                  fill="url(#scoreGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-400 justify-center">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-red-400 rounded-full inline-block" /> &lt;40 Red</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-amber-400 rounded-full inline-block" /> 40–65 Amber</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-emerald-400 rounded-full inline-block" /> 66+ Green</span>
          </div>
        </div>
      )}

      {/* Earnings form */}
      <div>
        {editing ? (
          <EarningsForm company={company} onClose={() => setEditing(false)} />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Update Earnings
          </button>
        )}
      </div>
    </div>
  );
}
