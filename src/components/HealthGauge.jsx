import { healthColor } from "../utils/healthScore";

export default function HealthGauge({ score, size = 80, strokeWidth = 6 }) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2 + 4;
  const circumference = Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const offset = circumference * (1 - pct);
  const color = healthColor(score);

  return (
    <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
      {/* Background arc */}
      <path
        d={`M ${strokeWidth / 2} ${cy} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Foreground arc */}
      <path
        d={`M ${strokeWidth / 2} ${cy} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fill={color}
        fontSize={size * 0.28}
        fontFamily="var(--font-serif)"
        fontWeight="400"
      >
        {score}
      </text>
    </svg>
  );
}
