import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  LineChart,
  Line,
} from "recharts";
import useStore from "../store/useStore";

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16",
];

function SectionTitle({ children }) {
  return <h3 className="text-sm font-semibold text-gray-700 mb-2 mt-6 first:mt-0">{children}</h3>;
}

const TREND_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
];

export default function ChartPanel() {
  const companies = useStore((s) => s.companies);
  const healthHistory = useStore((s) => s.healthHistory);
  const [trendTickers, setTrendTickers] = useState(
    () => [...companies].sort((a, b) => b.marketCap - a.marketCap).slice(0, 5).map(c => c.ticker)
  );

  // Build trend data: pivot healthHistory into { quarter, EMR: 75, SF: 82, ... }
  const trendQuarters = [...new Set(healthHistory.map(h => h.quarter))];
  // Sort quarters chronologically
  trendQuarters.sort((a, b) => {
    const [qa, ya] = [parseInt(a[1]), parseInt(a.split(" ")[1])];
    const [qb, yb] = [parseInt(b[1]), parseInt(b.split(" ")[1])];
    return ya !== yb ? ya - yb : qa - qb;
  });
  const trendData = trendQuarters.map(q => {
    const row = { quarter: q };
    healthHistory.filter(h => h.quarter === q).forEach(h => {
      row[h.ticker] = h.score;
    });
    return row;
  });

  // Top 10 by revenue
  const revenueTop = [...companies]
    .sort((a, b) => b.revenueTTM - a.revenueTTM)
    .slice(0, 10)
    .map((c) => ({ name: c.ticker, revenue: c.revenueTTM }));

  // Margin comparison
  const marginData = [...companies]
    .sort((a, b) => b.ebitdaMargin - a.ebitdaMargin)
    .map((c) => ({
      name: c.ticker,
      gross: +(c.grossMargin * 100).toFixed(1),
      ebitda: +(c.ebitdaMargin * 100).toFixed(1),
      net: +(c.netIncomeMargin * 100).toFixed(1),
    }));

  // YTD performance ranked
  const ytdData = [...companies]
    .sort((a, b) => b.ytdPerformance - a.ytdPerformance)
    .map((c) => ({
      name: c.ticker,
      ytd: +(c.ytdPerformance * 100).toFixed(1),
      fill: c.ytdPerformance >= 0 ? "#10b981" : "#ef4444",
    }));

  // Health score leaderboard
  const healthData = [...companies]
    .sort((a, b) => b.healthScore - a.healthScore)
    .map((c) => ({
      name: c.ticker,
      score: c.healthScore,
      fill: c.healthScore >= 66 ? "#10b981" : c.healthScore >= 40 ? "#f59e0b" : "#ef4444",
    }));

  // Employee vs market cap bubble
  const bubbleData = companies.map((c) => ({
    name: c.ticker,
    employees: c.employees,
    marketCap: c.marketCap,
    revenue: c.revenueTTM,
  }));

  // Sector breakdown
  const sectorCounts = {};
  companies.forEach((c) => {
    sectorCounts[c.sector] = (sectorCounts[c.sector] || 0) + 1;
  });
  const sectorData = Object.entries(sectorCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-2">
      <SectionTitle>Health Score Trends (2016–2025)</SectionTitle>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {companies.map((c) => (
            <button
              key={c.ticker}
              onClick={() =>
                setTrendTickers((prev) =>
                  prev.includes(c.ticker)
                    ? prev.filter((t) => t !== c.ticker)
                    : prev.length < 10
                    ? [...prev, c.ticker]
                    : prev
                )
              }
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                trendTickers.includes(c.ticker)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {c.ticker}
            </button>
          ))}
        </div>
        <div style={{ height: 380 }}>
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
              {trendTickers.map((ticker, i) => (
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
      </div>

      <SectionTitle>Revenue — Top 10 ($M)</SectionTitle>
      <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueTop} margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => `$${v.toLocaleString()}M`} />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SectionTitle>Margin Comparison (%)</SectionTitle>
      <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={marginData} margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="gross" name="Gross" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="ebitda" name="EBITDA" fill="#10b981" radius={[2, 2, 0, 0]} />
            <Bar dataKey="net" name="Net" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SectionTitle>YTD Stock Performance (%)</SectionTitle>
      <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ytdData} margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="ytd" radius={[4, 4, 0, 0]}>
              {ytdData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SectionTitle>Health Score Leaderboard</SectionTitle>
      <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={healthData} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={50} />
            <Tooltip />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {healthData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SectionTitle>Employees vs. Market Cap</SectionTitle>
      <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="employees"
              name="Employees"
              tick={{ fontSize: 11 }}
              label={{ value: "Employees", position: "insideBottom", offset: -5, fontSize: 12 }}
            />
            <YAxis
              dataKey="marketCap"
              name="Market Cap ($M)"
              tick={{ fontSize: 11 }}
              label={{ value: "Mkt Cap ($M)", angle: -90, position: "insideLeft", fontSize: 12 }}
            />
            <ZAxis dataKey="revenue" range={[40, 400]} />
            <Tooltip
              formatter={(val, name) =>
                name === "Market Cap ($M)" ? `$${val.toLocaleString()}M` : val.toLocaleString()
              }
            />
            <Scatter data={bubbleData} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <SectionTitle>Sector Breakdown</SectionTitle>
      <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sectorData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              label={({ name, value }) => `${name} (${value})`}
            >
              {sectorData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
