export function fmtB(v) {
  if (v == null) return "—";
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(1)}B`;
  return `$${v.toFixed(0)}M`;
}

export function fmtPct(v, decimals = 1) {
  if (v == null) return "—";
  return `${(v * 100).toFixed(decimals)}%`;
}

export function fmtDelta(v) {
  if (v == null) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${(v * 100).toFixed(1)}%`;
}

export function fmtNum(v) {
  if (v == null) return "—";
  return v.toLocaleString();
}

export function fmtRatio(v) {
  if (v == null) return "—";
  return v.toFixed(1) + "x";
}

export function fmtUsd(v) {
  if (v == null) return "—";
  return `$${v.toFixed(2)}`;
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const parts = dateStr.replace(",", "").split(" ");
  const month = months[parts[0]];
  const day = parseInt(parts[1]);
  const year = parseInt(parts[2]);
  const target = new Date(year, month, day);
  const now = new Date();
  now.setHours(0,0,0,0);
  return Math.ceil((target - now) / 86400000);
}

export function sectorColor(sector) {
  const map = {
    Industrial: "#4fa8ff",
    "Financial Services": "#9b8cff",
    Healthcare: "#e84080",
    Consumer: "#F0A500",
    Energy: "#f97316",
    Technology: "#00c9a7",
  };
  return map[sector] || "#6b7290";
}
