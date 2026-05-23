export function CourseProfile({ className = "" }: { className?: string }) {
  // Approximated from the Løypeprofil.jpeg - elevation profile from ~30m to ~90m over ~2km
  const points = [
    [0, 30],
    [0.05, 32],
    [0.1, 35],
    [0.15, 38],
    [0.2, 42],
    [0.25, 48],
    [0.3, 52],
    [0.35, 55],
    [0.4, 60],
    [0.45, 65],
    [0.5, 62],
    [0.55, 58],
    [0.6, 55],
    [0.65, 57],
    [0.7, 60],
    [0.75, 58],
    [0.8, 55],
    [0.85, 53],
    [0.9, 55],
    [0.95, 58],
    [1.0, 60],
    [1.05, 57],
    [1.1, 55],
    [1.15, 53],
    [1.2, 52],
    [1.25, 54],
    [1.3, 56],
    [1.35, 58],
    [1.4, 60],
    [1.45, 62],
    [1.5, 60],
    [1.55, 58],
    [1.6, 60],
    [1.65, 63],
    [1.7, 67],
    [1.75, 72],
    [1.8, 78],
    [1.85, 82],
    [1.9, 85],
    [1.95, 88],
    [2.0, 90],
  ];

  const width = 400;
  const height = 80;
  const padding = { top: 5, bottom: 20, left: 30, right: 10 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minElev = 20;
  const maxElev = 100;

  const scaleX = (km: number) =>
    padding.left + (km / 2.0) * chartWidth;
  const scaleY = (elev: number) =>
    padding.top + chartHeight - ((elev - minElev) / (maxElev - minElev)) * chartHeight;

  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p[0]).toFixed(1)} ${scaleY(p[1]).toFixed(1)}`)
    .join(" ");

  const areaPath =
    pathData +
    ` L ${scaleX(2.0).toFixed(1)} ${scaleY(minElev).toFixed(1)} L ${scaleX(0).toFixed(1)} ${scaleY(minElev).toFixed(1)} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="profileGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d63a3a" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#d63a3a" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaPath} fill="url(#profileGradient)" />

      {/* Profile line */}
      <path d={pathData} fill="none" stroke="#d63a3a" strokeWidth="1.5" />

      {/* Y axis labels */}
      {[30, 50, 70, 90].map((elev) => (
        <g key={elev}>
          <text
            x={padding.left - 4}
            y={scaleY(elev) + 3}
            textAnchor="end"
            fontSize="6"
            fill="#1b2a4a"
            opacity="0.7"
          >
            {elev}m
          </text>
          <line
            x1={padding.left}
            y1={scaleY(elev)}
            x2={width - padding.right}
            y2={scaleY(elev)}
            stroke="#1b2a4a"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          />
        </g>
      ))}

      {/* X axis labels */}
      {[0, 0.5, 1.0, 1.5, 2.0].map((km) => (
        <text
          key={km}
          x={scaleX(km)}
          y={height - 4}
          textAnchor="middle"
          fontSize="6"
          fill="#1b2a4a"
          opacity="0.7"
        >
          {km.toFixed(1)} km
        </text>
      ))}

      {/* Start and end markers */}
      <circle cx={scaleX(0)} cy={scaleY(30)} r="2" fill="#1b2a4a" />
      <circle cx={scaleX(2.0)} cy={scaleY(90)} r="2" fill="#d63a3a" />
    </svg>
  );
}
