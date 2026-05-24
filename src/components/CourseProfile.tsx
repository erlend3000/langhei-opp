import { PROFILE_PATH } from "./profile-path";

export function CourseProfile({ className = "" }: { className?: string }) {
  // Profile y range: y=52 (88 moh, top) to y=596 (31 moh)
  // Extend the fill down to y=700 (represents ~20 moh area, no label)
  const fillBottom = 700;

  // ViewBox with padding for labels
  const vbX = -440;
  const vbY = -20;
  const vbW = 4020;
  const vbH = 950;

  // Y mapping: SVG y=52 → 88moh (top), y=596 → 31moh (bottom)
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
    { dist: 0, label: "0 m" },
    { dist: 0.5, label: "500 m" },
    { dist: 1.0, label: "1000 m" },
    { dist: 1.5, label: "1500 m" },
    { dist: 2.0, label: "2000 m" },
  ];

  return (
    <div className={`relative flex flex-col ${className}`}>
      <svg
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full flex-1"
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
                x="-110" y={y + 18}
                fill="#666" fontSize="56" fontFamily="system-ui, sans-serif"
                textAnchor="end"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Fill area below profile - extended to fillBottom */}
        <path
          d={`${PROFILE_PATH} L 4 ${fillBottom} L 3340 ${fillBottom} Z`}
          fill="url(#profileFillGrad)"
        />

        {/* Profile stroke */}
        <path
          d={PROFILE_PATH}
          fill="none"
          stroke="#cc1a1a"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Start point (bottom left) */}
        <circle cx="4" cy="596" r="32" fill="#001c43" />

        {/* End point (top right) */}
        <circle cx="3340" cy="52" r="32" fill="#cc1a1a" />

        {/* X-axis distance labels - with more space below profile */}
        {distMarkers.map(({ dist, label }) => {
          const x = 4 + dist * pxPerKm;
          return (
            <text
              key={label}
              x={x} y={860}
              fill="#666" fontSize="56" fontFamily="system-ui, sans-serif"
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}
      </svg>

      <p className="text-center text-sm text-gray-500 font-body">
        Fra Gjeving skole (31 moh.) til Toppen av Langhei (88 moh.)
      </p>
    </div>
  );
}
