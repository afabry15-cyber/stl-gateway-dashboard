import { getHealthColorClass } from "../utils/healthScore";

export default function HealthScoreGauge({ score, size = "lg", breakdown }) {
  const color = getHealthColorClass(score);
  const sizeClasses = size === "lg" ? "w-28 h-28 text-3xl" : "w-16 h-16 text-lg";

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClasses} rounded-full ${color.bg} ring-4 ${color.ring} flex items-center justify-center`}
      >
        <span className={`font-bold ${color.text}`}>{score}</span>
      </div>

      {breakdown && size === "lg" && (
        <div className="w-full max-w-xs space-y-1.5 mt-2">
          {[
            { label: "Revenue Growth", key: "revenueGrowth", weight: "25%" },
            { label: "Profitability", key: "profitability", weight: "20%" },
            { label: "EPS Momentum", key: "epsMomentum", weight: "20%" },
            { label: "Stock vs S&P", key: "stockPerformance", weight: "15%" },
            { label: "Employment", key: "employment", weight: "10%" },
            { label: "Dividend", key: "dividend", weight: "10%" },
          ].map(({ label, key, weight }) => (
            <div key={key}>
              <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                <span>
                  {label} ({weight})
                </span>
                <span>{Math.round(breakdown[key])}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full">
                <div
                  className={`h-full rounded-full ${color.bar}`}
                  style={{ width: `${Math.round(breakdown[key])}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
