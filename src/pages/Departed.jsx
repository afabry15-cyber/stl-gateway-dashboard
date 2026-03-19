import { useState } from "react";
import useStore from "../store/useStore";
import { formatCurrency, formatPercent, sectorBadgeColor } from "../utils/formatters";
import { getHealthColorClass } from "../utils/healthScore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const STATUS_LABELS = {
  relocated: "Relocated",
  acquired: "Acquired / Gone Private",
};

const TREND_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16",
];

function DepartedCard({ company }) {
  const color = getHealthColorClass(company.healthScore);
  const isAcquired = company.status === "acquired";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 relative">
      {/* Status ribbon */}
      <div
        className={`absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full ${
          isAcquired
            ? "bg-gray-800 text-white"
            : "bg-indigo-100 text-indigo-700"
        }`}
      >
        {isAcquired ? "Acquired" : "Relocated"}
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{company.ticker}</span>
            {company.stillTrading && (
              <span className="text-xs bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">
                Still trading
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{company.name}</p>
        </div>
        <div
          className={`flex items-center justify-center w-11 h-11 rounded-full ${color.bg} ring-2 ${color.ring}`}
        >
          <span className={`text-base font-bold ${color.text}`}>{company.healthScore}</span>
        </div>
      </div>

      <span
        className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-3 ${sectorBadgeColor(company.sector)}`}
      >
        {company.sector}
      </span>

      <div className="text-sm text-gray-600 space-y-1.5 mb-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Departed</span>
          <span className="font-medium">{company.departureYear}</span>
        </div>
        {company.acquirer && (
          <div className="flex justify-between">
            <span className="text-gray-500">{isAcquired ? "Acquirer" : "Moved to"}</span>
            <span className="font-medium text-right max-w-[60%]">{company.acquirer}</span>
          </div>
        )}
        {company.newLocation && (
          <div className="flex justify-between">
            <span className="text-gray-500">New HQ</span>
            <span className="font-medium">{company.newLocation}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Last Mkt Cap</span>
          <span className="font-medium">{formatCurrency(company.marketCap)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Revenue TTM</span>
          <span className="font-medium">{formatCurrency(company.revenueTTM)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Employees</span>
          <span className="font-medium">{company.employees?.toLocaleString()}</span>
        </div>
      </div>

      {company.note && (
        <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-2">
          {company.note}
        </p>
      )}
    </div>
  );
}

export default function Departed() {
  const getFilteredDeparted = useStore((s) => s.getFilteredDeparted);
  const departedCompanies = getFilteredDeparted();
  const healthHistory = useStore((s) => s.healthHistory);
  const [selectedTickers, setSelectedTickers] = useState(
    () => departedCompanies.map((c) => c.ticker)
  );

  const relocated = departedCompanies.filter((c) => c.status === "relocated");
  const acquired = departedCompanies.filter((c) => c.status === "acquired");

  // Aggregate stats
  const totalLostMarketCap = departedCompanies.reduce((s, c) => s + c.marketCap, 0);
  const totalLostEmployees = departedCompanies.reduce((s, c) => s + c.employees, 0);
  const totalLostRevenue = departedCompanies.reduce((s, c) => s + c.revenueTTM, 0);

  // Trend chart data
  const departedTickers = departedCompanies.map((c) => c.ticker);
  const relevantHistory = healthHistory.filter((h) => departedTickers.includes(h.ticker));
  const trendQuarters = [...new Set(relevantHistory.map((h) => h.quarter))];
  trendQuarters.sort((a, b) => {
    const [qa, ya] = [parseInt(a[1]), parseInt(a.split(" ")[1])];
    const [qb, yb] = [parseInt(b[1]), parseInt(b.split(" ")[1])];
    return ya !== yb ? ya - yb : qa - qb;
  });
  const trendData = trendQuarters.map((q) => {
    const row = { quarter: q };
    relevantHistory.filter((h) => h.quarter === q).forEach((h) => {
      row[h.ticker] = h.score;
    });
    return row;
  });

  const toggle = (ticker) => {
    setSelectedTickers((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Departed Companies</h1>
        <p className="text-sm text-gray-500 mt-1">
          Companies that once called St. Louis home — relocated, acquired, or taken private.
        </p>
      </div>

      {/* Impact summary */}
      <div className="bg-gray-900 text-white rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          What STL Lost
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl font-bold">{departedCompanies.length}</div>
            <div className="text-xs text-gray-400 mt-1">Companies</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{formatCurrency(totalLostMarketCap)}</div>
            <div className="text-xs text-gray-400 mt-1">Combined Market Cap (at departure)</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{formatCurrency(totalLostRevenue)}</div>
            <div className="text-xs text-gray-400 mt-1">Combined Revenue</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalLostEmployees.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">Employees (at departure)</div>
          </div>
        </div>
      </div>

      {/* Health score trends */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Health Score Trends — Departed Companies
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {departedCompanies.map((c) => (
            <button
              key={c.ticker}
              onClick={() => toggle(c.ticker)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedTickers.includes(c.ticker)
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
              }`}
            >
              {c.ticker}
              {!c.stillTrading && (
                <span className="ml-1 opacity-50">({c.departureYear})</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
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
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend />
              {selectedTickers.map((ticker, i) => (
                <Line
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  stroke={TREND_COLORS[i % TREND_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Lines end at the company's last quarter as a public STL-HQ entity (except CHTR/BUD which still trade).
        </p>
      </div>

      {/* Relocated companies */}
      {relocated.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            Relocated HQ ({relocated.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relocated.map((c) => (
              <DepartedCard key={c.ticker} company={c} />
            ))}
          </div>
        </div>
      )}

      {/* Acquired / Gone private */}
      {acquired.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-800" />
            Acquired / Gone Private ({acquired.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {acquired.map((c) => (
              <DepartedCard key={c.ticker} company={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
