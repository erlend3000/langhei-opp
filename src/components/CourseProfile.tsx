import { PROFILE_PATH } from "./profile-path";

export function CourseProfile({ className = "" }: { className?: string }) {
  const fillPath = `${PROFILE_PATH} L 0 600 L 3374 600 Z`;

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 3374 650"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        aria-label="Løypeprofil Langhei Opp – Gjeving skole → Toppen av Langhei"
      >
        <defs>
          <linearGradient id="profileFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d63a3a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d63a3a" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[
          { y: 52, label: "90m" },
          { y: 185, label: "70m" },
          { y: 370, label: "50m" },
          { y: 555, label: "30m" },
        ].map(({ y, label }) => (
          <g key={label}>
            <line
              x1="120" y1={y} x2="3374" y2={y}
              stroke="#e5e5e5" strokeWidth="2"
            />
            <text
              x="100" y={y + 12}
              fill="#888" fontSize="38" fontFamily="system-ui, sans-serif"
              textAnchor="end"
            >
              {label}
            </text>
          </g>
        ))}

        {/* Fill area below profile */}
        <path d={fillPath} fill="url(#profileFill)" />

        {/* Profile line */}
        <path
          d={PROFILE_PATH}
          fill="none"
          stroke="#d63a3a"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Start point */}
        <circle cx="4" cy="596" r="14" fill="#1b2a4a" />

        {/* End point */}
        <circle cx="3340" cy="52" r="14" fill="#d63a3a" />

        {/* X-axis distance labels */}
        {[
          { x: 120, label: "0.0 km" },
          { x: 840, label: "0.5 km" },
          { x: 1687, label: "1.0 km" },
          { x: 2530, label: "1.5 km" },
          { x: 3300, label: "2.0 km" },
        ].map(({ x, label }) => (
          <text
            key={label}
            x={x} y={635}
            fill="#888" fontSize="38" fontFamily="system-ui, sans-serif"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Caption below */}
      <p className="text-center text-sm text-gray-500 mt-2 font-body">
        Gjeving skole → Toppen av Langhei
      </p>
    </div>
  );
}
