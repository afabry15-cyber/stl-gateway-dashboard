import { Link } from "react-router-dom";
import { formatCurrency, formatPercent, sectorBadgeColor } from "../utils/formatters";
import { getHealthColorClass } from "../utils/healthScore";

export default function CompanyCard({ company }) {
  const color = getHealthColorClass(company.healthScore);

  return (
    <Link
      to={`/company/${company.ticker}`}
      className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{company.ticker}</span>
            {!company.hqConfirmed && (
              <span className="text-xs text-gray-400" title="HQ approximate">~</span>
            )}
          </div>
          <p className="text-sm text-gray-600 leading-tight">{company.name}</p>
        </div>
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-full ${color.bg} ring-2 ${color.ring}`}
        >
          <span className={`text-lg font-bold ${color.text}`}>{company.healthScore}</span>
        </div>
      </div>

      <span
        className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-3 ${sectorBadgeColor(company.sector)}`}
      >
        {company.sector}
      </span>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div className="text-gray-500">Mkt Cap</div>
        <div className="text-right font-medium">{formatCurrency(company.marketCap)}</div>
        <div className="text-gray-500">Revenue TTM</div>
        <div className="text-right font-medium">{formatCurrency(company.revenueTTM)}</div>
        <div className="text-gray-500">YTD</div>
        <div
          className={`text-right font-medium ${
            company.ytdPerformance >= 0 ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {formatPercent(company.ytdPerformance)}
        </div>
        <div className="text-gray-500">EBITDA Margin</div>
        <div className="text-right font-medium">
          {formatPercent(company.ebitdaMargin, 1).replace("+", "")}
        </div>
      </div>
    </Link>
  );
}
