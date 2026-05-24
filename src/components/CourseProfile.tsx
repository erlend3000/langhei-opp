import { PROFILE_PATH } from "./profile-path";

export function CourseProfile({ className = "" }: { className?: string }) {
  // ViewBox: x range 0–3374, profile y range ~52–596
  const vbX = -280;
  const vbY = -20;
  const vbW = 3800;
  const vbH = 760;

  // Y mapping: SVG y=52 → 88moh (top), y=596 → 31moh (bottom)
  // Elevation range: 31–88 = 57m. Grid at 30, 50, 70, 90m.
  const pxPerMeter = (596 - 52) / (88 - 31);
  const elevToY = (elev: number) => 596 - (elev - 31) * pxPerMeter;

  const gridLines = [
    { elev: 30, label: "30m" },
    { elev: 50, label: "50m" },
    { elev: 70, label: "70m" },
    { elev: 90, label: "90m" },
  ];

  // X-axis: total course = 2180m, SVG x range = 4–3340 (width = 3336)
  const pxPerKm = 3336 / 2.18;
  const distMarkers = [
    { dist: 0, label: "0.0 km" },
    { dist: 0.5, label: "0.5 km" },
    { dist: 1.0, label: "1.0 km" },
    { dist: 1.5, label: "1.5 km" },
    { dist: 2.0, label: "2.0 km" },
  ];

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        aria-label="Løypeprofil Langhei Opp"
      >
        <defs>
          <linearGradient id="profileFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cc1a1a" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#cc1a1a" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#cc1a1a" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {gridLines.map(({ elev, label }) => {
          const y = elevToY(elev);
          return (
            <g key={label}>
              <line
                x1="4" y1={y} x2="3340" y2={y}
                stroke="#ddd" strokeWidth="2"
              />
              <text
                x="-30" y={y + 24}
                fill="#666" fontSize="72" fontFamily="system-ui, sans-serif"
                textAnchor="end"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Fill area below profile */}
        <path
          d={`${PROFILE_PATH} L 4 600 L 3340 600 Z`}
          fill="url(#profileFillGrad)"
        />

        {/* Profile stroke */}
        <path
          d={PROFILE_PATH}
          fill="none"
          stroke="#cc1a1a"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Start point (bottom left) */}
        <circle cx="4" cy="596" r="32" fill="#001c43" />

        {/* End point (top right) */}
        <circle cx="3340" cy="52" r="32" fill="#cc1a1a" />

        {/* X-axis distance labels */}
        {distMarkers.map(({ dist, label }) => {
          const x = 4 + dist * pxPerKm;
          return (
            <text
              key={label}
              x={x} y={680}
              fill="#666" fontSize="72" fontFamily="system-ui, sans-serif"
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}
      </svg>

      <p className="text-center text-sm text-gray-500 mt-1 font-body">
        Fra Gjeving skole (31 moh.) til Toppen av Langhei (88 moh.)
      </p>
    </div>
  );
}
