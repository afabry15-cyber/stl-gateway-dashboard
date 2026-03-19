export function formatCurrency(value) {
  if (value == null) return "—";
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`;
  return `$${value.toFixed(0)}M`;
}

export function formatPercent(value, decimals = 1) {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value) {
  if (value == null) return "—";
  return value.toLocaleString();
}

export function formatEps(actual, estimate) {
  if (actual == null) return "—";
  const diff = estimate ? actual - estimate : 0;
  const sign = diff >= 0 ? "+" : "";
  return `$${actual.toFixed(2)} (${sign}${diff.toFixed(2)} vs est)`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function sectorBadgeColor(sector) {
  const map = {
    Industrial: "bg-blue-100 text-blue-800",
    "Financial Services": "bg-purple-100 text-purple-800",
    Healthcare: "bg-pink-100 text-pink-800",
    Consumer: "bg-orange-100 text-orange-800",
    Energy: "bg-yellow-100 text-yellow-800",
    Technology: "bg-cyan-100 text-cyan-800",
    "Real Estate": "bg-green-100 text-green-800",
  };
  return map[sector] || "bg-gray-100 text-gray-800";
}
