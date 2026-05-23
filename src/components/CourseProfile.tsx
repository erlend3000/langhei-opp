export function CourseProfile({ className = "" }: { className?: string }) {
  // Detailed elevation profile traced from GPS data (Løypeprofil.jpeg)
  // ~70 points following the actual contour closely
  const points: [number, number][] = [
    [0.00, 31],
    [0.03, 31],
    [0.06, 32],
    [0.09, 33],
    [0.12, 36],
    [0.15, 39],
    [0.18, 42],
    [0.21, 45],
    [0.24, 48],
    [0.27, 50],
    [0.30, 53],
    [0.33, 56],
    [0.35, 54],
    [0.37, 50],
    [0.39, 48],
    [0.41, 50],
    [0.43, 54],
    [0.45, 58],
    [0.47, 55],
    [0.48, 60],
    [0.50, 65],
    [0.52, 62],
    [0.54, 58],
    [0.56, 54],
    [0.58, 50],
    [0.61, 47],
    [0.64, 44],
    [0.67, 45],
    [0.70, 49],
    [0.72, 47],
    [0.75, 49],
    [0.78, 47],
    [0.80, 45],
    [0.83, 47],
    [0.86, 50],
    [0.89, 52],
    [0.91, 50],
    [0.94, 51],
    [0.97, 54],
    [1.00, 52],
    [1.03, 50],
    [1.06, 53],
    [1.08, 55],
    [1.11, 52],
    [1.14, 50],
    [1.17, 53],
    [1.20, 51],
    [1.23, 50],
    [1.26, 52],
    [1.29, 54],
    [1.32, 52],
    [1.35, 53],
    [1.38, 55],
    [1.41, 53],
    [1.44, 54],
    [1.47, 55],
    [1.50, 55],
    [1.53, 56],
    [1.56, 55],
    [1.59, 58],
    [1.62, 62],
    [1.65, 66],
    [1.68, 70],
    [1.71, 73],
    [1.74, 75],
    [1.76, 72],
    [1.79, 70],
    [1.82, 73],
    [1.85, 77],
    [1.88, 80],
    [1.91, 82],
    [1.94, 84],
    [1.97, 86],
    [2.00, 84],
    [2.03, 83],
    [2.06, 85],
    [2.09, 87],
    [2.12, 88],
    [2.15, 88],
    [2.18, 88],
  ];

  const width = 400;
  const height = 100;
  const padding = { top: 8, bottom: 22, left: 32, right: 10 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const totalDistance = 2.18;
  const minElev = 25;
  const maxElev = 95;

  const scaleX = (km: number) => padding.left + (km / totalDistance) * chartWidth;
  const scaleY = (elev: number) =>
    padding.top + chartHeight - ((elev - minElev) / (maxElev - minElev)) * chartHeight;

  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p[0]).toFixed(1)} ${scaleY(p[1]).toFixed(1)}`)
    .join(" ");

  const areaPath =
    pathData +
    ` L ${scaleX(totalDistance).toFixed(1)} ${scaleY(minElev).toFixed(1)} L ${scaleX(0).toFixed(1)} ${scaleY(minElev).toFixed(1)} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="profileGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d63a3a" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#d63a3a" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaPath} fill="url(#profileGradient)" />

      {/* Profile line */}
      <path d={pathData} fill="none" stroke="#d63a3a" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Y axis labels */}
      {[30, 50, 70, 90].map((elev) => (
        <g key={elev}>
          <text
            x={padding.left - 4}
            y={scaleY(elev) + 3}
            textAnchor="end"
            fontSize="7"
            fill="#1b2a4a"
            opacity="0.6"
          >
            {elev}m
          </text>
          <line
            x1={padding.left}
            y1={scaleY(elev)}
            x2={width - padding.right}
            y2={scaleY(elev)}
            stroke="#1b2a4a"
            strokeOpacity="0.08"
            strokeWidth="0.5"
          />
        </g>
      ))}

      {/* X axis labels */}
      {[0, 0.5, 1.0, 1.5, 2.0].map((km) => (
        <text
          key={km}
          x={scaleX(km)}
          y={height - 5}
          textAnchor="middle"
          fontSize="7"
          fill="#1b2a4a"
          opacity="0.6"
        >
          {km.toFixed(1)}
        </text>
      ))}

      {/* Start and finish markers */}
      <circle cx={scaleX(0)} cy={scaleY(31)} r="2.5" fill="#1b2a4a" />
      <circle cx={scaleX(2.18)} cy={scaleY(88)} r="2.5" fill="#d63a3a" />
    </svg>
  );
}
