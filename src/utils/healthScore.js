const SECTOR_BENCHMARKS = {
  Industrial: 0.05,
  "Financial Services": 0.08,
  Healthcare: 0.06,
  Consumer: 0.04,
  Energy: 0.03,
  Technology: 0.10,
};

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

/**
 * STL Health Score (0–100).
 * Revenue growth 25%, EBITDA margin 20%, EPS momentum 20%,
 * Stock vs S&P 15%, Employment 10%, Dividend 10%.
 */
export function calculateHealthScore(company, spReturn = 0.05) {
  const bm = SECTOR_BENCHMARKS[company.sector] ?? 0.05;
  const delta = company.revenueGrowthYoY - bm;
  const revenueGrowth = clamp(50 + delta * 250, 0, 100);

  const profitability = clamp((company.ebitdaMargin / 0.30) * 100, 0, 100);

  const beats = (company.epsHistory || []).filter(
    e => typeof e === "boolean" ? e : e.surprise > 0
  ).length;
  const epsMomentum = (beats / Math.max((company.epsHistory || []).length, 1)) * 100;

  const rel = company.ytdPerformance - spReturn;
  const stockPerformance = clamp(50 + rel * 167, 0, 100);

  const employment = clamp(20 + Math.log10(Math.max(company.employees, 1)) * 18, 0, 100);

  let dividend = 20;
  if (company.dividendYield && company.dividendYield > 0) {
    dividend = clamp(30 + (company.dividendYield / 0.04) * 70, 30, 100);
  }

  const total = Math.round(clamp(
    revenueGrowth * 0.25 + profitability * 0.20 + epsMomentum * 0.20 +
    stockPerformance * 0.15 + employment * 0.10 + dividend * 0.10,
    0, 100
  ));

  return {
    total,
    breakdown: { revenueGrowth: Math.round(revenueGrowth), profitability: Math.round(profitability), epsMomentum: Math.round(epsMomentum), stockPerformance: Math.round(stockPerformance), employment: Math.round(employment), dividend: Math.round(dividend) },
  };
}

export function healthColor(score) {
  if (score < 40) return "var(--red)";
  if (score <= 65) return "var(--amber)";
  return "var(--teal)";
}
