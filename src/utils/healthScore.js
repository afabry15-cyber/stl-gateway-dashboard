// Sector benchmark data for revenue growth comparison
const SECTOR_BENCHMARKS = {
  Industrial: 0.05,
  "Financial Services": 0.08,
  Healthcare: 0.06,
  Consumer: 0.04,
  Energy: 0.03,
  Technology: 0.10,
  "Real Estate": 0.04,
};

/**
 * Calculate the STL Health Score (0-100) for a company.
 *
 * Weights:
 *   Revenue growth vs. sector benchmark  25%
 *   Profitability (EBITDA margin)         20%
 *   EPS momentum (beat/miss last 4 Qs)   20%
 *   Stock performance vs. S&P 500        15%
 *   Employment stability/growth           10%
 *   Dividend consistency                  10%
 */
export function calculateHealthScore(company, spReturn = 0.05) {
  const scores = {};

  // 1. Revenue growth (25%) — scored against sector benchmark
  const benchmark = SECTOR_BENCHMARKS[company.sector] ?? 0.05;
  const growthDelta = company.revenueGrowthYoY - benchmark;
  // Map: -20pp below → 0, at benchmark → 50, +20pp above → 100
  scores.revenueGrowth = clamp(50 + growthDelta * 250, 0, 100);

  // 2. Profitability — EBITDA margin (20%)
  // Map: 0% → 0, 15% → 50, 30%+ → 100
  scores.profitability = clamp((company.ebitdaMargin / 0.30) * 100, 0, 100);

  // 3. EPS momentum (20%) — beat/miss trend over last 4 quarters
  const beats = (company.epsHistory || []).filter(Boolean).length;
  scores.epsMomentum = (beats / 4) * 100;

  // 4. Stock performance relative to S&P 500 (15%)
  const relPerf = company.ytdPerformance - spReturn;
  // Map: -30pp → 0, even → 50, +30pp → 100
  scores.stockPerformance = clamp(50 + relPerf * 167, 0, 100);

  // 5. Employment stability (10%) — proxy: larger employee base → more stable
  // Simple heuristic: 1000 → 30, 10000 → 60, 50000+ → 90
  scores.employment = clamp(
    20 + Math.log10(Math.max(company.employees, 1)) * 18,
    0,
    100
  );

  // 6. Dividend consistency (10%)
  if (company.dividendYield && company.dividendYield > 0) {
    // Map: 0% → 30, 2% → 60, 4%+ → 100
    scores.dividend = clamp(30 + (company.dividendYield / 0.04) * 70, 30, 100);
  } else {
    scores.dividend = 20; // No dividend gets a low but non-zero base
  }

  // Weighted composite
  const composite =
    scores.revenueGrowth * 0.25 +
    scores.profitability * 0.2 +
    scores.epsMomentum * 0.2 +
    scores.stockPerformance * 0.15 +
    scores.employment * 0.1 +
    scores.dividend * 0.1;

  return {
    total: Math.round(clamp(composite, 0, 100)),
    breakdown: scores,
  };
}

export function getHealthColor(score) {
  if (score < 40) return "red";
  if (score <= 65) return "amber";
  return "green";
}

export function getHealthColorClass(score) {
  if (score < 40) return { bg: "bg-red-100", text: "text-red-700", ring: "ring-red-500", bar: "bg-red-500" };
  if (score <= 65) return { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-500", bar: "bg-amber-500" };
  return { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-500", bar: "bg-emerald-500" };
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}
